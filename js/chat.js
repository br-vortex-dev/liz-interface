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
  messageReactions: {},        // { [msgIndex]: { [reactionKey]: count } }
  isFocused: false,

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
      this.sendMessage();
    });

    // Estado do botão enviar + Enter (sem Shift) + auto-resize
    el.input.addEventListener('input', () => {
      LizUI.updateSendState();
      this._autoResize(el.input);
    });
    el.input.addEventListener('keydown', (e) => {
      const enterSends = localStorage.getItem('liz-enter-send') !== 'false';
      if (e.key === 'Enter' && !e.shiftKey) {
        if (enterSends) {
          e.preventDefault();
          this.sendMessage();
        }
        // Se enterSends for false, o Enter padrão adiciona nova linha (comportamento nativo)
      }
      // Ctrl+Enter sempre envia, independente da config
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
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

    // Coroa no header — recolhe/expande as ferramentas do menu lateral
    el.crownToggle.addEventListener('click', () => LizUI.toggleTools());
    el.crownToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        LizUI.toggleTools();
      }
    });

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
      const previewBtn = e.target.closest('.file-image-preview');
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

    // Abrir conversa a partir do card (painel)
    el.conversationsContent.addEventListener('click', (e) => {
      const card = e.target.closest('.conv-card');
      if (!card) return;
      // Tenta encontrar em conversas salvas primeiro
      const savedConv = LizData.getConversationById(card.dataset.id);
      if (savedConv) {
        LizUI.closePanel();
        this.openSampleConversation(savedConv.title);
        return;
      }
      // Fallback: dados de exemplo
      const conv = LizData.conversationGroups
        .flatMap((g) => g.items)
        .find((it) => it.id === card.dataset.id);
      if (conv) {
        LizUI.closePanel();
        this.openSampleConversation(conv.title);
      }
    });

    // Cards de ferramenta (painel) → preenchem o input e fecham
    el.toolsContent.addEventListener('click', (e) => {
      const card = e.target.closest('.tool-card');
      if (!card) return;
      const title = card.querySelector('.tool-card-title').textContent;
      LizUI.closePanel();
      LizUI.el.input.value = title;
      LizUI.updateSendState();
      LizUI.el.input.focus();
    });

    // Projetos — o render completo (renderProjectsPage) cuida de todos os
    // eventos internamente (filtros, busca, criar, arquivar, excluir).
    // O upload de arquivos é tratado globalmente via LizChat._handleFiles.

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
    const selectors = [
      '#crown-toggle',
      '#theme-toggle',
      '.float-pill[data-action="new"]',
      '.float-pill[data-action="conversations"]',
      '.float-pill[data-action="tools"]',
      '.float-pill[data-action="projects"]',
      '.float-pill[data-action="settings"]',
      '#attach-btn',
      '#chat-input',
      '#send-btn',
    ];

    // Cache dos elementos visíveis
    this._tabFocusable = selectors
      .map((sel) => document.querySelector(sel))
      .filter((el) => el && el.offsetParent !== null);

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

      // Ctrl+F / Cmd+F → busca na conversa
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        if (this.messages.length > 0) {
          e.preventDefault();
          LizUI.showSearchBar();
        }
      }
    });
  },

  /** Roteia o clique nas pílulas do menu flutuante. */
  _handlePill(action) {
    if (action === 'new') {
      this.newConversation();
      return;
    }
    // Projetos → abrem painel fullscreen
    if (action === 'projects') {
      if (LizUI.activePanel === action) {
        LizUI.closePanel();
      } else {
        LizUI.renderProjectsPage();
        LizUI.openPanel(action);
      }
      return;
    }
    // Conversas / Ferramentas → float panel ao lado do menu
    if (action === 'conversations' || action === 'tools') {
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
    const text = el.input.value.trim();
    if (!text) return;

    // Primeira mensagem → entra em modo conversa
    const wasEmpty = !this.messages.length;
    this.messages.push({ role: 'user', content: text, time: this._now() });
    if (wasEmpty) {
      const title = LizUI.activeMode
        ? LizConfig.suggestions.find((s) => s.id === LizUI.activeMode)?.status + ' — ' + text.slice(0, 30)
        : text.slice(0, 40);
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

    // Salva progresso
    this._saveCurrentConversation();

    // Resposta simulada
    this._simulateReply(text);
  },

  async _simulateReply(userText) {
    LizUI.showTyping();
    await this._delay(850);
    LizUI.removeTyping();

    const reply = this._pickReply(userText);
    const msg = { role: 'liz', content: reply, time: this._now() };
    this.messages.push(msg);
    LizUI.appendMessage(msg, this.messages.length - 1);

    // Salva após resposta
    this._saveCurrentConversation();
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
    // Salva a conversa atual antes de limpar
    if (this.messages.length > 0) {
      this._saveCurrentConversation();
    }
    this.messages = [];
    this.currentTitle = null;
    this.messageReactions = {};
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

  /** Abre uma conversa a partir do painel. */
  openSampleConversation(title) {
    // Tenta encontrar uma conversa salva
    const savedConv = LizData.savedConversations.find((c) => c.title === title);
    if (savedConv && savedConv.messages.length > 0) {
      this.messages = savedConv.messages.map((m) => ({ ...m }));
      this.currentTitle = savedConv.title;
    } else {
      // Fallback para dados de exemplo
      this.messages = LizData.sampleMessages.map((m) => ({ ...m }));
      this.currentTitle = title;
    }
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const wasEmpty = !this.messages.length;
        const msg = {
          role: 'user',
          content: '',
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result,
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

        // Salva no histórico de uploads
        LizData.saveUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
          convTitle: this.currentTitle || 'Nova conversa',
        });

        this._saveCurrentConversation();

        // Se for o último arquivo, simula resposta
        if (i === validFiles.length - 1) {
          this._simulateFileReply(file);
        }
      };
      reader.readAsDataURL(file);
    });
  },

  async _simulateFileReply(file) {
    LizUI.showTyping();
    await this._delay(900);
    LizUI.removeTyping();

    const isImage = file.type && file.type.startsWith('image/');
    let reply;
    if (isImage) {
      reply = 'Recebi sua imagem! Posso analisá-la, descrevê-la ou ajudar com edições. O que você gostaria de fazer?';
    } else {
      reply = 'Arquivo recebido! Posso ler o conteúdo, resumir ou extrair informações. Me diga o que precisa.';
    }

    const msg = { role: 'liz', content: reply, time: this._now() };
    this.messages.push(msg);
    LizUI.appendMessage(msg, this.messages.length - 1);
    this._saveCurrentConversation();
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
    LizData.saveConversation(this.currentTitle, this.messages);
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

    // Usa CSS classes para controle em tempo real (funciona pra mensagens novas também)
    document.documentElement.classList.toggle('liz-no-timestamp', !showTimestamp);
    document.documentElement.classList.toggle('liz-no-animations', !showAnimations);
    document.documentElement.classList.toggle('liz-no-glow', !showGlow);

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._showInterfaceImmediately();
      return;
    }
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
      const fontsReady = document.fonts?.status === 'loaded' || document.fonts?.ready;
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
