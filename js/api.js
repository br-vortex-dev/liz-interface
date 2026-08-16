/* ============================================================
 *  Liz Chat — api.js
 *  Camada de comunicação com o backend Express.
 *  Detecta automaticamente se o backend está online.
 *  Se offline, o frontend continua funcionando em modo local.
 * ============================================================ */

const LizAPI = {
  /* ---------- Configuração ---------- */
  BASE_URL: 'http://localhost:3000/api',
  // A Liz 3 é um modelo de raciocínio: pensa antes de responder.
  // O backend tenta até 3 vezes com backoff em caso de rate limit (429),
  // então o timeout precisa cobrir o pior caso (~2min) sem desistir cedo demais.
  TIMEOUT: 150000,
  online: false,
  _lastCheck: 0,
  _checkInterval: 30000, // re-verifica a cada 30s

  /* ---------- Health Check ---------- */
  async checkBackend() {
    const now = Date.now();
    if (now - this._lastCheck < this._checkInterval && this.online) {
      return this.online;
    }
    this._lastCheck = now;
    try {
      const res = await this._fetch('/health', { method: 'GET', timeout: 3000 });
      this.online = res && res.ok !== false;
    } catch (e) {
      this.online = false;
    }
    return this.online;
  },

  /* ---------- Conversas ---------- */

  /** Lista conversas com paginação */
  async getConversations(page = 1, limit = 20) {
    return this._fetch(`/conversations?page=${page}&limit=${limit}`);
  },

  /** Busca uma conversa pelo ID (com mensagens) */
  async getConversation(id) {
    return this._fetch(`/conversations/${id}`);
  },

  /** Cria uma nova conversa */
  async createConversation(title) {
    return this._fetch('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  /** Renomeia uma conversa */
  async renameConversation(id, title) {
    return this._fetch(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  /** Deleta uma conversa */
  async deleteConversation(id) {
    return this._fetch(`/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  /** Fixa/desfixa uma conversa */
  async togglePinConversation(id, pinned) {
    return this._fetch(`/conversations/${id}/pin`, {
      method: 'PUT',
      body: JSON.stringify({ pinned }),
    });
  },

  /* ---------- Mensagens ---------- */

  /**
   * Envia uma mensagem e recebe a resposta da IA.
   * Retorna: { conversationId, userMessage, assistantMessage }
   */
  async sendMessage(conversationId, content, mode, model) {
    return this._fetch('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        message: content,
        mode: mode || null,
        model: model || 'liz-3',
      }),
      timeout: this.TIMEOUT,
    });
  },

  /** Carrega histórico de mensagens de uma conversa (paginação) */
  async getMessages(conversationId, page = 1, limit = 50) {
    return this._fetch(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  /* ---------- Upload ---------- */

  /** Envia um arquivo para o backend */
  async uploadFile(file, conversationId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId || '');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const res = await fetch(`${this.BASE_URL}/chat/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  },

  /* ---------- Mapeamento de roles ---------- */

  /** Converte role do backend ('assistant') para o frontend ('liz') */
  mapRoleToFrontend(role) {
    return role === 'assistant' ? 'liz' : role;
  },

  /** Converte role do frontend ('liz') para o backend ('assistant') */
  mapRoleToBackend(role) {
    return role === 'liz' ? 'assistant' : role;
  },

  /** Converte uma mensagem do backend para o formato do frontend */
  mapMessageToFrontend(msg) {
    return {
      role: this.mapRoleToFrontend(msg.role),
      content: msg.content,
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : msg.time || '',
    };
  },

  /** Converte uma conversa do backend para o formato do frontend */
  mapConversationToFrontend(conv) {
    return {
      id: conv.id,
      title: conv.title,
      pinned: !!conv.pinned,
      messages: (conv.messages || []).map((m) => this.mapMessageToFrontend(m)),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  },

  /* ---------- Interno: fetch com timeout ---------- */
  async _fetch(endpoint, options = {}) {
    const { timeout = 8000, ...fetchOpts } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...fetchOpts,
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOpts.headers || {}),
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (e) {
      if (e.name === 'AbortError') {
        throw new Error('Tempo esgotado — o backend não respondeu.');
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },
};

window.LizAPI = LizAPI;
