/* ============================================================
 *  Liz Chat — data.js
 *  Camada de estado e persistência.
 * Cache imediato: localStorage (a UI nunca espera a rede para salvar).
 * Sincronização: Backend (LizAPI) em segundo plano quando disponível.
 * ============================================================ */

const LizData = {
  STORAGE_KEY: 'liz-chat-conversations',
  UPLOADS_KEY: 'liz-chat-uploads',

  savedConversations: [],
  uploadedFiles: [],
  
  // Estado de conexão com o backend
  isBackendOnline: false,

  /* ---------- Inicialização ---------- */
  
  // Carrega o cache local imediatamente para a UI não renderizar vazia.
  _loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      this.savedConversations = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[LizData] Erro ao ler cache local:', e);
      this.savedConversations = [];
    }
  },

  _persistToLocalStorage() {
    try {
      // Arquivo que já foi pro storage do backend (uploadId) não duplica
      // o base64 no localStorage — o conteúdo mora no B2/local, e a
      // tela reidrata sob demanda via LizAPI.getUploadDataUrl.
      const slim = this.savedConversations.map((c) => ({
        ...c,
        messages: Array.isArray(c.messages) ? c.messages.map((m) => {
          if (m && m.file && m.file.uploadId) {
            const { dataUrl, ...fileRest } = m.file;
            return { ...m, file: fileRest };
          }
          return m;
        }) : c.messages,
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(slim));
    } catch (e) {
      console.warn('[LizData] Erro ao salvar no cache local:', e);
    }
  },

  /**
   * Sincroniza o estado local com o backend.
   * É chamado pelo chat após o carregamento inicial e a confirmação do login.
   */
  async syncWithBackend() {
    if (typeof LizAPI === 'undefined') return false;

    const online = await LizAPI.checkBackend();
    this.isBackendOnline = online;

    if (!online) {
      console.log('[LizData] Backend offline. Operando apenas com cache local.');
      return false;
    }

    try {
      // Busca as conversas do banco de dados. A listagem traz apenas a
      // última mensagem; o detalhe completo é carregado ao abrir a conversa.
      const response = await LizAPI.getConversations(1, 100);
      const conversations = Array.isArray(response)
        ? response
        : (response.conversations || response.data || []);
      const localById = new Map(this.savedConversations.map((conv) => [String(conv.id), conv]));
      const remote = conversations.map((conv) => {
        const mapped = LizAPI.mapConversationToFrontend(conv);
        const cached = localById.get(String(mapped.id));
        // Preserva mensagens já cacheadas até o detalhe remoto ser aberto.
        if (cached && Array.isArray(cached.messages) && cached.messages.length) {
          mapped.messages = cached.messages;
        }
        return mapped;
      });
      const remoteIds = new Set(remote.map((conv) => String(conv.id)));
      // Conversas locais sem ID remoto não são apagadas silenciosamente.
      const localOnly = this.savedConversations.filter((conv) =>
        String(conv.id).startsWith('local_') && !remoteIds.has(String(conv.id))
      );

      this.savedConversations = [...remote, ...localOnly];
      this._persistToLocalStorage();
      console.log(`[LizData] Sincronizado com sucesso: ${remote.length} conversas.`);
      return true;
    } catch (e) {
      console.warn('[LizData] Falha ao buscar do backend, mantendo cache local:', e.message);
      return false;
    }
  },

  /* ---------- Gerenciamento de Conversas ---------- */
  
  _genLocalId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  },

  saveConversation(title, messages, id) {
    const finalTitle = title || this.autoTitleFromMessages(messages) || 'Nova conversa';
    const safeMessages = Array.isArray(messages) ? messages.map((m) => ({ ...m })) : [];
    const existing = id ? this.savedConversations.find((c) => String(c.id) === String(id)) : null;
    const previousTitle = existing?.title;
    const now = Date.now();

    // O estado local é atualizado imediatamente. Assim, os chamadores
    // recebem uma string de ID, e não uma Promise, mesmo quando a API está
    // lenta ou indisponível. A atualização remota é secundária.
    let conversationId;
    if (existing) {
      existing.title = finalTitle;
      existing.messages = safeMessages;
      existing.updatedAt = now;
      conversationId = existing.id;
    } else {
      // Um ID desconhecido nunca é aceito como se já existisse; isso evita
      // referências quebradas e mantém o contrato de criação local.
      conversationId = this._genLocalId();
      this.savedConversations.unshift({
        id: conversationId,
        title: finalTitle,
        messages: safeMessages,
        createdAt: now,
        updatedAt: now,
        pinned: false,
      });
    }
    this._persistToLocalStorage();

    // O endpoint /chat/send já persiste mensagens no backend. Aqui só
    // mantemos o título remoto atualizado, sem bloquear a interface.
    if (this.isBackendOnline && typeof LizAPI !== 'undefined' && !String(conversationId).startsWith('local_') && previousTitle !== finalTitle) {
      LizAPI.renameConversation(conversationId, finalTitle).catch((e) => {
        console.warn('[LizData] Título remoto não atualizado:', e.message);
      });
    }

    return conversationId;
  },

  /** Troca um ID local pelo ID definitivo criado no backend. */
  promoteConversationId(localId, remoteId) {
    if (!localId || !remoteId || String(localId) === String(remoteId)) return remoteId;
    const local = this.savedConversations.find((c) => String(c.id) === String(localId));
    const remote = this.savedConversations.find((c) => String(c.id) === String(remoteId));
    if (local && remote && local !== remote) {
      remote.messages = local.messages?.length ? local.messages : remote.messages;
      remote.title = local.title || remote.title;
      remote.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
      this.savedConversations = this.savedConversations.filter((c) => c !== local);
    } else if (local) {
      local.id = remoteId;
    }
    this._persistToLocalStorage();
    return remoteId;
  },

  deleteConversation(id) {
    if (this.isBackendOnline && typeof LizAPI !== 'undefined' && !String(id).startsWith('local_')) {
      LizAPI.deleteConversation(id).catch((e) => {
        console.error('[LizData] Erro ao deletar no backend:', e);
      });
    }

    this.savedConversations = this.savedConversations.filter((c) => String(c.id) !== String(id));
    this._persistToLocalStorage();
  },

  renameConversation(id, newTitle) {
    if (!newTitle || !newTitle.trim()) return false;
    const finalTitle = newTitle.trim();

    if (this.isBackendOnline && typeof LizAPI !== 'undefined' && !String(id).startsWith('local_')) {
      LizAPI.renameConversation(id, finalTitle).catch((e) => {
        console.error('[LizData] Erro ao renomear no backend:', e);
      });
    }

    const conv = this.savedConversations.find((c) => String(c.id) === String(id));
    if (conv) {
      conv.title = finalTitle;
      conv.updatedAt = Date.now();
      this._persistToLocalStorage();
      return true;
    }
    return false;
  },

  togglePinConversation(id) {
    const conv = this.savedConversations.find((c) => String(c.id) === String(id));
    if (!conv) return false;

    const newPinned = !conv.pinned;

    if (this.isBackendOnline && typeof LizAPI !== 'undefined' && !String(id).startsWith('local_')) {
      LizAPI.togglePinConversation(id, newPinned).catch((e) => {
        console.error('[LizData] Erro ao fixar no backend:', e);
      });
    }

    conv.pinned = newPinned;
    this._persistToLocalStorage();
    return newPinned;
  },

  /* ---------- Utilitários ---------- */
  
  autoTitleFromMessages(messages) {
    if (!Array.isArray(messages)) return '';
    const firstUser = messages.find((m) => m.role === 'user' && m.content);
    if (!firstUser) return '';
    let t = String(firstUser.content).replace(/\s+/g, ' ').trim();
    t = t.replace(/```[\s\S]*?```/g, ' ').replace(/`/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 48) t = t.slice(0, 48).trim() + '…';
    return t;
  },

  getConversationGroups() {
    const groups = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);

    const todayItems = [], yesterdayItems = [], weekItems = [], olderItems = [];

    this.savedConversations.forEach((conv) => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      const item = {
        id: conv.id,
        title: conv.title,
        pinned: !!conv.pinned,
        preview: conv.messages && conv.messages.length > 0
          ? 'Última mensagem: ' + String(conv.messages[conv.messages.length - 1].content || '').slice(0, 50)
          : conv.lastMessage && conv.lastMessage.content
            ? 'Última mensagem: ' + String(conv.lastMessage.content).slice(0, 50)
            : 'Conversa vazia',
      };
      if (date >= today) todayItems.push(item);
      else if (date >= yesterday) yesterdayItems.push(item);
      else if (date >= lastWeek) weekItems.push(item);
      else olderItems.push(item);
    });

    const pinFirst = (arr) => arr.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    pinFirst(todayItems); pinFirst(yesterdayItems); pinFirst(weekItems); pinFirst(olderItems);

    if (todayItems.length) groups.push({ period: 'Hoje', items: todayItems });
    if (yesterdayItems.length) groups.push({ period: 'Ontem', items: yesterdayItems });
    if (weekItems.length) groups.push({ period: 'Semana', items: weekItems });
    if (olderItems.length) groups.push({ period: 'Anterior', items: olderItems });

    return groups;
  },

  getConversationById(id) {
    return this.savedConversations.find((c) => c.id === id);
  },

  /* ---------- Mensagens de Exemplo (Apenas para tela inicial vazia) ---------- */
  sampleMessages: [
    { role: 'user', content: 'Como funciona o seu modo de raciocínio?', time: 'Agora' },
    { role: 'liz', content: 'Eu penso antes de responder. Analiso o contexto, quebro o problema em partes e só então formulo a resposta final. Isso me permite lidar com códigos complexos e decisões de arquitetura com mais precisão.', time: 'Agora' }
  ],

  reactionEmojis: [
    { icon: 'thumbsUp', key: 'thumbsup', label: 'Gostei' },
    { icon: 'heart',    key: 'heart',    label: 'Amei' },
    { icon: 'smile',    key: 'smile',    label: 'Divertido' },
    { icon: 'party',    key: 'party',    label: 'Celebrar' },
    { icon: 'thinking', key: 'thinking', label: 'Pensativo' },
  ],

  /* ---------- Respostas Mockadas (fallback quando backend offline) ---------- */
  replies: {
    code: [
      'Quando penso em código, não vejo só sintaxe — vejo intenção. Toda função conta uma história sobre o problema que resolve. Se a história é confusa, o código provavelmente também é. Vamos destrinchar isso juntos?\n\n```js\nfunction exemplo() {\n  const objetivo = "clareza";\n  return objetivo;\n}\n```',
      'Código bom se lê como prosa clara: cada linha tem propósito, cada nome carrega significado. Se você precisa de comentário pra explicar o que a função faz, o nome da função está errado.'
    ],
    design: [
      'Design não é enfeite — é comunicação. Cada cor, espaçamento e animação transmite algo. Se a interface parece "certa" mas o usuário hesita, algo na comunicação falhou.',
      'O melhor design é invisível. O usuário não percebe o botão, ele só clica. Não nota a transição, só flui. Quando param pra elogiar a interface, é sinal de que ela chamou atenção demais.'
    ],
    error: [
      'Erros não são fracassos — são informação. Um stack trace é um mapa dizendo exatamente onde o sistema quebrou. A gente só precisa ler com calma.',
      'Todo bug é uma conversa que o código está tentando ter com você. Se você não está ouvindo, ele vai falar mais alto na próxima vez — geralmente em produção.'
    ],
    ideas: [
      'Boas ideias raramente vêm prontas — elas começam como desconforto. Aquela sensação de "algo aqui está errado" é o ponto de partida. Vamos explorar isso?',
      'Brainstorm não é quantidade, é coragem de dizer o óbvio em voz alta. As melhores soluções costumam ser simples demais pra parecerem inteligentes.'
    ],
    default: [
      'Entendi. Me conta mais sobre o contexto — o que motivou essa pergunta? Às vezes a resposta certa depende de entender o problema real, não só o que foi perguntado.',
      'Vamos por partes. Me ajuda a entender o que você está tentando construir ou resolver, e a gente chega numa resposta que faz sentido pro seu caso específico.'
    ],
  },

  /** Wrapper público chamado pelo chat.js no init() */
  loadSavedConversations() {
    this._loadFromLocalStorage();
  },

  /* ---------- Uploads (Mantido local temporariamente) ---------- */
  loadUploadedFiles() {
    try {
      const raw = localStorage.getItem(this.UPLOADS_KEY);
      this.uploadedFiles = raw ? JSON.parse(raw) : [];
    } catch (e) { this.uploadedFiles = []; }
  },
  
  saveUploadedFile(file) {
    this.loadUploadedFiles();
    // Com uploadId o conteúdo está no storage do backend —
    // não guarda o base64 no navegador.
    const entry = {
      id: file.uploadId || ('file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      name: file.name, size: file.size, type: file.type,
      uploadId: file.uploadId || undefined,
      url: file.url || undefined,
      convTitle: file.convTitle || '', timestamp: Date.now(),
    };
    if (!file.uploadId) entry.dataUrl = file.dataUrl;
    this.uploadedFiles.unshift(entry);
    if (this.uploadedFiles.length > 50) this.uploadedFiles = this.uploadedFiles.slice(0, 50);
    try { localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles)); } catch (e) { /* ignore */ }
  },
  
  deleteUploadedFile(id) {
    this.loadUploadedFiles();
    const target = this.uploadedFiles.find((f) => f.id === id);
    // Arquivo que foi pro storage do backend: remove também de lá
    if (target && target.uploadId && typeof LizAPI !== 'undefined') {
      LizAPI.deleteUpload(target.uploadId).catch(() => {});
    }
    this.uploadedFiles = this.uploadedFiles.filter((f) => f.id !== id);
    try { localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles)); } catch (e) { /* ignore */ }
  },
  
  renameUploadedFile(id, newName) {
    if (typeof newName !== 'string' || !newName.trim()) return false;
    this.loadUploadedFiles();
    const file = this.uploadedFiles.find((f) => f.id === id);
    if (!file) return false;
    file.name = newName.trim().slice(0, 120);
    try { localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles)); } catch (e) { /* ignore */ }
    return true;
  }
};

// Carrega o cache local imediatamente na inicialização do script
LizData._loadFromLocalStorage();
LizData.loadUploadedFiles();

window.LizData = LizData;
