/* ============================================================
 *  Liz Chat — data.js
 *  Dados SIMULADOS, apenas para visualizar a tela funcionando.
 *  Sem backend por enquanto.
 * ============================================================ */

const LizData = {
  /* ----------
   * Storage key para salvar conversas no localStorage.
   * ---------- */
  STORAGE_KEY: 'liz-chat-conversations',

  /* ----------
   * Conversas recentes — agrupadas por período, exatamente
   * como aparece no painel "Conversas recentes".
   * Carrega do localStorage + dados de exemplo como fallback.
   * ---------- */
  conversationGroups: [
    {
      period: 'Hoje',
      items: [
        { id: 'c1', title: 'Plano de estudos',        preview: 'Última mensagem: aprender design em 6 semanas' },
        { id: 'c2', title: 'Tela de chat da Liz',     preview: 'Última mensagem: layout premium com coroa' },
      ],
    },
    {
      period: 'Ontem',
      items: [
        { id: 'c3', title: 'Prompt para Codex',       preview: 'Última mensagem: criar tela de IA' },
      ],
    },
    {
      period: 'Semana',
      items: [
        { id: 'c4', title: 'Email pro cliente',       preview: 'Última mensagem: follow-up profissional' },
        { id: 'c5', title: 'Ideias de campanha',      preview: 'Última mensagem: brainstorm criativo' },
        { id: 'c6', title: 'Revisão de contrato',     preview: 'Última mensagem: cláusulas importantes' },
      ],
    },
  ],

  /* ----------
   * Conversas salvas pelo usuário (persistidas em localStorage).
   * Estrutura: { id, title, messages: [{ role, content, time }], createdAt }
   * ---------- */
  savedConversations: [],

  /* ---------- Carrega conversas do localStorage ---------- */
  loadSavedConversations() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        this.savedConversations = JSON.parse(raw);
      } else {
        this.savedConversations = [];
      }
    } catch (e) {
      console.warn('Erro ao carregar conversas salvas:', e);
      this.savedConversations = [];
    }
  },

  /* ---------- Salva conversas no localStorage ---------- */
  _persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.savedConversations));
    } catch (e) {
      console.warn('Erro ao salvar conversas:', e);
    }
  },

  /* ---------- Gera um ID único ---------- */
  _genId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  },

  /* ----------
   * Cria/atualiza conversa salva. Identificada por id (título pode
   * colidir). Retorna o id da conversa — quem chama deve guardá-lo.
   * ---------- */
  saveConversation(title, messages, id) {
    const conv = id ? this.savedConversations.find((c) => c.id === id) : null;
    if (conv) {
      conv.title = title || conv.title || 'Nova conversa';
      conv.messages = messages.map((m) => ({ ...m }));
      conv.updatedAt = Date.now();
      this._persist();
      return conv.id;
    }
    const newId = this._genId();
    this.savedConversations.unshift({
      id: newId,
      title: title || 'Nova conversa',
      messages: messages.map((m) => ({ ...m })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    this._persist();
    return newId;
  },

  /* ---------- Atualiza mensagens de uma conversa salva ---------- */
  updateConversationMessages(title, messages) {
    const conv = this.savedConversations.find((c) => c.title === title);
    if (conv) {
      conv.messages = messages.map((m) => ({ ...m }));
      conv.updatedAt = Date.now();
      // Atualiza preview
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        conv.preview = 'Última mensagem: ' + lastMsg.content.slice(0, 50);
      }
      this._persist();
    }
  },

  /* ---------- Deleta uma conversa salva ---------- */
  deleteConversation(id) {
    this.savedConversations = this.savedConversations.filter((c) => c.id !== id);
    this._persist();
  },

  /* ---------- Renomeia uma conversa salva ---------- */
  renameConversation(id, newTitle) {
    const conv = this.savedConversations.find((c) => c.id === id);
    if (conv && newTitle && newTitle.trim()) {
      conv.title = newTitle.trim();
      conv.updatedAt = Date.now();
      this._persist();
      return true;
    }
    return false;
  },

  /* ---------- Fixa / desfixa uma conversa ---------- */
  togglePinConversation(id) {
    const conv = this.savedConversations.find((c) => c.id === id);
    if (conv) {
      conv.pinned = !conv.pinned;
      this._persist();
      return conv.pinned;
    }
    return false;
  },

  /* ---------- Gera título automático a partir da 1ª mensagem do usuário ---------- */
  autoTitleFromMessages(messages) {
    if (!Array.isArray(messages)) return '';
    const firstUser = messages.find((m) => m.role === 'user' && m.content);
    if (!firstUser) return '';
    let t = String(firstUser.content).replace(/\s+/g, ' ').trim();
    // Remove quebras de código/markdown óbvias e recolapsa os espaços que sobrarem
    t = t.replace(/```[\s\S]*?```/g, ' ').replace(/`/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 48) t = t.slice(0, 48).trim() + '…';
    return t;
  },

  /* ---------- Converte conversas salvas para grupos (formato do painel) ---------- */
  getConversationGroups() {
    const groups = [];
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const todayItems = [];
    const yesterdayItems = [];
    const weekItems = [];
    const olderItems = [];

    this.savedConversations.forEach((conv) => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      const item = {
        id: conv.id,
        title: conv.title,
        pinned: !!conv.pinned,
        preview: conv.preview || (conv.messages.length > 0
          ? 'Última mensagem: ' + conv.messages[conv.messages.length - 1].content.slice(0, 50)
          : 'Conversa vazia'),
      };
      if (date >= today) todayItems.push(item);
      else if (date >= yesterday) yesterdayItems.push(item);
      else if (date >= lastWeek) weekItems.push(item);
      else olderItems.push(item);
    });

    // Fixadas sempre primeiro (dentro de cada período)
    const pinFirst = (arr) => arr.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    pinFirst(todayItems); pinFirst(yesterdayItems); pinFirst(weekItems); pinFirst(olderItems);

    if (todayItems.length) groups.push({ period: 'Hoje', items: todayItems });
    if (yesterdayItems.length) groups.push({ period: 'Ontem', items: yesterdayItems });
    if (weekItems.length) groups.push({ period: 'Semana', items: weekItems });
    if (olderItems.length) groups.push({ period: 'Anterior', items: olderItems });

    return groups;
  },

  /* ---------- Busca uma conversa salva pelo ID ---------- */
  getConversationById(id) {
    return this.savedConversations.find((c) => c.id === id);
  },

  /* ----------
   * Mensagens de exemplo (modo conversa ativa).
   * role: 'user' -> bolha à direita | 'liz' -> bolha à esquerda com coroa
   * ---------- */
  sampleMessages: [
    {
      role: 'user',
      content: 'Crie um plano de estudos para aprender design',
      time: '09:41',
    },
    {
      role: 'liz',
      content:
        'Claro! Aqui está um plano em 3 etapas:\n\n' +
        '1. **Fundamentos de UI** — cor, tipografia, espaçamento e grid.\n' +
        '2. **Prática com Figma** — recriar interfaces que você admira.\n' +
        '3. **Criar um projeto real** — publique algo pequeno do início ao fim.\n\n' +
        'Quer que eu detalhe cada etapa com prazos?',
      time: '09:42',
    },
  ],

  /* ----------
   * Respostas simuladas da Liz (escolhidas por palavra-chave).
   * ---------- */
  replies: {
    code: [
      'Claro! Aqui vai um exemplo limpo e comentado:\n\n```js\nfunction saudar(nome) {\n  return `Olá, ${nome}!`;\n}\n\nconsole.log(saudar("Victor"));\n```\n\nQuer que eu adapte para outra linguagem?',
    ],
    design: [
      'Para melhorar o design, sugiro três ajustes rápidos: **1)** aumentar o contraste do texto, **2)** alinhar os elementos a uma grid de 8px, **3)** usar uma única cor de destaque — o roxo já está ótimo!',
    ],
    error: [
      'Esse erro costuma indicar que algo não foi encontrado. Verifique: o nome da variável/função, se ela foi declarada antes do uso e se há algum `import` faltando. Cole a mensagem completa se quiser que eu analise melhor.',
    ],
    ideas: [
      'Vamos de brainstorm:\n\n1. Comece pelo problema que você resolve\n2. Liste 10 variações sem filtrar\n3. Teste falar em voz alta\n4. Veja o que te anima mais\n\nQuer que eu gere 10 ideias agora?',
    ],
    default: [
      'Entendi! Deixa comigo — aqui vai uma resposta direta e organizada pra te ajudar com isso.\n\nQuer que eu detalhe algum ponto específico?',
    ],
  },

  /* ----------
   * Reações disponíveis — ícones SVG do LizConfig (zero emoji).
   * ---------- */
  reactionEmojis: [
    { icon: 'thumbsUp', key: 'thumbsup', label: 'Gostei' },
    { icon: 'heart',    key: 'heart',    label: 'Amei' },
    { icon: 'smile',    key: 'smile',    label: 'Divertido' },
    { icon: 'party',    key: 'party',    label: 'Celebrar' },
    { icon: 'thinking', key: 'thinking', label: 'Pensativo' },
  ],

  /* ----------
   * Histórico de uploads — persistido em storage separado.
   * ---------- */
  UPLOADS_KEY: 'liz-chat-uploads',
  uploadedFiles: [],

  loadUploadedFiles() {
    try {
      const raw = localStorage.getItem(this.UPLOADS_KEY);
      this.uploadedFiles = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.uploadedFiles = [];
    }
  },

  saveUploadedFile(file) {
    this.loadUploadedFiles();
    this.uploadedFiles.unshift({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: file.dataUrl,
      convTitle: file.convTitle || '',
      timestamp: Date.now(),
    });
    // Mantém apenas os últimos 50 arquivos
    if (this.uploadedFiles.length > 50) {
      this.uploadedFiles = this.uploadedFiles.slice(0, 50);
    }
    try {
      localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles));
    } catch (e) {
      // Se o localStorage estiver cheio, remove o item mais antigo
      if (e.name === 'QuotaExceededError') {
        this.uploadedFiles.pop();
        try {
          localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles));
        } catch (e2) { /* ignore */ }
      }
    }
  },

  deleteUploadedFile(id) {
    this.loadUploadedFiles();
    this.uploadedFiles = this.uploadedFiles.filter((f) => f.id !== id);
    try {
      localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles));
    } catch (e) { /* ignore */ }
  },

  /* ---------- Renomeia um arquivo do mural ---------- */
  renameUploadedFile(id, newName) {
    if (typeof newName !== 'string' || !newName.trim()) return false;
    this.loadUploadedFiles();
    const file = this.uploadedFiles.find((f) => f.id === id);
    if (!file) return false;
    file.name = newName.trim().slice(0, 120);
    try {
      localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles));
    } catch (e) { /* ignore */ }
    return true;
  },
};

// Carrega conversas ao iniciar
LizData.loadSavedConversations();

window.LizData = LizData;
