(function(){
const App={msgs:[],tab:'chat',title:null};
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

App.init=function(){
  LizData.loadSavedConversations();LizData.loadUploadedFiles();
  this._brand();this._theme();this._toggle();this._tabs();this._chat();
  const s=localStorage.getItem('liz-chat-theme')||'dark';
  document.documentElement.setAttribute('data-theme',s);
  const m=document.querySelector('meta[name="theme-color"]');
  if(m)m.setAttribute('content',s==='dark'?'#08060e':'#f8f4f0');
};

App._brand=function(){
  const c=LizConfig.crown;
  const hc=$('#hc');if(hc)hc.innerHTML=c;
  const ec=$('#ec');if(ec)ec.innerHTML=c;
};

App._theme=function(){
  const btn=$('#tb');
  function setIcon(t){btn.innerHTML=t==='dark'
    ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';}
  setIcon(localStorage.getItem('liz-chat-theme')||'dark');
  btn.addEventListener('click',()=>{
    const c=document.documentElement.getAttribute('data-theme')||'dark';
    const n=c==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',n);
    localStorage.setItem('liz-chat-theme',n);
    const m=document.querySelector('meta[name="theme-color"]');
    if(m)m.setAttribute('content',n==='dark'?'#08060e':'#f8f4f0');
    setIcon(n);
  });
};

App._toggle=function(){
  const btn=$('#crownToggle');const bar=$('.tools-bar');
  btn.addEventListener('click',()=>{
    const willCollapse=!bar.classList.contains('is-collapsed');
    if(willCollapse){
      bar.classList.remove('is-expanded');bar.classList.add('is-collapsed');
    }else{
      bar.classList.remove('is-collapsed');bar.classList.add('is-expanded');
    }
    btn.setAttribute('aria-label',willCollapse?'Mostrar ferramentas':'Esconder ferramentas');
  });
  // Começa expandido
  bar.classList.remove('is-collapsed');bar.classList.add('is-expanded');
};

App._tabs=function(){
  const pills=$$('.tool-pill');
  // Modal close
  $('#modalClose')?.addEventListener('click',()=>this._closeModal());
  $('#modalOverlay')?.addEventListener('click',(e)=>{if(e.target===e.currentTarget)this._closeModal();});

  // Close/back
  $('#closeBtn')?.addEventListener('click',()=>{
    // Se o mural estiver aberto, fecha ele
    if(LizUI.mural.overlay&&LizUI.mural.overlay.classList.contains('is-open')){
      LizUI.mural.close();return;
    }
    $('.tool-pill[data-t="chat"]')?.click();
  });
  $('#backBtn')?.addEventListener('click',function(){
    // Se o mural estiver aberto, fecha ele
    if(LizUI.mural.overlay&&LizUI.mural.overlay.classList.contains('is-open')){
      LizUI.mural.close();return;
    }
    document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('is-active'));
    document.getElementById('pChat')?.classList.add('is-active');
    $('.tools-bar').classList.remove('is-collapsed');$('.tools-bar').classList.add('is-expanded');
    $('#backBtn').style.display='none';$('#closeBtn').style.visibility='hidden';$('#hSep').style.display='none';$('#hSub').textContent='';
    $('#ht').textContent='Liz';App.tab='chat';
    $$('.tool-pill').forEach(x=>x.classList.toggle('is-active',x.dataset.t==='chat'));
  });

  pills.forEach(p=>{
    p.addEventListener('click',()=>{
      const a=p.dataset.t;
      // Chat: mostra conversas se já estiver no chat
      if(a==='chat'&&this.tab==='chat'){this._showConvs();return;}
      if(a===this.tab)return;
      this.tab=a;
      pills.forEach(x=>x.classList.toggle('is-active',x===p));
      $$('.page').forEach(pg=>pg.classList.remove('is-active'));
      // Minimiza ferramentas ao entrar em outras seções
      if(a!=='chat'){$('.tools-bar').classList.add('is-collapsed');$('.tools-bar').classList.remove('is-expanded');
        $('#backBtn').style.display='';$('#closeBtn').style.visibility='visible';
        $('#hSep').style.display='';$('#hSub').textContent={settings:'Ajustes',tools:'Ferramentas'}[a]||'';}
      else{$('.tools-bar').classList.remove('is-collapsed');$('.tools-bar').classList.add('is-expanded');
        $('#backBtn').style.display='none';$('#closeBtn').style.visibility='hidden';$('#hSep').style.display='none';$('#hSub').textContent='';}
      if(a==='newchat'){this._newChat();return;}
      if(a==='archive'){
        $('.tools-bar').classList.add('is-collapsed');$('.tools-bar').classList.remove('is-expanded');
        $('#backBtn').style.display='';$('#closeBtn').style.visibility='visible';
        $('#hSep').style.display='';$('#hSub').textContent='Mural';
        LizUI.mural.onClose=function(){
          document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('is-active'));
          document.getElementById('pChat')?.classList.add('is-active');
          $('.tools-bar').classList.remove('is-collapsed');$('.tools-bar').classList.add('is-expanded');
          $('#backBtn').style.display='none';$('#closeBtn').style.visibility='hidden';$('#hSep').style.display='none';$('#hSub').textContent='';
          $('#ht').textContent='Liz';App.tab='chat';
          $$('.tool-pill').forEach(x=>x.classList.toggle('is-active',x.dataset.t==='chat'));
        };
        LizUI.mural.open();return;
      }
      if(a==='chat'){document.getElementById('pChat')?.classList.add('is-active');$('#ht').textContent='Liz';return;}
      const map={settings:'pSettings',tools:'pTools'};
      const pid=map[a];if(pid){const pg=document.getElementById(pid);if(pg)pg.classList.add('is-active');}
      if(a==='settings')this._settings();
      if(a==='tools')this._tools();
      $('#ht').textContent='Liz';
    });
  });
};

App._chat=function(){
  const form=$('#cf');const input=$('#ci');const send=$('#sb');
  const empty=$('#empty');const list=$('#ml');const content=$('#chatContent');

  form.addEventListener('submit',e=>{e.preventDefault();this._send();});
  input.addEventListener('input',()=>{send.disabled=input.value.trim().length===0;});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this._send();}});

  $('#ch').querySelectorAll('.chip').forEach(c=>{
    c.addEventListener('click',()=>{
      const texts={code:'Me ajude com código: ',design:'Me ajude com design: ',errors:'Analise este erro: ',ideas:'Me dê ideias: '};
      input.value=texts[c.dataset.m]||'';input.focus();send.disabled=false;
    });
  });

  this._sendMsg=function(t){
    const wasEmpty=!this.msgs.length;
    this.msgs.push({role:'user',content:t,time:this._now()});
    if(wasEmpty){
      this.title=t.slice(0,35);empty.classList.add('is-hidden');list.classList.remove('is-hidden');
      $('#hSub').textContent=this.title;this._render();
    }else this._append(this.msgs[this.msgs.length-1]);
    input.value='';send.disabled=true;this._scroll();
    setTimeout(()=>this._reply(t),600+Math.random()*400);
  };

  this._reply=function(t){
    const l=t.toLowerCase();let r=LizData.replies.default[0];
    if(/(código|codigo|função|script|react|javascript|js)/.test(l))r=LizData.replies.code[0];
    else if(/(design|ui|visual|cor|css|estilo)/.test(l))r=LizData.replies.design[0];
    else if(/(erro|error|bug|falha)/.test(l))r=LizData.replies.error[0];
    else if(/(ideia|ideias|brainstorm|nome|sugest)/.test(l))r=LizData.replies.ideas[0];
    const m={role:'liz',content:r,time:this._now()};
    this.msgs.push(m);this._append(m);this._save();
  };

  this._render=function(){list.innerHTML=this.msgs.map((m,i)=>this._html(m,i)).join('');};
  this._append=function(m){const d=document.createElement('div');d.innerHTML=this._html(m,this.msgs.length-1);list.appendChild(d.firstElementChild);this._scroll();};
  this._html=function(m,idx){
    const t=m.time?'<p class="msg-time">'+m.time+'</p>':'';const di=idx!==undefined?' data-i="'+idx+'"':'';
    if(m.file){return'<div class="msg msg-user"'+di+'><div class="msg-bubble msg-bubble-user">'+(m.file.type?.startsWith('image/')?'<img src="'+m.file.dataUrl+'" style="max-width:200px;border-radius:8px;display:block" loading="lazy">':'<span style="opacity:0.5;display:flex;gap:6px">'+LizConfig.icons.file+this._e(m.file.name)+'</span>')+'</div>'+t+'</div>';}
    if(m.role==='user'){return'<div class="msg msg-user"'+di+'><div class="msg-bubble msg-bubble-user"><div>'+this._e(m.content)+'</div></div>'+t+'</div>';}
    return'<div class="msg msg-liz"'+di+'><div class="msg-avatar">'+LizConfig.crown+'</div><div><div class="msg-bubble msg-bubble-liz"><span class="msg-name">Liz</span><div>'+this._md(m.content)+'</div></div>'+t+'</div></div>';
  };
  this._md=function(t){let h=this._e(t);h=h.replace(/```(\w+)?\n?([\s\S]*?)```/g,'<pre style="margin:6px 0;padding:8px 10px;background:rgba(0,0,0,0.3);border-radius:8px;font-size:0.78rem;overflow-x:auto"><code>$2</code></pre>');h=h.replace(/`([^`\n]+)`/g,'<code style="background:rgba(139,92,246,0.1);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>');h=h.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');return h.replace(/\n/g,'<br>');};
  this._e=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  this._now=function(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  this._scroll=function(){requestAnimationFrame(()=>{if(content)content.scrollTop=content.scrollHeight;});};
  this._save=function(){if(!this.msgs.length)return;this.title=this.title||'Nova conversa';LizData.saveConversation(this.title,this.msgs);};
  this._send=function(){const t=input.value.trim();if(t)this._sendMsg(t);};
};

/* ---- Feedback tátil ---- */
App._buzz=function(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}};

/* ---- Tema (exposto para settings) ---- */
App._setThemeIcon=function(t){const btn=$('#tb');if(!btn)return;btn.innerHTML=t==='dark'
  ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';};
App._toggleTheme=function(){const c=document.documentElement.getAttribute('data-theme')||'dark';const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('liz-chat-theme',n);const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',n==='dark'?'#08060e':'#f8f4f0');this._setThemeIcon(n);};

/* ---- Modais da Liz (substituem prompt/confirm nativos) ---- */
App._inputModal=function(title,placeholder,okLabel,cb){
  const body='<div class="liz-modal-field"><input type="text" id="lizModalInput" placeholder="'+this._e(placeholder||'')+'" autocomplete="off" /></div>'+
    '<div class="liz-modal-actions"><button type="button" class="liz-modal-btn" id="lizModalCancel">Cancelar</button>'+
    '<button type="button" class="liz-modal-btn primary" id="lizModalOk">'+this._e(okLabel||'Criar')+'</button></div>';
  this._openModal(title,body);
  const inp=$('#lizModalInput');
  const ok=()=>{const v=inp?inp.value.trim():'';this._closeModal();if(v)cb(v);};
  if(inp){inp.focus();inp.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();ok();}});}
  const cancel=$('#lizModalCancel');if(cancel)cancel.addEventListener('click',()=>this._closeModal());
  const okBtn=$('#lizModalOk');if(okBtn)okBtn.addEventListener('click',ok);
};
App._confirmModal=function(title,message,okLabel,danger,cb){
  const body='<p class="liz-modal-msg">'+message+'</p>'+
    '<div class="liz-modal-actions"><button type="button" class="liz-modal-btn" id="lizModalCancel">Cancelar</button>'+
    '<button type="button" class="liz-modal-btn '+(danger?'danger':'primary')+'" id="lizModalOk">'+this._e(okLabel||'Confirmar')+'</button></div>';
  this._openModal(title,body);
  const cancel=$('#lizModalCancel');if(cancel)cancel.addEventListener('click',()=>this._closeModal());
  const okBtn=$('#lizModalOk');if(okBtn)okBtn.addEventListener('click',()=>{this._closeModal();cb();});
};

App._handleFiles=function(files){
  [...files].forEach(file=>{
    if(file.size>10*1024*1024){this._toast('Arquivo grande demais');return;}
    const r=new FileReader();
    r.onload=(e)=>{LizData.saveUploadedFile({name:file.name,size:file.size,type:file.type,dataUrl:e.target.result,convTitle:'Arquivos'});this._toast('Arquivo salvo!');};
    r.readAsDataURL(file);
  });
};

App._previewImg=function(url,name){
  this._openModal(name||'Imagem','<img src="'+url+'" style="width:100%;border-radius:8px;display:block" />');
};

/* ---- 📁 Lista de Arquivos ---- */
App._archive=function(){
  const p=document.getElementById('pArchive');if(!p)return;
  LizData.loadUploadedFiles();
  const files=LizData.uploadedFiles;

  // Ícones
  const imgIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
  const fileIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  function getType(f){
    if(f.type&&f.type.startsWith('image/'))return'image';
    return'file';
  }

  let h='<div style="padding:16px 14px 4px"><h2 style="font-size:1.1rem;font-weight:700">Arquivos</h2></div>';

  if(!files.length){
    h+='<div style="padding:40px 20px;text-align:center;color:var(--text-muted);font-size:0.85rem">'+
      'Nenhum arquivo guardado ainda.<br>Compartilhe arquivos no chat com a Liz.</div>';
  }else{
    h+='<div style="padding:4px 14px 20px;display:flex;flex-direction:column;gap:6px">';
    files.forEach(function(f,i){
      const type=getType(f);
      const name=f.name||'arquivo';
      const date=new Date(f.timestamp||Date.now()).toLocaleDateString('pt-BR');
      const icon=type==='image'?imgIcon:fileIcon;

      h+='<div class="af-item" data-id="'+this._e(f.id)+'" data-type="'+type+'" '+
        'style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);'+
        'background:var(--surface-glass);border:1px solid var(--border);cursor:pointer;transition:background var(--t-fast)">'+
        '<span style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;'+
        'flex-shrink:0;color:'+(type==='image'?'var(--brand-light)':'var(--text-muted)')+'">'+icon+'</span>'+
        '<div style="flex:1;min-width:0"><div style="font-size:0.85rem;font-weight:500;color:var(--text);'+
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+this._e(name)+'</div>'+
        '<div style="font-size:0.68rem;color:var(--text-muted)">'+date+'</div></div>'+
        (type==='image'?'<span style="font-size:0.6rem;color:var(--brand-light);background:rgba(139,92,246,0.1);padding:2px 8px;border-radius:4px">imagem</span>':'')+
        '</div>';
    }.bind(this));
    h+='</div>';
  }

  p.innerHTML=h;

  // Event delegation
  if(!p.dataset.delegated){p.dataset.delegated='1';
    p.addEventListener('click',function(e){
      const item=e.target.closest('.af-item');
      if(!item)return;
      const id=item.dataset.id;
      LizData.loadUploadedFiles();
      const file=LizData.uploadedFiles.find(function(f){return f.id===id;});
      if(!file)return;
      if(file.type&&file.type.startsWith('image/')){
        App._previewImg(file.dataUrl,file.name);
      }else{
        App._toast(file.name);
      }
    });
  }
};

App._settings=function(){
  const p=document.getElementById('pSettings');if(!p)return;
  p.innerHTML='<div style="padding:16px 14px 8px"><h2 style="font-size:1.1rem;font-weight:700">Ajustes</h2></div><div class="sl">'+
    '<button class="si" data-s="appearance"><span>'+LizConfig.icons.sun+'</span><span>Aparência</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="notifications"><span>'+LizConfig.icons.chats+'</span><span>Notificações</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="chat"><span>'+LizConfig.icons.sparkle+'</span><span>Chat</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="history"><span>'+LizConfig.icons.folder+'</span><span>Histórico</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="shortcuts"><span>'+LizConfig.icons.code+'</span><span>Atalhos</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="memory"><span>'+LizConfig.icons.filesMenu+'</span><span>Memória</span><span>'+LizConfig.icons.continue+'</span></button>'+
    '<button class="si" data-s="about"><span>'+LizConfig.icons.code+'</span><span>Sobre</span></button></div>';

  p.querySelectorAll('.si[data-s]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const s=btn.dataset.s;
           if(s==='appearance')this._set('Aparência','<div class="set-toggle"><span>Tema escuro</span><label><input type="checkbox"'+(document.documentElement.getAttribute("data-theme")==='dark'?'checked':'')+' onchange="App._toggleTheme()"/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div><div class="set-toggle"><span>Tema claro</span><label><input type="checkbox"'+(document.documentElement.getAttribute("data-theme")==='light'?'checked':'')+' onchange="App._toggleTheme()"/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div><div style="font-size:0.8rem;color:var(--text-muted);padding-top:4px">Alterna entre escuro e claro</div>');
      else if(s==='notifications')this._set('Notificações','<div class="set-toggle"><span>Notificações</span><label><input type="checkbox" checked/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div><div class="set-toggle"><span>Som</span><label><input type="checkbox" checked/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div>');
      else if(s==='chat')this._set('Chat','<div class="set-toggle"><span>Sugestões iniciais</span><label><input type="checkbox" checked/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div><div class="set-toggle"><span>Animações</span><label><input type="checkbox" checked/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div><div class="set-toggle"><span>Brilho roxo</span><label><input type="checkbox" checked/><span class="toggle-track"><span class="toggle-thumb"></span></span></label></div>');
      else if(s==='history')this._set('Histórico','<div style="font-size:0.85rem;color:var(--text-sec)">'+LizData.savedConversations.length+' conversas salvas</div><div style="font-size:0.85rem;color:var(--text-sec);margin-top:6px">Arquivos: '+LizData.uploadedFiles.length+'</div>');
      else if(s==='shortcuts')this._set('Atalhos','<div style="font-size:0.85rem;color:var(--text-sec)"><kbd style="background:rgba(139,92,246,0.1);padding:2px 6px;border-radius:4px;font-size:0.8rem">Enter</kbd> Enviar<br><kbd style="background:rgba(139,92,246,0.1);padding:2px 6px;border-radius:4px;font-size:0.8rem">Shift+Enter</kbd> Nova linha<br><kbd style="background:rgba(139,92,246,0.1);padding:2px 6px;border-radius:4px;font-size:0.8rem">Esc</kbd> Fechar<br></div>');
      else if(s==='memory')this._set('Memória','<div style="font-size:0.85rem;color:var(--text-sec)">Cache do navegador</div>');
      else this._toast('Liz Mobile — Liz Ai Studios 💜');
    });
  });
};

App._openModal=function(t,h){const m=$('#modalOverlay');if(!m)return;$('#modalTitle').textContent=t;$('#modalBody').innerHTML=h;m.classList.add('show');};
App._closeModal=function(){const m=$('#modalOverlay');if(m)m.classList.remove('show');};
App._set=function(t,html){this._openModal(t,html);};

App._showConvs=function(){
  const groups=LizData.getConversationGroups();
  let html='<div style="padding:4px 0 12px;font-size:0.9rem;font-weight:600;color:var(--text)">Conversas</div>';
  if(!groups.length||groups.every(g=>!g.items.length)){
    html+='<div style="padding:20px 0;color:var(--text-muted);font-size:0.85rem;text-align:center">Nenhuma conversa ainda</div>';
  }else{
    groups.forEach(g=>{
      html+='<div style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:8px 0 4px">'+this._e(g.period)+'</div>';
      g.items.forEach(it=>{
        html+='<button class="conv-card" data-id="'+this._e(it.id)+'" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);text-align:left;margin-bottom:4px;font-size:0.85rem">'+
          '<span style="width:16px;height:16px;opacity:0.25;flex-shrink:0">'+LizConfig.icons.chats+'</span>'+
          '<div style="flex:1;min-width:0"><div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+this._e(it.title)+'</div>'+
          '<div style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(it.preview?this._e(it.preview):'')+'</div></div></button>';
      });
    });
  }
  this._openModal('Histórico',html);
  setTimeout(()=>{
    document.querySelectorAll('#modal .conv-card').forEach(c=>{
      c.addEventListener('click',()=>{
        const id=c.dataset.id;
        const s=LizData.getConversationById(id);
        if(s&&s.messages.length){
          this.msgs=s.messages.map(m=>({...m}));
          this.title=s.title;
          this._closeModal();
          $('#pChat .empty').classList.add('is-hidden');
          $('#pChat .msg-list').classList.remove('is-hidden');
          this._render();
          $('#hSub').textContent=s.title;
        }
      });
    });
  },100);
};

App._goChat=function(){
  document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('is-active'));
  document.getElementById('pChat')?.classList.add('is-active');
  const bar=$('.tools-bar');if(bar){bar.classList.remove('is-collapsed');bar.classList.add('is-expanded');}
  const bb=document.getElementById('backBtn');if(bb)bb.style.display='none';
  const cb=document.getElementById('closeBtn');if(cb)cb.style.visibility='hidden';
  const hs=document.getElementById('hSep');if(hs)hs.style.display='none';
  const hu=document.getElementById('hSub');if(hu)hu.textContent='';
  const ht=document.getElementById('ht');if(ht)ht.textContent='Liz';
  $$('.tool-pill').forEach(pill=>pill.classList.toggle('is-active',pill.dataset.t==='chat'));
  App.tab='chat';
};

App._newChat=function(){
  if(this.msgs.length>0)this._save();
  this.msgs=[];this.title=null;
  $('#ci').value='';$('#sb').disabled=true;
  $('#pChat .empty').classList.remove('is-hidden');$('#pChat .msg-list').classList.add('is-hidden');$('#pChat .msg-list').innerHTML='';
  $('#hSub').textContent='';
  // Volta pro chat
  const first=$('.tool-pill[data-t="chat"]');if(first)first.click();
};

App._tools=function(){
  const p=document.getElementById('pTools');if(!p)return;
  const tools=[
    {icon:LizConfig.icons.code,name:'Criar código',desc:'Gere código em qualquer linguagem'},
    {icon:LizConfig.icons.sparkle,name:'Melhorar UI',desc:'Sugestões de design e interface'},
    {icon:LizConfig.icons.bug,name:'Explicar erro',desc:'Analise mensagens de erro'},
    {icon:LizConfig.icons.bulb,name:'Gerar ideias',desc:'Brainstorm criativo'},
    {icon:LizConfig.icons.prompt,name:'Criar prompt',desc:'Monte prompts eficientes'},
  ];
  let h='<div class="ph"><h2>Ferramentas</h2></div><div class="pl">';
  tools.forEach(t=>{h+='<div class="pc"><div class="pca" style="background:#8b5cf6"></div><div class="pci"><div class="pcn">'+t.name+'</div><div class="pcd">'+t.desc+'</div></div></div>';});
  h+='</div>';p.innerHTML=h;
};

App._toast=function(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove('show'),2000);};

window.App=App;
document.addEventListener('DOMContentLoaded',()=>App.init());
})();
