/* ============================================================
 *  Liz Mobile — app.js
 *  Crown Hub — itens nascem das pontas da coroa
 * ============================================================ */
const App = {
  messages: [], currentTab: 'chat', currentTitle: null, isOpen: false,
  init() {
    LizData.loadSavedConversations(); LizData.loadUploadedFiles();
    this._cache(); this._renderBrand(); this._bindEvents(); this._applyTheme(); this._switchTab('chat');
  },
  _cache() {
    this.el = {
      headerTitle: document.getElementById('headerTitle'), status: document.getElementById('headerStatus'),
      chips: document.getElementById('chips'), emptyState: document.getElementById('emptyState'),
      msgList: document.getElementById('msgList'), input: document.getElementById('chatInput'),
      form: document.getElementById('chatForm'), sendBtn: document.getElementById('sendBtn'),
      themeBtn: document.getElementById('themeBtn'), toast: document.getElementById('toast'),
      fileInput: document.getElementById('fileInput'),
      crownHub: document.getElementById('crownHub'), crownTrigger: document.getElementById('crownTrigger'),
      crownIcon: document.getElementById('crownIcon'), crownOverlay: document.getElementById('crownOverlay'),
      modalOverlay: document.getElementById('modalOverlay'), modalTitle: document.getElementById('modalTitle'),
      modalBody: document.getElementById('modalBody'), modalClose: document.getElementById('modalClose'),
      pages: { chat: document.getElementById('pageChat'), settings: document.getElementById('pageSettings'), files: document.getElementById('pageFiles'), convs: document.getElementById('pageConvs') },
    };
  },
  _renderBrand() {
    const c = LizConfig.crown; this.el.crownIcon.innerHTML = c;
    const m = document.getElementById('headerCrownMini'); if (m) m.innerHTML = c;
    const s = document.getElementById('emptyCrownSlot'); if (s) s.innerHTML = c;
  },
  _open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.el.crownHub.classList.remove('is-closing');
    this.el.crownHub.classList.add('is-open');
    this.el.crownOverlay.classList.add('is-visible');
    this.el.crownOverlay.classList.remove('is-closing');
  },
  _close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.el.crownHub.classList.remove('is-open');
    this.el.crownHub.classList.add('is-closing');
    this.el.crownOverlay.classList.remove('is-visible');
    this.el.crownOverlay.classList.add('is-closing');
    setTimeout(() => {
      this.el.crownHub.classList.remove('is-closing');
      this.el.crownOverlay.classList.remove('is-closing');
    }, 400);
  },
  _toggle() { if (this.isOpen) this._close(); else this._open(); },
  _bindEvents() {
    this.el.crownTrigger.addEventListener('click', (e) => { e.stopPropagation(); this._toggle(); });
    document.querySelectorAll('.birth-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation(); const a = item.dataset.action;
        this._close();
        if (a === 'new') { setTimeout(() => this._newChat(), 300); return; }
        setTimeout(() => this._switchTab(a), 300);
      });
    });
    this.el.crownOverlay.addEventListener('click', () => this._close());
    this.el.themeBtn.addEventListener('click', () => this._toggleTheme());
    this.el.form.addEventListener('submit', (e) => { e.preventDefault(); this._send(); });
    this.el.input.addEventListener('input', () => { this.el.sendBtn.disabled = this.el.input.value.trim().length === 0; });
    this.el.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); } });
    const ab = document.getElementById('attachBtn'); if (ab) ab.addEventListener('click', () => this.el.fileInput.click());
    this.el.fileInput.addEventListener('change', (e) => { if (e.target.files.length) this._handleFiles(e.target.files); e.target.value = ''; });
    this.el.chips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const texts = { code: 'Me ajude com código sobre: ', design: 'Me ajude com design sobre: ', errors: 'Analise este erro: ', ideas: 'Me dê ideias sobre: ' };
        this.el.input.value = texts[chip.dataset.mode] || ''; this.el.input.focus(); this.el.sendBtn.disabled = false;
      });
    });
    this.el.modalClose.addEventListener('click', () => this._closeModal());
    this.el.modalOverlay.addEventListener('click', (e) => { if (e.target === this.el.modalOverlay) this._closeModal(); });
    this._toastTimer = null;
  },
  _switchTab(tab) {
    this.currentTab = tab;
    Object.values(this.el.pages).forEach(p => p.classList.remove('is-active'));
    const map = { chat: 'chat', convs: 'convs', settings: 'settings', files: 'files' };
    const key = map[tab]; if (key && this.el.pages[key]) this.el.pages[key].classList.add('is-active');
    if (tab === 'settings') this._renderSettings();
    if (tab === 'files') this._renderFiles(); if (tab === 'convs') this._renderConvs();
    const cw = document.getElementById('composerWrap'); if (cw) cw.style.display = tab === 'chat' ? '' : 'none';
    const names = { chat: 'Online', convs: 'Histórico', settings: 'Ajustes', files: 'Arquivos' };
    this.el.status.textContent = names[tab] || ''; this.el.headerTitle.textContent = tab === 'chat' ? 'Liz' : names[tab] || '';
    if (key && this.el.pages[key]) this.el.pages[key].scrollTop = 0;
  },
  _newChat() {
    if (this.messages.length > 0) this._saveConv();
    this.messages = []; this.currentTitle = null;
    this.el.input.value = ''; this.el.sendBtn.disabled = true;
    this.el.emptyState.classList.remove('is-hidden'); this.el.msgList.classList.add('is-hidden'); this.el.msgList.innerHTML = '';
    this.el.status.textContent = 'Online'; this.el.headerTitle.textContent = 'Liz';
    this._close(); this._switchTab('chat');
  },
  _send() {
    const text = this.el.input.value.trim(); if (!text) return;
    const wasEmpty = !this.messages.length;
    this.messages.push({ role: 'user', content: text, time: this._now() });
    if (wasEmpty) {
      this.currentTitle = text.slice(0, 35); this.el.emptyState.classList.add('is-hidden');
      this.el.msgList.classList.remove('is-hidden'); this.el.status.textContent = this.currentTitle;
      this._renderAllMsgs();
    } else this._appendMsg(this.messages[this.messages.length - 1]);
    this.el.input.value = ''; this.el.sendBtn.disabled = true; this._scroll();
    setTimeout(() => this._reply(text), 600 + Math.random() * 400);
  },
  _reply(text) {
    const t = text.toLowerCase(); let reply = LizData.replies.default[0];
    if (/(código|codigo|função|script|react|javascript|js)/.test(t)) reply = LizData.replies.code[0];
    else if (/(design|ui|visual|cor|css|estilo)/.test(t)) reply = LizData.replies.design[0];
    else if (/(erro|error|bug|falha)/.test(t)) reply = LizData.replies.error[0];
    else if (/(ideia|ideias|brainstorm|nome|sugest)/.test(t)) reply = LizData.replies.ideas[0];
    const msg = { role: 'liz', content: reply, time: this._now() };
    this.messages.push(msg); this._appendMsg(msg); this._saveConv();
  },
  _renderAllMsgs() { this.el.msgList.innerHTML = this.messages.map((m,i) => this._html(m,i)).join(''); },
  _appendMsg(msg) { const d=document.createElement('div'); d.innerHTML=this._html(msg,this.messages.length-1); this.el.msgList.appendChild(d.firstElementChild); this._scroll(); },
  _html(m,idx) {
    const time=m.time?'<p class="msg-time">'+m.time+'</p>':''; const di=idx!==undefined?' data-i="'+idx+'"':'';
    if(m.file){return'<div class="msg msg-user"'+di+'><div class="msg-bubble msg-bubble-user">'+(m.file.type?.startsWith('image/')?'<img src="'+m.file.dataUrl+'" style="max-width:200px;border-radius:8px;display:block" loading="lazy" />':'<span style="opacity:0.5;display:flex;gap:6px">'+LizConfig.icons.file+this._esc(m.file.name)+'</span>')+'</div>'+time+'</div>';}
    if(m.role==='user'){return'<div class="msg msg-user"'+di+'><div class="msg-bubble msg-bubble-user"><div class="msg-text">'+this._esc(m.content)+'</div></div>'+time+'</div>';}
    return'<div class="msg msg-liz"'+di+'><div class="msg-avatar">'+LizConfig.crown+'</div><div><div class="msg-bubble msg-bubble-liz"><span class="msg-name">Liz</span><div class="msg-text">'+this._markdown(m.content)+'</div></div>'+time+'</div></div>';
  },
  _markdown(t){let h=this._esc(t);h=h.replace(/```(\w+)?\n?([\s\S]*?)```/g,'<pre style="margin:6px 0;padding:8px 10px;background:rgba(0,0,0,0.3);border-radius:8px;font-size:0.78rem;overflow-x:auto"><code>$2</code></pre>');h=h.replace(/`([^`\n]+)`/g,'<code style="background:rgba(139,92,246,0.1);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>');h=h.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');return h.replace(/\n/g,'<br>');},
  _esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},
  _now(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});},
  _scroll(){requestAnimationFrame(()=>{const p=document.getElementById('pageChat');if(p)p.scrollTop=p.scrollHeight;});},
  _saveConv(){if(!this.messages.length)return;this.currentTitle=this.currentTitle||'Nova conversa';LizData.saveConversation(this.currentTitle,this.messages);},
  _renderConvs(){
    const p=this.el.pages.convs;if(!p)return;const g=LizData.getConversationGroups();
    let h='<div style="padding:16px 14px 8px"><h2 style="font-size:1rem;font-weight:700">Histórico</h2></div>';
    if(!g.length||g.every(x=>!x.items.length)){h+='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80%;padding:60px 40px;color:var(--text-muted);font-size:0.85rem"><p>Nenhuma conversa</p></div>';}
    else{h+='<div style="padding:8px 14px 20px;display:flex;flex-direction:column;gap:6px">';g.forEach(gr=>{h+='<p style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:8px 2px 4px">'+this._esc(gr.period)+'</p>';gr.items.forEach(it=>{h+='<button class="conv-card" data-id="'+this._esc(it.id)+'"><span class="conv-card-icon">'+LizConfig.icons.chats+'</span><div class="conv-card-info"><div class="conv-card-title">'+this._esc(it.title)+'</div><div class="conv-card-preview">'+this._esc(it.preview||'')+'</div></div></button>';});});h+='</div>';}
    p.innerHTML=h;p.querySelectorAll('.conv-card').forEach(c=>c.addEventListener('click',()=>{const id=c.dataset.id;const s=LizData.getConversationById(id);if(s&&s.messages.length){this.messages=s.messages.map(m=>({...m}));this.currentTitle=s.title;this.el.emptyState.classList.add('is-hidden');this.el.msgList.classList.remove('is-hidden');this._renderAllMsgs();this.el.status.textContent=s.title;this._switchTab('chat');}}));
  },
  _renderSettings(){
    const p=this.el.pages.settings;if(!p)return;
    p.innerHTML='<div style="padding:16px 14px 8px"><h2 style="font-size:1rem;font-weight:700">Ajustes</h2></div><div class="set-list">'+
      '<button class="set-item" data-set="theme"><span class="set-icon">'+LizConfig.icons.sun+'</span>Aparência<span class="set-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></span></button>'+
      '<button class="set-item" data-set="about"><span class="set-icon">'+LizConfig.icons.code+'</span>Sobre</button></div>';
    p.querySelectorAll('.set-item').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(btn.dataset.set==='theme'){const c=document.documentElement.getAttribute('data-theme')||'dark';this._openModal('Aparência','<div class="set-toggle"><span>Tema escuro</span><label><input type="checkbox"'+(c==='dark'?'checked':'')+' onchange="App._toggleTheme()"/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div>');}
        else this._toast('Liz Mobile — Liz Ai Studios 💜');
      });
    });
  },
  _renderFiles(){
    LizData.loadUploadedFiles();const files=LizData.uploadedFiles;const p=this.el.pages.files;if(!p)return;
    const imgs=files.filter(f=>f.type?.startsWith('image/'));const docs=files.filter(f=>!f.type?.startsWith('image/'));
    let h='<div class="files-header"><h2>Arquivos</h2><button class="files-add" id="fileAddBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button></div>';
    if(!files.length){h+='<div class="files-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg><p>Nenhum arquivo</p></div>';}
    else{h+='<div class="files-grid">';imgs.forEach(f=>h+='<div class="files-item"><img src="'+f.dataUrl+'" alt="'+this._esc(f.name)+'" loading="lazy" /></div>');docs.forEach(f=>h+='<div class="files-item-doc"><span class="doc-icon">'+LizConfig.icons.file+'</span><span>'+this._esc(f.name)+'</span></div>');h+='</div>';}
    p.innerHTML=h;const ab=document.getElementById('fileAddBtn');if(ab)ab.addEventListener('click',()=>this.el.fileInput.click());
  },
  _handleFiles(files){[...files].forEach(file=>{if(file.size>10*1024*1024){this._toast('Arquivo muito grande');return;}const r=new FileReader();r.onload=(e)=>{LizData.saveUploadedFile({name:file.name,size:file.size,type:file.type,dataUrl:e.target.result,convTitle:this.currentTitle||'Mobile'});if(this.currentTab==='files')this._renderFiles();if(this.currentTab==='chat'){this.messages.push({role:'user',content:'',file:{name:file.name,size:file.size,type:file.type,dataUrl:e.target.result},time:this._now()});if(this.messages.length===1){this.currentTitle='Arquivo: '+file.name.slice(0,25);this.el.emptyState.classList.add('is-hidden');this.el.msgList.classList.remove('is-hidden');this.el.status.textContent=this.currentTitle;this._renderAllMsgs();}else this._appendMsg(this.messages[this.messages.length-1]);this._saveConv();}this._toast('Arquivo recebido!');};r.readAsDataURL(file);});},
  _openModal(t,h){this.el.modalTitle.textContent=t;this.el.modalBody.innerHTML=h;this.el.modalOverlay.classList.add('show');},
  _closeModal(){this.el.modalOverlay.classList.remove('show');},
  _applyTheme(){const s=localStorage.getItem('liz-chat-theme')||'dark';document.documentElement.setAttribute('data-theme',s);this._updateThemeIcon(s);},
  _toggleTheme(){const c=document.documentElement.getAttribute('data-theme')||'dark';const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('liz-chat-theme',n);this._updateThemeIcon(n);const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',n==='dark'?'#08060e':'#f8f4f0');},
  _updateThemeIcon(t){this.el.themeBtn.innerHTML=t==='dark'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';},
  _toast(m){const t=this.el.toast;t.textContent=m;t.classList.add('show');clearTimeout(this._toastTimer);this._toastTimer=setTimeout(()=>t.classList.remove('show'),2000);},
};
document.addEventListener('DOMContentLoaded',()=>App.init());
