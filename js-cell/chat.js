/* ============================================================
 *  Liz Mobile — chat.js
 *  Orquestração mobile
 * ============================================================ */

const MobileChat = {
  messages: [],
  currentTitle: null,
  isFocused: false,

  init() {
    LizData.loadSavedConversations();
    MobileUI.init();
    this._renderBrand();
    this._showEmptyState();
    this._bindEvents();
    this._applyTheme();
    console.log('Liz Mobile pronto 📱');
  },

  _renderBrand() {
    const crown = LizConfig.crown;
    document.querySelectorAll('.empty-crown').forEach((el) => {
      el.innerHTML = crown;
    });
  },

  _showEmptyState() {
    MobileUI.el.emptyState.classList.remove('is-hidden');
    MobileUI.el.messages.classList.add('is-hidden');
    MobileUI.setActiveNav('chat');
  },

  _showConversation(title) {
    MobileUI.el.emptyState.classList.add('is-hidden');
    MobileUI.el.messages.classList.remove('is-hidden');
    if (title) {
      const node = MobileUI.el.headerStatus.querySelector('.status-text');
      if (node) node.textContent = title;
    }
  },

  _bindEvents() {
    const ui = MobileUI;

    // Form submit
    ui.el.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._sendMessage();
    });

    // Input events
    ui.el.input.addEventListener('input', () => {
      ui.el.sendBtn.disabled = ui.el.input.value.trim().length === 0;
    });

    ui.el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendMessage();
      }
    });

    // Theme toggle
    ui.el.themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('liz-chat-theme', next);
      ui.el.themeBtn.innerHTML = next === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#050505' : '#faf5f0');
    });

    // BOLAS DE SINUCA — UMA DE CADA VEZ
    const sinucaTrigger = document.getElementById('sinuca-trigger');
    const sinucaMesa = document.getElementById('sinuca-mesa');
    const bolas = document.querySelectorAll('.sinuca-bola');
    let isSinucaOpen = false;
    let sinucaAnimating = false;

    // Renderiza coroa
    const sinucaIcon = document.getElementById('sinuca-icon');
    if (sinucaIcon) sinucaIcon.innerHTML = LizConfig.crown;

    function closeSinuca() {
      if (!isSinucaOpen) return;
      isSinucaOpen = false;
      sinucaAnimating = false;
      sinucaTrigger.classList.remove('is-open');
      sinucaMesa.classList.remove('is-open');
      // Reseta todas as bolas
      bolas.forEach((b) => { b.style.animation = 'none'; b.classList.remove('is-dropped'); });
      const overlay = document.querySelector('.sinuca-overlay');
      if (overlay) overlay.classList.remove('is-visible');
    }

    function dropBola(index) {
      if (index >= bolas.length || !isSinucaOpen) return;
      const bola = bolas[index];
      
      // Anima a bola caindo
      bola.style.animation = 'none';
      void bola.offsetWidth;
      bola.style.animation = 'sinucaQueda 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
      
      // Depois que ela cair, empurra as que já estão embaixo
      setTimeout(() => {
        bola.classList.add('is-dropped');
        
        // Empurra todas as bolas que já caíram antes (as de baixo)
        for (let i = 0; i < index; i++) {
          const b = bolas[i];
          b.style.animation = 'none';
          void b.offsetWidth;
          b.style.animation = 'sinucaEmpurra 0.35s ease-out forwards';
        }
        
        // Próxima bola
        setTimeout(() => dropBola(index + 1), 200);
      }, 480);
    }

    function openSinuca() {
      isSinucaOpen = true;
      sinucaAnimating = true;
      sinucaTrigger.classList.add('is-open');
      sinucaMesa.classList.add('is-open');
      
      let overlay = document.querySelector('.sinuca-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sinuca-overlay';
        overlay.addEventListener('click', closeSinuca);
        overlay.addEventListener('touchstart', closeSinuca);
        document.body.prepend(overlay);
      }
      setTimeout(() => overlay.classList.add('is-visible'), 10);
      
      // Começa a primeira bola
      setTimeout(() => dropBola(0), 50);
    }

    sinucaTrigger.addEventListener('click', () => {
      if (isSinucaOpen) closeSinuca();
      else openSinuca();
    });

    // Bolas — clicar numa após ela ter caído
    bolas.forEach((bola) => {
      bola.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!bola.classList.contains('is-dropped')) return;
        const action = bola.dataset.action;
        closeSinuca();
        setTimeout(() => this._handleNav(action), 300);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isSinucaOpen) closeSinuca();
    });

    // Sheet close
    ui.el.sheet.querySelector('.sheet-close')?.addEventListener('click', () => ui.closeSheet());
    ui.el.overlay.addEventListener('click', () => { ui.closeSheet(); ui.closePanel(); });

    // Panel close
    ui.el.panelFull.querySelector('.panel-close-btn')?.addEventListener('click', () => ui.closePanel());

    // Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { ui.closeSheet(); ui.closePanel(); }
    });

    // Scroll hide header
    let lastScroll = 0;
    ui.el.main.addEventListener('scroll', () => {
      const st = ui.el.main.scrollTop;
      ui.el.header.classList.toggle('is-hidden', st > 40 && st > lastScroll);
      lastScroll = st;
    });
  },

  _handleNav(action) {
    const ui = MobileUI;
    ui.closeSheet();
    ui.closePanel();

    if (action === 'chat') {
      ui.setActiveNav('chat');
      return;
    }
    if (action === 'new') {
      this._newConversation();
      return;
    }
    if (action === 'settings') {
      this._showSettingsMenu();
      return;
    }
    if (action === 'files') {
      this._showFiles();
      return;
    }
  },

  _sendMessage() {
    const ui = MobileUI;
    const text = ui.el.input.value.trim();
    if (!text) return;

    const wasEmpty = !this.messages.length;
    this.messages.push({ role: 'user', content: text, time: ui._formatTime() });

    if (wasEmpty) {
      this.currentTitle = text.slice(0, 35);
      this._showConversation(this.currentTitle);
      this._renderMessages();
    } else {
      this._appendMessage(this.messages[this.messages.length - 1]);
    }

    ui.el.input.value = '';
    ui.el.sendBtn.disabled = true;

    // Simula resposta
    setTimeout(() => this._simulateReply(text), 600);
  },

  _simulateReply(text) {
    const t = text.toLowerCase();
    let reply = LizData.replies.default[0];
    if (/(código|codigo|função|script|react)/.test(t)) reply = LizData.replies.code[0];
    else if (/(design|ui|visual|cor|css)/.test(t)) reply = LizData.replies.design[0];
    else if (/(erro|error|bug|falha)/.test(t)) reply = LizData.replies.error[0];
    else if (/(ideia|ideias|brainstorm)/.test(t)) reply = LizData.replies.ideas[0];

    const msg = { role: 'liz', content: reply, time: MobileUI._formatTime() };
    this.messages.push(msg);
    this._appendMessage(msg);
  },

  _renderMessages() {
    MobileUI.el.messages.innerHTML = this.messages.map((m, i) => this._msgHTML(m, i)).join('');
    this._scrollDown();
  },

  _appendMessage(msg) {
    const div = document.createElement('div');
    div.innerHTML = this._msgHTML(msg, this.messages.length - 1);
    MobileUI.el.messages.appendChild(div.firstElementChild);
    this._scrollDown();
  },

  _msgHTML(m, idx) {
    const time = m.time ? '<p class="msg-time">' + m.time + '</p>' : '';
    if (m.role === 'user') {
      return '<div class="msg msg-user"><div class="msg-bubble msg-bubble-user"><div class="msg-text">' + MobileUI._markdown(m.content) + '</div></div>' + time + '</div>';
    }
    return '<div class="msg msg-liz"><div class="msg-avatar">' + LizConfig.crown + '</div><div><div class="msg-bubble msg-bubble-liz"><span class="msg-name">Liz</span><div class="msg-text">' + MobileUI._markdown(m.content) + '</div></div>' + time + '</div></div>';
  },

  _scrollDown() {
    requestAnimationFrame(() => {
      MobileUI.el.main.scrollTop = MobileUI.el.main.scrollHeight;
    });
  },

  _newConversation() {
    this.messages = [];
    this.currentTitle = null;
    MobileUI.el.input.value = '';
    MobileUI.el.sendBtn.disabled = true;
    this._showEmptyState();
    MobileUI.toast('Nova conversa');
  },

  _showSettingsMenu() {
    const cats = [
      { id: 'appearance', icon: 'sun', label: 'Aparência' },
      { id: 'notifications', icon: 'chats', label: 'Notificações' },
      { id: 'chat', icon: 'sparkle', label: 'Chat' },
      { id: 'history', icon: 'folder', label: 'Histórico' },
      { id: 'account', icon: 'settings', label: 'Conta' },
    ];
    let html = cats.map((c) =>
      '<button class="sheet-item" data-cat="' + c.id + '">' +
        '<span class="sheet-item-ico">' + (LizConfig.icons[c.icon] || '') + '</span>' +
        '<span class="sheet-item-title">' + c.label + '</span>' +
        '<span class="sheet-item-arrow">' + LizConfig.icons.continue + '</span>' +
      '</button>'
    ).join('');
    MobileUI.openSheet('Ajustes', html);

    // Bind category clicks
    document.querySelectorAll('#sheet .sheet-item[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => this._showSettingsPage(btn.dataset.cat));
    });
  },

  _showSettingsPage(pageId) {
    const pages = {
      appearance: `
        <div class="settings-group"><p class="settings-label">Tema</p>
        <div class="segmented" id="s-theme">
          <button class="seg-btn" data-theme="dark">Escuro</button>
          <button class="seg-btn" data-theme="light">Claro</button>
          <button class="seg-btn" data-theme="auto">Automático</button>
        </div></div>
        <div class="settings-group"><p class="settings-label">Como a Liz te chama</p>
        <input class="settings-input" style="width:100%;text-align:left" value="Victor" /></div>`,
      notifications: `
        <div class="settings-group"><p class="settings-label">Notificações</p>
        ${this._toggle('Notificações', 's-notif', true)}
        ${this._toggle('Som', 's-sound', true)}
        ${this._toggle('Vibrar', 's-vibrate', true)}</div>`,
      chat: `
        <div class="settings-group"><p class="settings-label">Chat</p>
        ${this._toggle('Sugestões iniciais', 's-suggestions', true)}
        ${this._toggle('Animações', 's-animations', true)}
        ${this._toggle('Brilho roxo', 's-glow', true)}</div>`,
      history: `
        <div class="settings-group"><p class="settings-label">Histórico</p>
        <div class="settings-info-row"><span class="settings-info-text">${LizData.savedConversations.length} conversas</span></div>
        <button class="settings-action-btn danger">${LizConfig.icons.trash} Limpar histórico</button></div>`,
      account: `
        <div class="settings-group"><p class="settings-label">Conta</p>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--radius-sm);border:1px solid var(--color-border-brand);margin-bottom:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--color-brand),var(--color-brand-dark));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">V</div>
          <div><div style="font-weight:600">Victor</div><div style="font-size:0.72rem;color:var(--color-text-muted)">victor@email.com</div></div>
        </div>
        <button class="settings-action-btn danger">${LizConfig.icons.close} Desconectar</button></div>`,
    };

    const content = pages[pageId] || '';
    MobileUI.openSheet(pageId.charAt(0).toUpperCase() + pageId.slice(1), content);
  },

  _toggle(label, id, checked) {
    return '<label class="settings-toggle"><span>' + label + '</span>' +
      '<input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + ' />' +
      '<span class="toggle-track"><span class="toggle-thumb"></span></span></label>';
  },

  _showFiles() {
    MobileUI.setActiveNav('files');
    LizData.loadUploadedFiles();
    const files = LizData.uploadedFiles;
    let html = '<div class="sheet-head"><h3 class="sheet-title">Arquivos</h3><button class="sheet-close" onclick="MobileUI.closePanel()">' + LizConfig.icons.close + '</button></div>';
    if (files.length === 0) {
      html += '<div style="text-align:center;padding:40px 20px;color:var(--color-text-muted);font-size:0.85rem"><p>Nenhum arquivo enviado</p></div>';
    } else {
      html += '<div style="padding:12px 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
      files.forEach((f) => {
        if (f.type && f.type.startsWith('image/')) {
          html += '<div style="aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--color-border)"><img src="' + f.dataUrl + '" alt="' + MobileUI._esc(f.name) + '" style="width:100%;height:100%;object-fit:cover" loading="lazy" /></div>';
        } else {
          html += '<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--radius-sm);border:1px solid var(--color-border);grid-column:1/-1"><span>' + LizConfig.icons.file + '</span><span style="font-size:0.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + MobileUI._esc(f.name) + '</span></div>';
        }
      });
      html += '</div>';
    }
    MobileUI.openPanel(html);
  },

  _applyTheme() {
    const stored = localStorage.getItem('liz-chat-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
    const btn = MobileUI.el.themeBtn;
    if (btn) {
      btn.innerHTML = stored === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
  },
};

document.addEventListener('DOMContentLoaded', () => MobileChat.init());
