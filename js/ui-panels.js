/* ============================================================
 *  Liz — ui-panels.js
 *  Painéis modais, menu pills, tema, settings count/memory
 * ============================================================ */

// ===================== MENU PILLS =====================
LizUI.setActivePill = function(action) {
  document.querySelectorAll('.float-pill[data-action]').forEach((p) => p.classList.toggle('is-active', p.dataset.action === action));
  this.activePill = action;
};

LizUI.clearActivePill = function() {
  document.querySelectorAll('.float-pill[data-action]').forEach((p) => p.classList.remove('is-active'));
  this.activePill = null;
};

// ===================== COROA TOGGLE =====================
LizUI._pulseMainCrown = function() {
  this.el.crownToggle.classList.remove('is-pulsing');
  void this.el.crownToggle.offsetWidth;
  this.el.crownToggle.classList.add('is-pulsing');
};

LizUI.toggleTools = function() {
  if (window.matchMedia('(max-width: 700px)').matches) return;
  const menu = document.getElementById('floating-menu');
  const app = document.querySelector('.chat-app');
  if (!menu || !app) return;
  this._hideMainFloatPanel();
  this._pulseMainCrown();
  const willCollapse = !menu.classList.contains('is-collapsed');
  if (willCollapse) {
    menu.classList.remove('is-expanded'); menu.classList.add('is-collapsed');
    app.classList.add('is-menu-collapsed');
  } else {
    menu.classList.remove('is-collapsed'); menu.classList.add('is-expanded');
    app.classList.remove('is-menu-collapsed');
  }
  this.el.crownToggle.setAttribute('aria-expanded', String(!willCollapse));
};

// ===================== PAINÉIS MODAIS =====================
LizUI.openPanel = function(name) {
  const panel = this.el.panels[name];
  if (!panel) return;
  if (this._closePanelTimer) { clearTimeout(this._closePanelTimer); this._closePanelTimer = null; }
  this.closePanel();
  this.activePanel = name;
  panel.classList.remove('is-closing');
  this.el.overlay.classList.remove('is-closing');
  this.el.overlay.classList.add('is-visible');
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  this.setActivePill(name);
};

LizUI.closePanel = function() {
  this._hideFloatPanel();
  this._hideMainFloatPanel();
  if (!this.activePanel) return;
  if (this._closePanelTimer) { clearTimeout(this._closePanelTimer); this._closePanelTimer = null; }
  const panel = this.el.panels[this.activePanel];
  if (panel) {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    this.el.overlay.classList.remove('is-visible');
    if (panel.classList.contains('panel-fullscreen')) { } else {
      panel.classList.add('is-closing');
      this.el.overlay.classList.add('is-closing');
    }
    this._closePanelTimer = setTimeout(() => {
      panel.classList.remove('is-closing');
      this.el.overlay.classList.remove('is-closing');
      this._closePanelTimer = null;
    }, 280);
  } else {
    this.el.overlay.classList.remove('is-visible');
  }
  this.activePanel = null;
  this.clearActivePill();
};

// ===================== FLOAT PANEL (menu principal) =====================
LizUI._showFloatPanel = function(action) {
  const existing = document.getElementById('proj-float-panel');
  if (existing && existing.classList.contains('is-visible') && existing.dataset.action === action) { this._hideFloatPanel(); return; }
  const old = document.getElementById('proj-float-panel');
  if (old) old.remove();
  const panel = document.createElement('div');
  panel.id = 'proj-float-panel';
  panel.className = 'liz-proj-float-panel';
  panel.dataset.action = action;
  const titles = { conversations: 'Conversas recentes', tools: 'Ferramentas da Liz', settings: 'Ajustes' };
  const icons = { conversations: LizConfig.icons.chats || '', tools: LizConfig.icons.tools || '', settings: LizConfig.icons.settings || '' };
  const title = titles[action] || action;
  let bodyHtml = '';
  if (action === 'tools') {
    bodyHtml = '<div class="liz-proj-float-tools">' + LizData.tools.map((t) =>
      '<button class="liz-proj-float-tool" type="button"><span class="liz-proj-float-tool-ico">' + (LizConfig.icons[t.icon] || LizConfig.icons.sparkle) + '</span><span>' + t.title + '</span></button>'
    ).join('') + '</div>';
  } else if (action === 'conversations') {
    const groups = typeof LizData.getConversationGroups === 'function' ? LizData.getConversationGroups() : [];
    if (!groups.length || !groups[0].items.length) {
      bodyHtml = '<div class="liz-proj-float-empty">Nenhuma conversa ainda</div>';
    } else {
      bodyHtml = '<div class="liz-proj-float-convs">';
      groups.forEach((g) => g.items.forEach((item) => {
        bodyHtml += '<button class="liz-proj-float-conv" type="button"><span class="liz-proj-float-conv-ico">' + (LizConfig.icons.chats || '') + '</span><span class="liz-proj-float-conv-title">' + item.title + '</span></button>';
      }));
      bodyHtml += '</div>';
    }
  }
  panel.innerHTML = '<div class="liz-proj-float-head"><span class="liz-proj-float-title"><span class="liz-proj-float-title-ico">' + (icons[action] || '') + '</span>' + title + '</span>' +
    '<button class="liz-proj-float-close" type="button">' + (LizConfig.icons.close || '×') + '</button></div><div class="liz-proj-float-body">' + bodyHtml + '</div>';
  document.body.appendChild(panel);
  void panel.offsetHeight;
  panel.classList.add('is-visible');
  panel.querySelector('.liz-proj-float-close').addEventListener('click', () => this._hideFloatPanel());
  setTimeout(() => {
    const handler = (e) => {
      if (!panel.contains(e.target) && !e.target.closest('.liz-proj-mini-pill')) { this._hideFloatPanel(); document.removeEventListener('click', handler); }
    };
    document.addEventListener('click', handler);
    panel._outsideHandler = handler;
  }, 10);
  const escHandler = (e) => { if (e.key === 'Escape') { this._hideFloatPanel(); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);
  panel._escHandler = escHandler;
};

LizUI._hideFloatPanel = function() {
  const panel = document.getElementById('proj-float-panel');
  if (!panel) return;
  panel.classList.remove('is-visible');
  if (panel._outsideHandler) document.removeEventListener('click', panel._outsideHandler);
  if (panel._escHandler) document.removeEventListener('keydown', panel._escHandler);
  setTimeout(() => panel.remove(), 260);
};

// ===================== MAIN FLOAT PANEL =====================
LizUI._showMainFloatPanel = function(action) {
  const existing = document.getElementById('main-float-panel');
  if (existing && existing.classList.contains('is-visible') && existing.dataset.action === action) { this._hideMainFloatPanel(); return; }
  const old = document.getElementById('main-float-panel');
  if (old) old.remove();
  this._hideFloatPanel();
  this.setActivePill(action);
  const panel = document.createElement('div');
  panel.id = 'main-float-panel';
  panel.className = 'liz-main-float-panel';
  panel.dataset.action = action;
  const titles = { conversations: 'Conversas recentes', tools: 'Ferramentas da Liz', settings: 'Ajustes' };
  const icons = { conversations: LizConfig.icons.chats || '', tools: LizConfig.icons.tools || '', settings: LizConfig.icons.settings || '' };
  const title = titles[action] || action;
  let bodyHtml = '';
  if (action === 'tools') {
    bodyHtml = '<div class="liz-proj-float-tools">' + LizData.tools.map((t) =>
      '<button class="liz-proj-float-tool" type="button"><span class="liz-proj-float-tool-ico">' + (LizConfig.icons[t.icon] || LizConfig.icons.sparkle) + '</span><span>' + t.title + '</span></button>'
    ).join('') + '</div>';
  } else if (action === 'conversations') {
    const groups = typeof LizData.getConversationGroups === 'function' ? LizData.getConversationGroups() : [];
    if (!groups.length || !groups[0].items.length) {
      bodyHtml = '<div class="liz-proj-float-empty">Nenhuma conversa ainda</div>';
    } else {
      bodyHtml = '<div class="liz-proj-float-convs">';
      groups.forEach((g) => g.items.forEach((item) => {
        bodyHtml += '<button class="liz-proj-float-conv" type="button"><span class="liz-proj-float-conv-ico">' + (LizConfig.icons.chats || '') + '</span><span class="liz-proj-float-conv-title">' + item.title + '</span></button>';
      }));
      bodyHtml += '</div>';
    }
  }
  panel.innerHTML = '<div class="liz-proj-float-head"><span class="liz-proj-float-title"><span class="liz-proj-float-title-ico">' + (icons[action] || '') + '</span>' + title + '</span>' +
    '<button class="liz-proj-float-close" type="button">' + (LizConfig.icons.close || '×') + '</button></div><div class="liz-proj-float-body">' + bodyHtml + '</div>';
  document.body.appendChild(panel);
  void panel.offsetHeight;
  panel.classList.add('is-visible');
  panel.querySelector('.liz-proj-float-close').addEventListener('click', () => this._hideMainFloatPanel());
  setTimeout(() => {
    const handler = (e) => {
      if (!panel.contains(e.target) && !e.target.closest('.float-pill')) { this._hideMainFloatPanel(); document.removeEventListener('click', handler); }
    };
    document.addEventListener('click', handler);
    panel._outsideHandler = handler;
  }, 10);
  const escHandler = (e) => { if (e.key === 'Escape') { this._hideMainFloatPanel(); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);
  panel._escHandler = escHandler;
};

LizUI._hideMainFloatPanel = function() {
  const panel = document.getElementById('main-float-panel');
  if (!panel) return;
  panel.classList.remove('is-visible');
  if (panel._outsideHandler) document.removeEventListener('click', panel._outsideHandler);
  if (panel._escHandler) document.removeEventListener('keydown', panel._escHandler);
  this.clearActivePill();
  setTimeout(() => panel.remove(), 260);
};

// ===================== RENDER PANELS =====================
LizUI.renderPanels = function() {
  this._renderConversations('');
  this.el.toolsContent.innerHTML = LizData.tools.map((t) =>
    '<button class="tool-card" type="button"><span class="tool-card-ico">' + (LizConfig.icons[t.icon] || LizConfig.icons.sparkle) + '</span><span class="tool-card-title">' + this._esc(t.title) + '</span></button>'
  ).join('');
  this.el.projectsContent.innerHTML = '';
  this._syncThemeSegmented();
  this._initSettingsEvents();
};

LizUI._renderConversations = function(filter) {
  const f = filter.trim().toLowerCase();
  let html = '';
  var groups = (typeof LizData.getConversationGroups === 'function') ? LizData.getConversationGroups() : LizData.conversationGroups;
  groups.forEach((group) => {
    const items = group.items.filter((it) => it.title.toLowerCase().includes(f) || it.preview.toLowerCase().includes(f));
    if (!items.length) return;
    html += '<p class="panel-group-title">' + this._esc(group.period) + '</p>' +
      items.map((it) => '<button class="conv-card" type="button" data-id="' + this._esc(it.id) + '"><div class="conv-card-title">' + this._esc(it.title) + '</div><div class="conv-card-preview">' + this._esc(it.preview) + '</div></button>').join('');
  });
  if (!html) html = '<p class="panel-group-title">Nenhuma conversa encontrada.</p>';
  this.el.conversationsContent.innerHTML = html;
};

// ===================== TEMA =====================
LizUI.initTheme = function() {
  const stored = localStorage.getItem(LizConfig.theme.storageKey) || 'auto';
  const effective = stored === 'auto' ? this._systemTheme() : stored;
  this.setTheme(effective, false);
  localStorage.setItem(LizConfig.theme.storageKey, stored);
  this.el.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    if (document.startViewTransition) {
      document.startViewTransition(() => { this.setTheme(nextTheme, true); });
    } else {
      const root = document.documentElement;
      root.classList.remove('theme-morphing');
      void root.offsetWidth;
      root.classList.add('theme-morphing');
      this.setTheme(nextTheme, true);
      setTimeout(() => root.classList.remove('theme-morphing'), 850);
    }
  });
  if (stored === 'auto') this._watchSystemTheme();
};

LizUI.setTheme = function(theme, persist) {
  document.documentElement.setAttribute('data-theme', theme);
  // Atualiza a cor da barra de endereço no mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#050505' : '#faf5f0');
  if (persist !== false) localStorage.setItem(LizConfig.theme.storageKey, theme);
  const isDark = theme === 'dark';
  const thumb = this.el.themeThumb || document.querySelector('.theme-toggle-thumb');
  if (thumb) {
    thumb.innerHTML = isDark
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    thumb.style.transform = `translateX(${isDark ? 0 : 24}px) rotate(${isDark ? 0 : 180}deg)`;
    thumb.style.background = isDark ? '#8b5cf6' : '#f59e0b';
  }
  this.el.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
  this._syncThemeSegmented();
};

LizUI._systemTheme = function() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

LizUI._watchSystemTheme = function() {
  this._unwatchSystemTheme();
  this._themeMedia = window.matchMedia('(prefers-color-scheme: light)');
  this._themeHandler = (e) => {
    if (localStorage.getItem(LizConfig.theme.storageKey) === 'auto') {
      const theme = e.matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    }
  };
  this._themeMedia.addEventListener('change', this._themeHandler);
};

LizUI._unwatchSystemTheme = function() {
  if (this._themeMedia && this._themeHandler) { this._themeMedia.removeEventListener('change', this._themeHandler); }
  this._themeMedia = null;
  this._themeHandler = null;
};

LizUI._syncThemeSegmented = function() {
  const stored = localStorage.getItem(LizConfig.theme.storageKey) || 'auto';
  document.querySelectorAll('.seg-btn[data-theme-val]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.themeVal === stored);
  });
};

// ===================== SETTINGS EVENTS =====================
LizUI._initSettingsEvents = function() {
  this._loadUserData();
  this._updateMemoryInfo();
  this._restoreNewSettings();
};

LizUI._restoreNewSettings = function() {
  const savedFontSize = localStorage.getItem('liz-font-size');
  if (savedFontSize) { document.documentElement.setAttribute('data-font-size', savedFontSize);
    document.querySelectorAll('#font-size-segmented .seg-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.fontSize === savedFontSize));
  } else { document.querySelector('#font-size-segmented .seg-btn[data-font-size="medium"]')?.classList.add('is-active'); }
  const savedDensity = localStorage.getItem('liz-density');
  if (savedDensity) { document.documentElement.setAttribute('data-density', savedDensity);
    document.querySelectorAll('#density-segmented .seg-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.density === savedDensity));
  } else { document.querySelector('#density-segmented .seg-btn[data-density="comfortable"]')?.classList.add('is-active'); }
  const savedAccent = localStorage.getItem('liz-accent-color');
  if (savedAccent) {
    document.documentElement.style.setProperty('--color-brand', savedAccent);
    const savedName = localStorage.getItem('liz-accent-name') || 'purple';
    document.querySelectorAll('#accent-color-grid .accent-color-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.accent === savedName));
  }
  const savedCodeFont = localStorage.getItem('liz-code-font');
  if (savedCodeFont) { document.documentElement.setAttribute('data-code-font', savedCodeFont);
    const cf = document.getElementById('settings-code-font'); if (cf) cf.value = savedCodeFont; }
  const savedRetention = localStorage.getItem('liz-retention');
  if (savedRetention) { document.querySelectorAll('#retention-segmented .seg-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.retention === savedRetention)); }
  const enterSend = document.getElementById('settings-enter-send');
  if (enterSend) { const saved = localStorage.getItem('liz-enter-send'); if (saved !== null) enterSend.checked = saved === 'true'; }
  const savedLang = localStorage.getItem('liz-language');
  if (savedLang) { const ls = document.getElementById('settings-language'); if (ls) ls.value = savedLang; }
};

LizUI._updateSettingsCounts = function() {
  const countEl = document.getElementById('settings-history-count');
  const filesEl = document.getElementById('settings-files-count');
  if (countEl) { const c = LizData.savedConversations.length; countEl.textContent = c + ' conversa' + (c !== 1 ? 's' : '') + ' salva' + (c !== 1 ? 's' : ''); }
  if (filesEl) { LizData.loadUploadedFiles(); const c = LizData.uploadedFiles.length; filesEl.textContent = c + ' arquivo' + (c !== 1 ? 's' : ''); }
};

LizUI._updateMemoryInfo = function() {
  const bar = document.getElementById('memory-bar-fill');
  const text = document.getElementById('memory-used-text');
  if (!bar || !text) return;
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k); if (k && v) totalBytes += k.length + v.length; }
    totalBytes = totalBytes * 2;
    const LIMIT = 5 * 1024 * 1024;
    const percentage = Math.min((totalBytes / LIMIT) * 100, 100);
    bar.style.width = percentage.toFixed(1) + '%';
    text.textContent = (totalBytes / 1024).toFixed(1) + ' KB usados';
    if (percentage > 80) bar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    else if (percentage > 60) bar.style.background = 'linear-gradient(90deg, var(--color-brand), #f59e0b)';
    else bar.style.background = 'linear-gradient(90deg, var(--color-brand), var(--color-brand-light))';
    const convCount = document.getElementById('settings-cache-conversations');
    const imgCount = document.getElementById('settings-cache-images');
    const fileCount = document.getElementById('settings-cache-files');
    if (convCount) { const n = LizData.savedConversations.length; convCount.textContent = n + ' conversa' + (n !== 1 ? 's' : ''); }
    if (imgCount || fileCount) {
      LizData.loadUploadedFiles();
      const imgs = LizData.uploadedFiles.filter((f) => f.type && f.type.startsWith('image/'));
      const docs = LizData.uploadedFiles.filter((f) => !f.type || !f.type.startsWith('image/'));
      if (imgCount) imgCount.textContent = imgs.length + ' imagem' + (imgs.length !== 1 ? 'ns' : '');
      if (fileCount) fileCount.textContent = docs.length + ' arquivo' + (docs.length !== 1 ? 's' : '');
    }
  } catch (e) { text.textContent = 'Indisponível'; }
};

LizUI._loadUserData = function() {
  try {
    const savedName = localStorage.getItem('liz-user-name');
    const savedEmail = localStorage.getItem('liz-user-email');
    const nameInput = document.getElementById('user-name-input');
    const emailInput = document.getElementById('settings-email-input');
    const nameDisplay = document.getElementById('account-name-display');
    const avatarLetter = document.querySelector('.account-avatar-letter');
    if (savedName && nameInput) nameInput.value = savedName;
    if (savedName && nameDisplay) nameDisplay.textContent = savedName;
    if (savedName && avatarLetter) avatarLetter.textContent = savedName[0].toUpperCase();
    if (savedEmail && emailInput) emailInput.value = savedEmail;
  } catch (e) { /* ignore */ }
};
