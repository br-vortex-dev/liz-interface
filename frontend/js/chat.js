/* ============================================================
 *  Liz Chat — chat.js
 *  Orquestra a aplicação: inicializa a UI, cuida do envio de
 *  mensagens, transição entre estados (inicial → conversa),
 *  resposta simulada e conecta os eventos do menu flutuante.
 * ============================================================ */

const LizChat = {
  /** Estado da conversa atual */
  messages: [],
  currentTitle: null,          // título da conversa atual
  currentConversationId: null, // id da conversa salva (persistência por id, não por título)
  isGenerating: false,         // lock: uma geração por vez
  _stopRequested: false,       // usuário pediu para parar a geração
  messageReactions: {},        // { [msgIndex]: { [reactionKey]: count } }
  isFocused: false,
  backendConversationId: null, // ID da conversa no backend (quando online)
  selectedModel: localStorage.getItem('liz-model') || 'liz-3', // modelo ativo

  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB

  init() {
    // Carrega conversas e uploads salvos
    LizData.loadSavedConversations();
    LizData.loadUploadedFiles();

    // 1. Monta a UI
    LizUI.init();
    LizUI.renderBrand();
    LizUI.renderSuggestions();
    LizUI.renderStarters();
    LizUI.renderPanels();
    LizUI.initTheme();
    LizUI.bindMessageActions();

    // 2. Componentes auxiliares
    LizUI.renderSearchBar();
    LizUI.renderScrollButton();
    LizUI.initDragDrop();

    // 3. Começa no estado inicial (coroa no centro)
    LizUI.showEmptyState();
    LizUI.updateSendState();

    // 4. Conecta eventos
    this._bindEvents();

    // 5. Aplica configurações salvas
    this.applyChatSettings();

    // 6. Otimização: pausa animações quando a página não está visível
    this._initVisibilityOptimization();

    // 7. Executa animação de introdução
    this.runIntroAnimation();

    // Sincroniza o histórico depois que o login foi confirmado.
    this._syncHistoryOnBoot();

    // Verifica disponibilidade do backend (não bloqueia)
    LizAPI.checkBackend().then((online) => {
      if (online) {
        console.log('%cLiz API → backend conectado ✓', 'color:#4ade80;font-weight:600');
      } else {
        console.log('%cLiz API → modo local (backend offline)', 'color:#facc15;font-weight:600');
      }
    });

    console.log('%cLiz Chat pronto ✨', 'color:#a78bfa;font-weight:600');
  },

  /* ===========================================================
   * EVENTOS
   * =========================================================== */
  _bindEvents() {
    const { el } = LizUI;

    // Envio do formulário
    el.form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Durante a geração, o botão de enviar vira "Parar geração"
      if (this.isGenerating) { this.stopGeneration(); return; }
      this.sendMessage();
    });

    // Estado do botão enviar + Enter (sem Shift) + auto-resize
    el.input.addEventListener('input', () => {
      LizUI.updateSendState();
      this._autoResize(el.input);
    });
    el.input.addEventListener('paste', (e) => {
      const clipboard = e.clipboardData;
      if (!clipboard) return;
      const files = Array.from(clipboard.files || []);
      if (!files.length && clipboard.items) {
        Array.from(clipboard.items).forEach((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        });
      }
      if (files.length) {
        e.preventDefault();
        this._handleFiles(files);
        this.toast(files.length === 1 ? 'Arquivo colado e anexado' : files.length + ' arquivos colados e anexados');
      }
    });

    el.input.addEventListener('keydown', (e) => {
      const enterSends = localStorage.getItem('liz-enter-send') !== 'false';
      if (e.key === 'Enter' && !e.shiftKey) {
        if (enterSends) {
          e.preventDefault();
          if (this.isGenerating) { this.stopGeneration(); return; }
          this.sendMessage();
        }
        // Se enterSends for false, o Enter padrão adiciona nova linha (comportamento nativo)
      }
      // Ctrl+Enter sempre envia, independente da config
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (this.isGenerating) { this.stopGeneration(); return; }
        this.sendMessage();
      }
      // Tab no textarea: sempre previne tabulação e pula para o
      // próximo elemento focável (evita ficar preso no loop)
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (el.sendBtn && !el.sendBtn.disabled) {
          el.sendBtn.focus();
        } else {
          // Pula para o próximo elemento focável no ciclo
          const taIdx = this._tabFocusable.indexOf(el.input);
          const next = this._tabFocusable.find((e, i) => i > taIdx && !e.disabled);
          (next || this._tabFocusable[0])?.focus();
        }
      }
    });

    // Coroa no header — recolhe/expande o menu lateral
    el.crownToggle.addEventListener('click', () => LizUI.toggleTools());
    el.crownToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        LizUI.toggleTools();
      }
    });

    // Seletor de modelo
    this._bindModelSelector();

    // No mobile, o botão no topo abre o painel de conversas
    el.mobileMenuBtn.addEventListener('click', () => LizUI.openPanel('conversations'));

    // Anexar — abre seletor de arquivos
    el.attachBtn.addEventListener('click', () => LizUI.triggerFilePicker());

    // File input change
    el.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this._handleFiles(e.target.files);
        e.target.value = '';
      }
    });

    // Drag & drop na área de conteúdo
    const dropTargets = [el.contentWrap, document.querySelector('.chat-main')];
    dropTargets.forEach((target) => {
      if (!target) return;
      target.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        LizUI.showDragOverlay();
      });
      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      target.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Só esconde se sair do alvo completamente
        if (e.target === target || !target.contains(e.relatedTarget)) {
          LizUI.hideDragOverlay();
        }
      });
      target.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        LizUI.hideDragOverlay();
        if (e.dataTransfer.files.length) {
          this._handleFiles(e.dataTransfer.files);
        }
      });
    });

    // Preview modal events
    // Delegated click para imagens nas mensagens
    el.messagesList.addEventListener('click', (e) => {
      const previewBtn = e.target.closest('.file-image-preview, .ai-image-preview');
      if (previewBtn) {
        const img = previewBtn.querySelector('img');
        if (img) {
          LizUI.openPreview(img.src, previewBtn.dataset.fileName || img.alt);
        }
        return;
      }
    });

    // Fechar preview: overlay, botão X, Esc
    el.previewOverlay?.addEventListener('click', (e) => {
      if (e.target === el.previewOverlay) LizUI.closePreview();
    });
    el.previewClose?.addEventListener('click', () => LizUI.closePreview());

    // Menu flutuante (pílulas laterais)
    document.querySelectorAll('.float-pill[data-action]').forEach((pill) => {
      pill.addEventListener('click', () => this._handlePill(pill.dataset.action));
    });

    // Fechar painéis: overlay, botão X, Esc
    el.overlay.addEventListener('click', () => LizUI.closePanel());
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => LizUI.closePanel());
    });
    document.addEventListener('keydown', (e) => {
      // === ATALHOS DE TECLADO ===

      // Escape: fecha painéis, preview, galeria, sai do foco
      if (e.key === 'Escape') {
        if (this.isFocused) { this.exitFocusMode(); return; }
        if (el.previewOverlay?.classList.contains('is-visible')) { LizUI.closePreview(); return; }
        LizUI.closePanel();
        return;
      }

      // Ctrl/Cmd + N: Nova conversa
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.newConversation();
        return;
      }

      // Ctrl/Cmd + E: Modo foco
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.toggleFocusMode();
        return;
      }

      // Ctrl/Cmd + Shift + Delete: Limpar conversa
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        if (this.messages.length > 0 && confirm('Limpar toda a conversa atual?')) {
          this.newConversation();
          this.toast('Conversa limpa');
        }
        return;
      }

      // Ctrl/Cmd + F: Busca na conversa
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        if (this.messages.length > 0) {
          e.preventDefault();
          LizUI.showSearchBar();
        }
        return;
      }

      // / (barra): Foca no input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement !== el.input) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          el.input.focus();
        }
      }
    });

    // Focus mode: botão de sair
    const focusExitBtn = document.getElementById('focus-exit-btn');
    if (focusExitBtn) {
      focusExitBtn.addEventListener('click', () => this.exitFocusMode());
    }

    // Busca no painel de conversas
    el.conversationsSearch.addEventListener('input', (e) => {
      LizUI._renderConversations(e.target.value);
    });

    // Abrir conversa a partir do card (painel) + ações fixar/renomear/excluir
    el.conversationsContent.addEventListener('click', (e) => {
      const actBtn = e.target.closest('.conv-act');
      const card = e.target.closest('.conv-card');
      if (!card) return;
      const convId = card.dataset.id;

      // Ações nos botões do card
      if (actBtn) {
        e.stopPropagation();
        const act = actBtn.dataset.act;
        if (act === 'pin') {
          LizData.togglePinConversation(convId);
          LizUI._renderConversations(el.conversationsSearch?.value || '');
        } else if (act === 'rename') {
          const conv = LizData.getConversationById(convId);
          this._renameConversationPrompt(conv);
        } else if (act === 'delete') {
          this._deleteConversationConfirm(convId);
        }
        return;
      }

      const savedConv = LizData.getConversationById(convId);
      if (savedConv) {
        LizUI.closePanel();
        this.openConversationById(savedConv.id);
      }
    });

    // Tab Navigation Mode — ciclo fechado de navegação
    this._initTabNavigation();

    // Esconde o indicador ao interagir com mouse/clique
    document.addEventListener('mousedown', () => {
      const indicator = document.getElementById('tab-nav-indicator');
      if (!indicator) return;
      indicator.classList.remove('is-visible');
      indicator.setAttribute('aria-hidden', 'true');
      clearTimeout(this._tabNavTimer);
    });
  },

  /** Timer para o indicador de navegação Tab */
  _tabNavTimer: null,
  _tabFocusable: [],

  /** Inicializa o ciclo fechado de navegação por Tab. */
  _initTabNavigation() {
    // Lista de seletores dos principais elementos focáveis
    // (elementos intermediários como chips de sugestão fluem naturalmente)
    this._tabSelectors = [
      '#crown-toggle',
      '#theme-toggle',
      '.float-pill[data-action="new"]',
      '.float-pill[data-action="conversations"]',
      '.float-pill[data-action="mural"]',
      '.float-pill[data-action="settings"]',
      '#attach-btn',
      '#chat-input',
      '#send-btn',
    ];

    // Cache inicial (pode ser vazio durante intro — rebuild depois)
    this._rebuildTabFocusable();

    document.addEventListener('keydown', (e) => {
      const indicator = document.getElementById('tab-nav-indicator');

      if (e.key === 'Tab') {
        // Mostra o indicador
        if (indicator) {
          indicator.classList.add('is-visible');
          indicator.setAttribute('aria-hidden', 'false');
          clearTimeout(this._tabNavTimer);
          this._tabNavTimer = setTimeout(() => {
            indicator.classList.remove('is-visible');
            indicator.setAttribute('aria-hidden', 'true');
          }, 4000);
        }

        const els = this._tabFocusable;
        if (!els.length) return;

        const active = document.activeElement;
        const idx = els.indexOf(active);
        const last = els.length - 1;

        // Só interfere nos extremos do ciclo.
        // Elementos não-listados (chips, starters) fluem naturalmente.
        if (idx !== -1) {
          if (e.shiftKey) {
            // Shift+Tab no primeiro → vai para o último
            if (idx <= 0) {
              e.preventDefault();
              els[last]?.focus();
            }
          } else {
            // Tab no último → volta para o primeiro (coroa)
            if (idx === last) {
              e.preventDefault();
              els[0]?.focus();
            }
          }
        }
      }

      // Escape → fecha o indicador
      if (e.key === 'Escape') {
        if (indicator) {
          indicator.classList.remove('is-visible');
          indicator.setAttribute('aria-hidden', 'true');
          clearTimeout(this._tabNavTimer);
        }
      }
    });
  },

  /** Reconstrói a lista de elementos focáveis (chamar após intro/visibility changes). */
  _rebuildTabFocusable() {
    this._tabFocusable = (this._tabSelectors || [])
      .map((sel) => document.querySelector(sel))
      .filter((el) => el && el.offsetParent !== null);
  },

  /** Roteia o clique nas pílulas do menu flutuante. */
  _handlePill(action) {
    // Sempre limpa painel/estado anterior antes de processar nova action
    LizUI._hideMainFloatPanel();

    if (action === 'new') {
      this.newConversation();
      return;
    }
    // Mural → overlay fullscreen
    if (action === 'mural') {
      LizUI.mural.open();
      return;
    }
    // Conversas → float panel ao lado do menu
    if (action === 'conversations') {
      LizUI._showMainFloatPanel(action);
      return;
    }
    // Ajustes → float panel via LizSettings
    if (action === 'settings') {
      LizSettings.showFloatPanel(action);
      return;
    }
    // Fallback: abre painel (para outros casos não mapeados)
    if (LizUI.activePanel === action) {
      LizUI.closePanel();
    } else {
      LizUI.openPanel(action);
    }
  },

  /* ===========================================================
   * SELETOR DE MODELO
   * =========================================================== */
  _bindModelSelector() {
    const btn = document.getElementById('model-selector-btn');
    const dropdown = document.getElementById('model-selector-dropdown');
    const label = document.getElementById('model-selector-label');
    if (!btn || !dropdown || !label) return;

    // Nomes legíveis
    const modelNames = {
      'liz-3': 'Liz 3',
      'liz-3-flash': 'Liz 3 Flash',
      'nable-35-mini': 'Nable 3.5 Mini',
      'nable-35': 'Nable 3.5',
    };

    // Restaura modelo salvo
    label.textContent = modelNames[this.selectedModel] || 'Liz 3';
    this._syncModelActive(dropdown);

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      if (isOpen) {
        this._closeModelDropdown();
      } else {
        dropdown.classList.add('is-open');
        dropdown.setAttribute('aria-hidden', 'false');
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Seleção de modelo
    dropdown.querySelectorAll('.model-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const model = opt.dataset.model;
        this.selectedModel = model;
        localStorage.setItem('liz-model', model);
        label.textContent = modelNames[model] || model;
        this._syncModelActive(dropdown);

        // Animação de pulso no botão
        btn.classList.remove('just-changed');
        void btn.offsetWidth; // force reflow
        btn.classList.add('just-changed');

        this._closeModelDropdown();
        this.toast('Modelo: ' + (modelNames[model] || model));
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', () => {
      if (dropdown.classList.contains('is-open')) {
        this._closeModelDropdown();
      }
    });

    // Fecha com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        this._closeModelDropdown();
      }
    });
  },

  _closeModelDropdown() {
    const btn = document.getElementById('model-selector-btn');
    const dropdown = document.getElementById('model-selector-dropdown');
    if (!btn || !dropdown) return;
    dropdown.classList.remove('is-open');
    dropdown.setAttribute('aria-hidden', 'true');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  },

  _syncModelActive(dropdown) {
    dropdown.querySelectorAll('.model-option').forEach((opt) => {
      opt.classList.toggle('is-active', opt.dataset.model === this.selectedModel);
    });
  },

  /* ===========================================================
   * CONVERSAS — fixar, renomear, excluir (desktop)
   * =========================================================== */
  _renameConversationPrompt(conv) {
    if (!conv) return;
    const v = prompt('Novo título da conversa:', conv.title);
    if (v && v.trim() && LizData.renameConversation(conv.id, v)) {
      LizUI._renderConversations(LizUI.el.conversationsSearch?.value || '');
      this.toast('Conversa renomeada');
    }
  },

  _deleteConversationConfirm(id) {
    const conv = LizData.getConversationById(id);
    const title = conv ? conv.title : 'esta conversa';
    if (confirm('Excluir "' + title + '"? Essa ação não pode ser desfeita.')) {
      LizData.deleteConversation(id);
      LizUI._renderConversations(LizUI.el.conversationsSearch?.value || '');
      this.toast('Conversa excluída');
    }
  },

  /* ===========================================================
   * MODO FOCO
   * =========================================================== */
  toggleFocusMode() {
    this.isFocused = !this.isFocused;
    const app = document.querySelector('.chat-app');
    const focusBtn = document.getElementById('focus-exit-btn');
    if (!app || !focusBtn) return;

    app.classList.toggle('is-focused', this.isFocused);
    focusBtn.classList.toggle('is-visible', this.isFocused);

    if (this.isFocused) {
      LizUI.closePanel();
      this.toast('Modo foco ativado — pressione Esc para sair');
    }
  },

  exitFocusMode() {
    if (this.isFocused) {
      this.isFocused = false;
      const app = document.querySelector('.chat-app');
      const focusBtn = document.getElementById('focus-exit-btn');
      if (app) app.classList.remove('is-focused');
      if (focusBtn) focusBtn.classList.remove('is-visible');
    }
  },

  /* ===========================================================
   * ENVIO DE MENSAGEM
   * =========================================================== */
  sendMessage() {
    const { el } = LizUI;
    if (this.isGenerating) return; // lock: uma resposta por vez
    if (Date.now() < this._cooldownUntil) {
      const rest = Math.ceil((this._cooldownUntil - Date.now()) / 1000);
      this.toast('Espera ' + rest + 's — o provedor tem limite de requisições');
      return;
    }
    const text = el.input.value.trim();
    if (!text) return;

    // Primeira mensagem → entra em modo conversa
    const wasEmpty = !this.messages.length;
    this.messages.push({ role: 'user', content: text, time: this._now() });
    if (wasEmpty) {
      const autoBase = LizData.autoTitleFromMessages(this.messages) || text.slice(0, 40);
      const title = LizUI.activeMode
        ? (LizConfig.suggestions.find((s) => s.id === LizUI.activeMode)?.status || 'Conversa') + ' — ' + autoBase
        : autoBase;
      this.currentTitle = title;
      LizUI.showConversation(title);
      LizUI.clearMode();
      LizUI.renderMessages(this.messages);
      LizUI.addExportButton();

    } else {
      LizUI.appendMessage(this.messages[this.messages.length - 1], this.messages.length - 1);
    }

    // Limpa o input
    el.input.value = '';
    this._autoResize(el.input);
    LizUI.updateSendState();

    // Salva progresso localmente e recebe um ID estável imediatamente.
    this._saveCurrentConversation();

    // A criação remota começa depois que o ID local já existe, permitindo
    // promovê-lo para o UUID definitivo sem duplicar a conversa.
    if (wasEmpty) {
      this._backendCreatePromise = this._tryCreateBackendConversation(this.currentTitle, this.currentConversationId);
    }

    // Resposta simulada
    this._simulateReply(text);
  },

  /* ===========================================================
   * LOCK DE GERAÇÃO + PARAR GERAÇÃO
   * =========================================================== */
  _beginGeneration() {
    this.isGenerating = true;
    this._stopRequested = false;
    LizUI.setGeneratingState(true);
  },

  _endGeneration() {
    this.isGenerating = false;
    this._stopRequested = false;
    LizUI.setGeneratingState(false);
    // Chamada real ao provedor consome cota: cooldown curto antes do próximo
    // envio evita estourar o rate limit e tomar 429 em sequência.
    if (this._usedBackend) {
      this._usedBackend = false;
      this._startSendCooldown();
    }
  },

  /* ===========================================================
   * COOLDOWN PÓS-ENVIO (respeita o rate limit do provedor)
   * =========================================================== */
  SEND_COOLDOWN_MS: 15000,

  _startSendCooldown() {
    this._cooldownUntil = Date.now() + this.SEND_COOLDOWN_MS;
    LizUI.setCooldownState(true, this.SEND_COOLDOWN_MS);
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._cooldownUntil = 0;
      LizUI.setCooldownState(false);
    }, this.SEND_COOLDOWN_MS);
  },

  /** Usuário clicou em "Parar geração". */
  stopGeneration() {
    if (!this.isGenerating) return;
    this._stopRequested = true;
    LizUI.removeTyping();
  },

  async _simulateReply(userText) {
    await this._streamReply(userText);
  },

  _pickReply(userText) {
    const t = userText.toLowerCase();
    const r = LizData.replies;
    if (/(c[oó]digo|codigo|fun[çc][aã]o|script|react|javascript|\bjs\b)/.test(t)) return r.code[0];
    if (/(design|ui|visual|cor|css|estilo)/.test(t)) return r.design[0];
    if (/(erro|error|bug|falha)/.test(t)) return r.error[0];
    if (/(ideia|ideias|brainstorm|nome|sugest)/.test(t)) return r.ideas[0];
    return r.default[0];
  },

  /* ===========================================================
   * AÇÕES DE NAVEGAÇÃO
   * =========================================================== */

  /** Volta à tela inicial (coroa no centro). */
  newConversation() {
    // Cancela geração em andamento pra não escrever no array errado
    if (this.isGenerating) this._stopRequested = true;

    // Salva a conversa atual antes de limpar
    if (this.messages.length > 0) {
      this._saveCurrentConversation();
    }
    this.messages = [];
    this.currentTitle = null;
    this.currentConversationId = null;
    this.messageReactions = {};
    this.backendConversationId = null;
    this._backendCreatePromise = null;
    LizUI.showEmptyState();
    LizUI.clearMode();
    LizUI.el.title.textContent = 'Liz';
    LizUI.el.input.value = '';
    LizUI.updateSendState();
    LizUI.closePanel();
    LizUI.hideSearchBar();
    LizUI.removeExportButton();
    LizUI.el.input.focus();
  },

  /** Abre uma conversa salva a partir do painel (por id — título pode colidir). */
  async openConversationById(id) {
    let savedConv = LizData.getConversationById(id);
    if (!savedConv) {
      this.toast('Conversa não encontrada');
      return;
    }

    // A listagem remota traz somente a última mensagem. Busca o detalhe
    // completo ao abrir uma conversa com UUID remoto.
    if (!String(id).startsWith('local_') && LizData.isBackendOnline && typeof LizAPI !== 'undefined') {
      try {
        const remote = await LizAPI.getConversation(id);
        const mapped = LizAPI.mapConversationToFrontend(remote);
        const index = LizData.savedConversations.findIndex((c) => String(c.id) === String(id));
        if (index >= 0) {
          LizData.savedConversations[index] = mapped;
          LizData._persistToLocalStorage();
        }
        savedConv = mapped;
      } catch (e) {
        console.warn('[LizChat] Não foi possível carregar a conversa completa:', e.message);
      }
    }

    // Cancela geração em andamento pra não contaminar a nova conversa
    if (this.isGenerating) this._stopRequested = true;

    this.messages = (savedConv.messages || []).map((m) => ({ ...m }));
    this.currentTitle = savedConv.title;
    this.currentConversationId = savedConv.id;
    this.messageReactions = {};
    LizUI.showConversation(this.currentTitle);
    LizUI.renderMessages(this.messages);
    LizUI.updateSendState();
    LizUI.addExportButton();
    LizUI.el.input.focus();
  },

  /* ===========================================================
   * UPLOAD DE ARQUIVOS
   * =========================================================== */
  _handleFiles(files) {
    const validFiles = [];
    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        this.toast('Arquivo muito grande (máx. 10 MB): ' + file.name);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    validFiles.forEach((file, i) => {
      this._attachFile(file, i === validFiles.length - 1);
    });
  },

  /** Anexa um arquivo: envia pro storage do backend (B2) quando online;
   *  se falhar, degrada para base64 local (mesma convenção do chat). */
  async _attachFile(file, isLast) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    // Tenta mandar pro backend primeiro (o conteúdo fica no storage privado)
    let upload = null;
    try {
      if (await LizAPI.checkBackend()) {
        upload = await LizAPI.uploadFile(file, this.backendConversationId);
      }
    } catch (e) {
      console.warn('[LizChat] Upload pro backend falhou, usando modo local:', e.message);
    }

    const wasEmpty = !this.messages.length;
    const msg = {
      role: 'user',
      content: '',
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadId: upload ? upload.id : undefined,
        url: upload ? upload.url : undefined,
      },
      time: this._now(),
    };
    this.messages.push(msg);

    if (wasEmpty) {
      const title = 'Arquivo: ' + file.name.slice(0, 30);
      this.currentTitle = title;
      LizUI.showConversation(title);
      LizUI.clearMode();
      LizUI.renderMessages(this.messages);
      LizUI.addExportButton();
    } else {
      LizUI.appendMessage(this.messages[this.messages.length - 1], this.messages.length - 1);
    }

    // Salva no histórico de uploads (com uploadId o base64 não é persistido)
    LizData.saveUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: upload ? undefined : dataUrl,
      uploadId: upload ? upload.id : undefined,
      url: upload ? upload.url : undefined,
      convTitle: this.currentTitle || 'Nova conversa',
    });

    this._saveCurrentConversation();

    // Persiste a mensagem de arquivo na nuvem (histórico entre dispositivos):
    // o conteúdo está no B2 (uploadId), o banco guarda só a referência.
    if (upload) {
      try {
        if (this._backendCreatePromise) await this._backendCreatePromise;
        if (!this.backendConversationId) {
          await this._tryCreateBackendConversation(this.currentTitle || 'Nova conversa', this.currentConversationId);
        }
        if (this.backendConversationId) {
          await LizAPI.addMessage(this.backendConversationId, {
            content: '',
            role: 'user',
            file: { uploadId: upload.id, name: file.name, size: file.size, type: file.type },
          });
        }
      } catch (e) {
        console.warn('[LizChat] Não deu pra salvar o anexo na nuvem:', e.message);
      }
    }

    // Se for o último arquivo, simula resposta
    if (isLast) {
      this._simulateFileReply(file);
    }
  },

  async _simulateFileReply(file) {
    this._beginGeneration();
    try {
      LizUI.showTyping();
      await this._delay(900);
      LizUI.removeTyping();
      if (this._stopRequested) return;

      const isImage = file.type && file.type.startsWith('image/');
      let reply;
      if (isImage) {
        reply = 'Recebi sua imagem! Posso analisá-la, descrevê-la ou ajudar com edições. O que você gostaria de fazer?';
      } else {
        reply = 'Arquivo recebido! Posso ler o conteúdo, resumir ou extrair informações. Me diga o que precisa.';
      }

      const msg = { role: 'liz', content: reply, demo: true, time: this._now() };
      this.messages.push(msg);
      LizUI.appendMessage(msg, this.messages.length - 1);
      this._saveCurrentConversation();

      // Espelha a resposta local na nuvem (não bloqueia a UI)
      if (this.backendConversationId) {
        LizAPI.addMessage(this.backendConversationId, {
          content: reply,
          role: 'assistant',
          demo: true,
        }).catch(() => { /* conversa segue salva no cache local */ });
      }
    } finally {
      this._endGeneration();
    }
  },

  /* ===========================================================
   * EDIÇÃO DE MENSAGEM
   * =========================================================== */
  editMessage(index, newText) {
    if (index < 0 || index >= this.messages.length) return;
    this.messages[index].content = newText;
    this.messages[index].edited = true;
    // Re-renderiza só esta mensagem
    const newHTML = LizUI._messageHTML(this.messages[index], index);
    LizUI.replaceMessageAtIndex(index, newHTML);
    this._saveCurrentConversation();
    this.toast('Mensagem editada');
  },

  /* ===========================================================
   * REGENERAR RESPOSTA (Refazer)
   * =========================================================== */
  async regenerateMessage(index) {
    if (index < 0 || index >= this.messages.length) return;
    if (this.messages[index].role !== 'liz') return;
    if (this.isGenerating) return;

    // Encontra a mensagem do usuário imediatamente anterior
    let userMsgIndex = index - 1;
    while (userMsgIndex >= 0 && this.messages[userMsgIndex].role !== 'user') {
      userMsgIndex--;
    }
    if (userMsgIndex < 0) return;

    const userText = this.messages[userMsgIndex].content;

    // Remove a resposta antiga
    this.messages.splice(index, 1);
    delete this.messageReactions[index];
    LizUI.renderMessages(this.messages);

    // Gera nova resposta com streaming
    this.toast('Gerando nova resposta...');
    await this._streamReply(userText, index);
  },

  /* ===========================================================
   * CONTINUAR RESPOSTA
   * =========================================================== */
  async continueMessage(index) {
    if (index < 0 || index >= this.messages.length) return;
    if (this.messages[index].role !== 'liz') return;
    if (this.isGenerating) return;

    this._beginGeneration();
    try {
      this.toast('Continuando...');

      // Encontra a mensagem do usuário anterior pra contexto
      let userMsgIndex = index - 1;
      while (userMsgIndex >= 0 && this.messages[userMsgIndex].role !== 'user') {
        userMsgIndex--;
      }
      const userText = userMsgIndex >= 0 ? this.messages[userMsgIndex].content : '';

      // Gera continuacao e append na mensagem existente
      const continuation = this._pickContinuation(userText);
      await this._streamAppendToMessage(index, continuation);
    } finally {
      this._endGeneration();
    }
  },

  _pickContinuation(userText) {
    const continuations = [
      'Além disso, vale considerar que cada decisão de arquitetura tem um custo de manutenção a longo prazo. O que parece simples hoje pode cobrar juros amanhã.',
      'Outro ponto importante: teste o caminho infeliz antes do caminho feliz. Se o sistema não sabe lidar com erro, ele não está pronto.',
      'Pra complementar — se quiser aprofundar, posso detalhar qualquer um desses pontos ou mostrar um exemplo prático. É só pedir.',
    ];
    return continuations[Math.floor(Math.random() * continuations.length)];
  },

  /* ===========================================================
   * STREAMING SIMULADO
   * =========================================================== */
  async _streamReply(userText, insertAtIndex) {
    this._beginGeneration();
    this._usedBackend = false;
    try {
      LizUI.showTyping();

      // Tenta backend primeiro
      let backendOnline = false;
      try {
        if (this._backendCreatePromise) await this._backendCreatePromise;
        backendOnline = await LizAPI.checkBackend();
        if (backendOnline) {
          // Requisição vai consumir cota do provedor (mesmo se falhar):
          // marca pra disparar o cooldown pós-envio.
          this._usedBackend = true;
          const response = await LizAPI.sendMessage(
            this.backendConversationId, userText, LizUI.activeMode || null, this.selectedModel
          );
          LizUI.removeTyping();
          if (this._stopRequested) return; // parou durante a espera
          if (response.conversationId) {
            const previousId = this.currentConversationId;
            this.backendConversationId = response.conversationId;
            if (previousId && String(previousId).startsWith('local_')) {
              LizData.promoteConversationId(previousId, response.conversationId);
            }
            this.currentConversationId = response.conversationId;
          }
          const content = response.assistantMessage?.content || response.reply || 'Sem resposta.';
          const msg = {
            role: 'liz',
            content,
            demo: response.demo === true,
            images: Array.isArray(response.assistantMessage?.images) ? response.assistantMessage.images : [],
            webResults: Array.isArray(response.assistantMessage?.webResults) ? response.assistantMessage.webResults : [],
            time: this._now(),
          };
          if (insertAtIndex !== undefined) {
            this.messages.splice(insertAtIndex, 0, msg);
          } else {
            this.messages.push(msg);
          }
          LizUI.renderMessages(this.messages);
          this._saveCurrentConversation();
          return;
        }
      } catch (e) {
        if (backendOnline) {
          // Backend online mas a chamada falhou: mostra o erro real.
          // Nunca inventa resposta — resposta fake disfarçada era o que
          // fazia parecer que a IA não funcionava.
          LizUI.removeTyping();
          if (this._stopRequested) return;
          LizAPI.online = false; // força nova checagem na próxima mensagem
          const errMsg = { role: 'liz', content: 'Não consegui falar com a IA agora (' + (e.message || 'erro de conexão') + '). Me pede de novo?', time: this._now() };
          if (insertAtIndex !== undefined) this.messages.splice(insertAtIndex, 0, errMsg);
          else this.messages.push(errMsg);
          LizUI.renderMessages(this.messages);
          this._saveCurrentConversation();
          return;
        }
        console.warn('Backend offline — usando modo local:', e.message);
      }

      if (this._stopRequested) { LizUI.removeTyping(); return; }

      // Fallback: simulação local com efeito de digitação
      await this._delay(400);
      LizUI.removeTyping();
      if (this._stopRequested) return;

      const fullText = this._pickReply(userText);
      const msg = { role: 'liz', content: '', time: this._now() };

      if (insertAtIndex !== undefined) {
        this.messages.splice(insertAtIndex, 0, msg);
      } else {
        this.messages.push(msg);
      }

      const msgIndex = insertAtIndex !== undefined ? insertAtIndex : this.messages.length - 1;

      // Se inseriu no meio da lista, re-renderiza tudo pra manter ordem DOM correta.
      // Se é a última posição, append simples basta.
      let node;
      if (insertAtIndex !== undefined && insertAtIndex < this.messages.length - 1) {
        LizUI.renderMessages(this.messages);
        node = LizUI.el.messagesList.querySelectorAll('.msg')[msgIndex];
      } else {
        node = LizUI.appendMessage(msg, msgIndex);
      }

      // Streaming: revela palavra por palavra
      await this._typeWords(node, fullText, msgIndex);
      this._saveCurrentConversation();
    } finally {
      this._endGeneration();
    }
  },

  async _streamAppendToMessage(index, continuationText) {
    const msg = this.messages[index];
    if (!msg) return;

    const msgs = LizUI.el.messagesList.querySelectorAll('.msg');
    const node = msgs[index];
    if (!node) return;

    const textEl = node.querySelector('.msg-text');
    if (!textEl) return;

    // Adiciona separador e streama a continuação
    const separator = '\n\n';
    const words = continuationText.split(' ');
    let accumulated = msg.content + separator;

    for (let i = 0; i < words.length; i++) {
      if (this._stopRequested) break;
      accumulated += (i > 0 ? ' ' : '') + words[i];
      msg.content = accumulated;
      textEl.innerHTML = LizUI._markdown(accumulated);
      await this._delay(25 + Math.random() * 20);
    }

    this._saveCurrentConversation();
  },

  async _typeWords(node, fullText, msgIndex) {
    const textEl = node.querySelector('.msg-text');
    if (!textEl) {
      this.messages[msgIndex].content = fullText;
      return;
    }

    const words = fullText.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      if (this._stopRequested) break; // "Parar geração" — conteúdo parcial fica
      accumulated += (i > 0 ? ' ' : '') + words[i];
      this.messages[msgIndex].content = accumulated;
      textEl.innerHTML = LizUI._markdown(accumulated);
      LizUI._scrollToBottom();
      await this._delay(18 + Math.random() * 22);
    }
  },

  /* ===========================================================
   * DELEÇÃO DE MENSAGEM
   * =========================================================== */
  deleteMessage(index) {
    if (index < 0 || index >= this.messages.length) return;
    this.messages.splice(index, 1);
    // Remove reações associadas
    delete this.messageReactions[index];
    // Re-indexa reações para índices > index
    const newReactions = {};
    Object.keys(this.messageReactions).forEach((key) => {
      const k = parseInt(key);
      if (k > index) {
        newReactions[k - 1] = this.messageReactions[k];
      } else if (k < index) {
        newReactions[k] = this.messageReactions[k];
      }
    });
    this.messageReactions = newReactions;

    if (this.messages.length === 0) {
      this.newConversation();
      this.toast('Mensagem apagada');
      return;
    }
    LizUI.renderMessages(this.messages);
    this._saveCurrentConversation();
    this.toast('Mensagem apagada');
  },

  /* ===========================================================
   * REAÇÕES
   * =========================================================== */
  toggleReaction(msgIndex, reactionKey) {
    if (!this.messageReactions[msgIndex]) {
      this.messageReactions[msgIndex] = {};
    }
    const current = this.messageReactions[msgIndex][reactionKey] || 0;
    // Alterna entre 0 e 1 (like/unlike simples)
    this.messageReactions[msgIndex][reactionKey] = current > 0 ? 0 : 1;
    // Re-renderiza a mensagem
    const msg = this.messages[msgIndex];
    if (msg) {
      const newHTML = LizUI._messageHTML(msg, msgIndex);
      LizUI.replaceMessageAtIndex(msgIndex, newHTML);
    }
  },

  /* ===========================================================
   * EXPORTAR CONVERSA
   * =========================================================== */
  exportConversation() {
    if (this.messages.length === 0) {
      this.toast('Nenhuma mensagem para exportar');
      return;
    }

    const title = this.currentTitle || 'Conversa Liz';
    let md = '# ' + title + '\n\n' + 'Exportado em: ' + new Date().toLocaleString('pt-BR') + '\n\n---\n\n';

    this.messages.forEach((m) => {
      const prefix = m.role === 'user' ? '**Você:**' : '**Liz:**';
      md += prefix + ' ' + m.content + '\n';
      if (m.time) md += '*(' + m.time + ')*';
      md += '\n\n';
    });

    md += '---\n*Exportado por Liz Chat*';

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim().slice(0, 50) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.toast('Conversa exportada!');
  },

  /* ===========================================================
   * PERSISTÊNCIA
   * =========================================================== */
  _saveCurrentConversation() {
    if (this.messages.length === 0) return;
    const title = this.currentTitle || 'Nova conversa';
    if (!this.currentTitle) {
      this.currentTitle = title;
    }
    this.currentConversationId = LizData.saveConversation(
      this.currentTitle, this.messages, this.currentConversationId
    );
  },

  /** Tenta criar a conversa no backend (não bloqueia a UI) */
  async _tryCreateBackendConversation(title, localId) {
    try {
      const online = await LizAPI.checkBackend();
      if (online && !this.backendConversationId) {
        const res = await LizAPI.createConversation(title);
        if (res && res.id) {
          this.backendConversationId = res.id;
          const previousId = localId || this.currentConversationId;
          if (previousId && String(previousId).startsWith('local_')) {
            LizData.promoteConversationId(previousId, res.id);
          }
          this.currentConversationId = res.id;
          console.log('%cLiz API → conversa criada no backend: ' + res.id, 'color:#4ade80');
        }
      }
    } catch (e) {
      console.warn('Não foi possível criar conversa no backend:', e.message);
    }
  },

  /** Aguarda o login e sincroniza o histórico remoto sem travar a interface. */
  async _syncHistoryOnBoot() {
    try {
      const authPromise = typeof window !== 'undefined' ? window.lizAuthReadyPromise : null;
      const authenticated = authPromise ? await authPromise : true;
      if (authenticated === false) return;
      await LizData.syncWithBackend();
    } catch (e) {
      console.warn('[LizChat] Sincronização inicial indisponível:', e.message);
    }
  },

  /* ===========================================================
   * UTILITÁRIOS
   * =========================================================== */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  _now() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  },

  /** Pausa animações quando a página está oculta (economiza CPU/GPU) */
  _initVisibilityOptimization() {
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.documentElement.classList.add('liz-page-hidden');
        } else {
          document.documentElement.classList.remove('liz-page-hidden');
        }
      });
    }
  },

  /** Aplica as configurações de chat em tempo real */
  applyChatSettings() {
    const showTimestamp = localStorage.getItem('liz-timestamp') !== 'false';
    const showAnimations = localStorage.getItem('liz-animations') !== 'false';
    const showGlow = localStorage.getItem('liz-glow') !== 'false';
    const enterSend = localStorage.getItem('liz-enter-send') !== 'false';
    const showSuggestions = localStorage.getItem('liz-show-suggestions') !== 'false';

    // Usa CSS classes para controle em tempo real (funciona pra mensagens novas também)
    document.documentElement.classList.toggle('liz-no-timestamp', !showTimestamp);
    document.documentElement.classList.toggle('liz-no-animations', !showAnimations);
    document.documentElement.classList.toggle('liz-no-glow', !showGlow);
    document.documentElement.classList.toggle('liz-no-suggestions', !showSuggestions);

    // Enter para enviar: atualiza o placeholder
    const input = document.getElementById('chat-input');
    if (input) {
      input.placeholder = enterSend
        ? 'Digite sua mensagem para a Liz...'
        : 'Digite sua mensagem (Ctrl+Enter para enviar)...';
    }
  },

  _autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  },

  /** Toast discreto no rodapé. */
  toast(message) {
    const toast = LizUI.el.toast;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  },

  _introStage: null,
  _introCrown: null,
  _introCrownMover: null,
  _introCrownImg: null,
  _introAnim: null,
  _appReady: false,
  _revealed: false,
  _revealTimer: null,
  CROWN_MOVE_DURATION: 750,
  REVEAL_OVERLAP: 180,
  _minTimeElapsed: false,

  runIntroAnimation() {
    // Nota: a intro é identidade da marca (como na tela de login) —
    // roda mesmo com "reduzir movimento" do sistema (decisão do projeto).
    if (this._introStage) return;

    this._introStage = 'loading';

    const { el } = LizUI;
    const app = document.querySelector('.chat-app');
    if (!app) return;

    app.style.pointerEvents = 'none';

    this._hideAllInterface();

    const crownInInterface = el.emptyState?.querySelector('.empty-crown');
    if (crownInInterface) {
      crownInInterface.style.visibility = 'hidden';
      crownInInterface.style.animation = 'none';
    }

    this._introCrown = document.createElement('div');
    this._introCrown.className = 'intro-crown-wrap';

    const mover = document.createElement('div');
    mover.className = 'intro-crown-mover';
    mover.innerHTML = `<img src="coroa.svg" alt="" class="intro-crown-img" />`;

    this._introCrown.appendChild(mover);
    this._introCrownImg = mover.querySelector('.intro-crown-img');
    this._introCrownMover = mover;

    document.body.appendChild(this._introCrown);

    void this._introCrown.offsetWidth;

    requestAnimationFrame(() => {
      this._introCrown.classList.add('intro-crown-enter');
    });

    setTimeout(() => {
      this._introCrown.classList.add('intro-crown-float');
    }, 480);

    setTimeout(() => {
      this._minTimeElapsed = true;
      this._checkReveal();
    }, 700);

    this._waitForAppReady();
  },

  _hideAllInterface() {
    const elements = [
      document.querySelector('.chat-header'),
      document.getElementById('floating-menu'),
      document.querySelector('.chat-main'),
      document.querySelector('.composer')
    ];

    elements.forEach((el) => {
      if (el) {
        el.style.willChange = 'opacity, transform';
        el.classList.add('intro-interface-hidden');
      }
    });
  },

  _waitForAppReady() {
    let checks = 0;
    const maxChecks = 100;

    const check = () => {
      checks++;
      const fontsReady = !document.fonts || document.fonts.status === 'loaded';
      const layoutReady = this._isLayoutReady();

      if ((fontsReady && layoutReady) || checks >= maxChecks) {
        this._appReady = true;
        this._checkReveal();
        return;
      }

      setTimeout(check, 50);
    };

    setTimeout(check, 100);
  },

  _isLayoutReady() {
    const { el } = LizUI;
    const targetCrown = el.emptyState?.querySelector('.empty-crown');
    if (!targetCrown) return false;

    const rect = targetCrown.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  },

  _checkReveal() {
    if (this._appReady && this._minTimeElapsed && this._introStage === 'loading') {
      this._startCrownMove();
    }
  },

  _startCrownMove() {
    this._introStage = 'moving';

    const mover = this._introCrownMover;
    const crownImg = this._introCrownImg;

    if (!mover || !crownImg) {
      this._finalizeCrown();
      return;
    }

    const { el } = LizUI;
    const targetSlot = el.emptyState?.querySelector('.hero-crown-slot');
    const targetCrown = el.emptyState?.querySelector('.empty-crown');

    if (!targetSlot || !targetCrown) {
      this._finalizeCrown();
      return;
    }

    targetCrown.classList.add('crown-target-only');

    crownImg.classList.add('preparing-to-move');

    setTimeout(() => {
      mover.classList.add('is-moving');
      crownImg.classList.remove('preparing-to-move');

      const movingRect = mover.getBoundingClientRect();
      const slotRect = targetSlot.getBoundingClientRect();

      const movingCenterX = movingRect.left + movingRect.width / 2;
      const movingCenterY = movingRect.top + movingRect.height / 2;
      const targetCenterX = slotRect.left + slotRect.width / 2;
      const targetCenterY = slotRect.top + slotRect.height / 2;

      const deltaX = targetCenterX - movingCenterX;
      const deltaY = targetCenterY - movingCenterY;

      this._introAnim = mover.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)' },
          { transform: `translate3d(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px), 0) scale(1)` }
        ],
        {
          duration: this.CROWN_MOVE_DURATION,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        }
      );

      const revealDelay = this.CROWN_MOVE_DURATION - this.REVEAL_OVERLAP;
      this._revealTimer = setTimeout(() => {
        this._revealInterface();
      }, revealDelay);

      this._introAnim.finished.then(() => {
        clearTimeout(this._revealTimer);
        this._finalizeCrown();
      });
    }, 120);
  },

  _revealInterface() {
    if (this._revealed) return;
    this._revealed = true;

    // Restaura a coroa da tela inicial que foi escondida durante a intro
    const ec = document.getElementById('empty-crown');
    if (ec) {
      ec.classList.remove('crown-target-only');
      ec.style.visibility = '';
      ec.style.animation = '';
    }

    document.documentElement.classList.remove('liz-booting');
    document.documentElement.classList.add('liz-intro-complete');

    const elements = [
      document.querySelector('.chat-header'),
      document.getElementById('floating-menu'),
      document.querySelector('.chat-main'),
      document.querySelector('.composer')
    ];

    elements.forEach((elem) => {
      if (elem) {
        elem.classList.remove('intro-interface-hidden', 'intro-interface-visible');
        elem.style.willChange = '';
      }
    });

    const app = document.querySelector('.chat-app');
    if (app) app.style.pointerEvents = '';

    // Reconstrói navegação Tab agora que os elementos estão visíveis
    this._rebuildTabFocusable();
  },

  _finalizeCrown() {
    if (this._introStage !== 'moving') return;
    this._introStage = 'complete';

    const anim = this._introAnim;
    const mover = this._introCrownMover;
    const crownImg = this._introCrownImg;
    const crownWrap = this._introCrown;

    if (anim) {
      if (typeof anim.commitStyles === 'function') {
        anim.commitStyles();
      }
      anim.cancel();
    }
    this._introAnim = null;

    if (crownImg) {
      crownImg.classList.remove('preparing-to-move');
      crownImg.classList.add('intro-crown-float');
    }

    if (mover) {
      mover.classList.remove('is-moving');
    }

    if (crownWrap) {
      crownWrap.classList.add('crown-is-final');
    }

    // Remove o elemento do DOM após a animação terminar,
    // evitando que a coroa fique flutuando no meio da tela.
    if (crownWrap && crownWrap.parentNode) {
      crownWrap.remove();
    }

    this._revealInterface();
  },

  _showInterfaceImmediately() {
    this._revealInterface();
  },
};

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => LizChat.init());
