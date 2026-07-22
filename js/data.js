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

  /* ---------- Cria uma nova conversa salva ---------- */
  saveConversation(title, messages) {
    // Se já existe uma conversa com o mesmo título (edição), atualiza
    const existingIdx = this.savedConversations.findIndex(
      (c) => c.title === title && c.messages.length === 0
    );
    if (existingIdx >= 0) {
      this.savedConversations[existingIdx].messages = messages.map((m) => ({ ...m }));
      this.savedConversations[existingIdx].updatedAt = Date.now();
    } else {
      this.savedConversations.unshift({
        id: this._genId(),
        title: title || 'Nova conversa',
        messages: messages.map((m) => ({ ...m })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    this._persist();
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
        preview: conv.preview || (conv.messages.length > 0
          ? 'Última mensagem: ' + conv.messages[conv.messages.length - 1].content.slice(0, 50)
          : 'Conversa vazia'),
      };
      if (date >= today) todayItems.push(item);
      else if (date >= yesterday) yesterdayItems.push(item);
      else if (date >= lastWeek) weekItems.push(item);
      else olderItems.push(item);
    });

    if (todayItems.length) groups.push({ period: 'Hoje', items: todayItems });
    if (yesterdayItems.length) groups.push({ period: 'Ontem', items: yesterdayItems });
    if (weekItems.length) groups.push({ period: 'Semana', items: weekItems });
    if (olderItems.length) groups.push({ period: 'Anterior', items: olderItems });

    // Se não tem conversas salvas, retorna os dados de exemplo
    if (groups.length === 0) {
      return this.conversationGroups;
    }

    return groups;
  },

  /* ---------- Busca uma conversa salva pelo ID ---------- */
  getConversationById(id) {
    return this.savedConversations.find((c) => c.id === id);
  },

  /* ----------
   * Ferramentas da Liz (grid de cards no painel).
   * ---------- */
  tools: [
    { icon: 'code',     title: 'Criar código' },
    { icon: 'sparkle',  title: 'Melhorar UI' },
    { icon: 'bug',      title: 'Explicar erro' },
    { icon: 'prompt',   title: 'Criar prompt' },
    { icon: 'bulb',     title: 'Gerar ideias' },
    { icon: 'layers',   title: 'Organizar' },
  ],

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
        'Claro! Aqui está um plano em 3 etapas:\\n\\n' +
        '1. **Fundamentos de UI** — cor, tipografia, espaçamento e grid.\\n' +
        '2. **Prática com Figma** — recriar interfaces que você admira.\\n' +
        '3. **Criar um projeto real** — publique algo pequeno do início ao fim.\\n\\n' +
        'Quer que eu detalhe cada etapa com prazos?',
      time: '09:42',
    },
  ],

  /* ----------
   * Respostas simuladas da Liz (escolhidas por palavra-chave).
   * ---------- */
  replies: {
    code: [
      'Claro! Aqui vai um exemplo limpo e comentado:\\n\\n```js\\nfunction saudar(nome) {\\n  return `Olá, ${nome}!`;\\n}\\n\\nconsole.log(saudar("Victor"));\\n```\\n\\nQuer que eu adapte para outra linguagem?',
    ],
    design: [
      'Para melhorar o design, sugiro três ajustes rápidos: **1)** aumentar o contraste do texto, **2)** alinhar os elementos a uma grid de 8px, **3)** usar uma única cor de destaque — o roxo já está ótimo!',
    ],
    error: [
      'Esse erro costuma indicar que algo não foi encontrado. Verifique: o nome da variável/função, se ela foi declarada antes do uso e se há algum `import` faltando. Cole a mensagem completa se quiser que eu analise melhor.',
    ],
    ideas: [
      'Vamos de brainstorm:\\n\\n1. Comece pelo problema que você resolve\\n2. Liste 10 variações sem filtrar\\n3. Teste falar em voz alta\\n4. Veja o que te anima mais\\n\\nQuer que eu gere 10 ideias agora?',
    ],
    default: [
      'Entendi! Deixa comigo — aqui vai uma resposta direta e organizada pra te ajudar com isso.\\n\\nQuer que eu detalhe algum ponto específico?',
    ],
  },

  /* ----------
   * Emojis disponíveis para reações.
   * ---------- */
  reactionEmojis: [
    { emoji: '👍', key: 'thumbsup' },
    { emoji: '❤️', key: 'heart' },
    { emoji: '😄', key: 'smile' },
    { emoji: '🎉', key: 'party' },
    { emoji: '🤔', key: 'thinking' },
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
};

// Carrega conversas ao iniciar
LizData.loadSavedConversations();

window.LizData = LizData;
