/* ============================================================
 *  Liz Mobile — ui-core.js
 *  Objeto base MobileUI
 * ============================================================ */

const MobileUI = {
  el: {},
  activeSheet: null,
  activeNav: 'chat',

  init() {
    this.el = {
      app: document.getElementById('app'),
      header: document.getElementById('header'),
      headerTitle: document.getElementById('header-title'),
      headerStatus: document.getElementById('header-status'),
      main: document.getElementById('main'),
      nav: document.getElementById('nav'),
      emptyState: document.getElementById('empty-state'),
      messages: document.getElementById('messages'),
      form: document.getElementById('chat-form'),
      input: document.getElementById('chat-input'),
      sendBtn: document.getElementById('send-btn'),
      themeBtn: document.getElementById('theme-btn'),
      overlay: document.getElementById('overlay'),
      sheet: document.getElementById('sheet'),
      sheetBody: document.getElementById('sheet-body'),
      panelFull: document.getElementById('panel-full'),
      panelBody: document.getElementById('panel-body'),
      toast: document.getElementById('toast'),
    };
  },

  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _markdown(text) {
    let html = this._esc(text);
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
    html = html.replace(/`([^`\n]+)`/g, '<code class="code-inline">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
  },

  _formatTime(d) {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  },

  toast(msg) {
    const t = this.el.toast;
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2000);
  },

  /* ============ SHEET (bottom sheet) ============ */
  openSheet(title, bodyHTML) {
    const s = this.el.sheet;
    const overlay = this.el.overlay;
    if (!s) return;
    this.el.sheet.querySelector('.sheet-title').textContent = title;
    this.el.sheetBody.innerHTML = bodyHTML;
    overlay.classList.add('is-visible');
    s.classList.add('is-open');
    this.activeSheet = title;
  },

  closeSheet() {
    const s = this.el.sheet;
    const overlay = this.el.overlay;
    if (!s) return;
    s.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    this.activeSheet = null;
  },

  /* ============ FULL PANEL ============ */
  openPanel(bodyHTML) {
    const p = this.el.panelFull;
    const overlay = this.el.overlay;
    if (!p) return;
    this.el.panelBody.innerHTML = bodyHTML;
    overlay.classList.add('is-visible');
    p.classList.add('is-open');
  },

  closePanel() {
    const p = this.el.panelFull;
    const overlay = this.el.overlay;
    if (!p) return;
    p.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  },

  /* ============ NAVEGAÇÃO ============ */
  setActiveNav(action) {
    this.activeNav = action;
  },
};

window.MobileUI = MobileUI;
