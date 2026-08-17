/* ============================================================
 *  Liz — mural.js
 *  Interface premium para visualização de arquivos
 * ============================================================ */

LizUI.mural = {
  overlay: null,
  container: null,
  body: null,
  files: [],
  filter: 'all',
  search: '',
  sortBy: 'name',
  sortDir: 'asc',
  viewMode: 'list', // 'list' | 'grid'
  selectedId: null,
  contextFileId: null,
  _esc: function(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); },

  /* ---- Ícones SVG ---- */
  _icons: {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5h10M11 12h7M11 19h4"/><path d="M3 5l3-3 3 3M9 19H3M3 12h6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  },

  /* ---- Inicialização ---- */
  init: function() {
    this.createOverlay();
    this.bindEvents();
  },

  /* ---- Criar overlay ---- */
  createOverlay: function() {
    if (this.overlay) return;
    const o = document.createElement('section');
    o.className = 'mural-overlay';
    o.id = 'mural-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Mural de Arquivos');
    o.innerHTML = `
      <div class="mural-header">
        <div class="mural-header-top">
          <div class="mural-header-left">
            <button class="mural-back-btn" id="mural-back" type="button" aria-label="Voltar">${this._icons.back}</button>
            <span class="mural-header-title">Mural</span>
          </div>
          <div class="mural-header-right">
            <button class="mural-header-btn" id="mural-view-toggle" type="button" aria-label="Alternar visualização" title="Alternar visualização">${this._icons.grid}</button>
            <button class="mural-header-btn" id="mural-menu-btn" type="button" aria-label="Menu" title="Menu">${this._icons.menu}</button>
          </div>
        </div>
        <div class="mural-filters" id="mural-filters">
          <button class="mural-filter is-active" data-filter="all">Tudo</button>
          <button class="mural-filter" data-filter="image">Imagens</button>
          <button class="mural-filter" data-filter="file">Arquivos</button>
          <button class="mural-filter" data-filter="video">Vídeos</button>
        </div>
        <div class="mural-toolbar">
          <div class="mural-search-wrap">
            <span class="mural-search-icon">${this._icons.search}</span>
            <input class="mural-search" id="mural-search" type="text" placeholder="Pesquisar no mural..." autocomplete="off" />
          </div>
          <div class="mural-sort" id="mural-sort-wrap">
            <button class="mural-sort-btn" id="mural-sort-btn" type="button">${this._icons.sort}<span>Nome</span></button>
            <div class="mural-sort-dropdown" id="mural-sort-dropdown">
              <button class="mural-sort-option is-active" data-sort="name">Nome</button>
              <button class="mural-sort-option" data-sort="date">Data</button>
              <button class="mural-sort-option" data-sort="type">Tipo</button>
              <button class="mural-sort-option" data-sort="size">Tamanho</button>
            </div>
          </div>
        </div>
      </div>
      <div class="mural-body" id="mural-body"></div>
    `;
    document.body.appendChild(o);
    this.overlay = o;
    this.container = o;
    this.body = o.querySelector('#mural-body');
  },

  /* ---- Abrir ---- */
  open: function() {
    if (!this.overlay) this.init();
    this.render();
    this.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  },

  /* ---- Fechar ---- */
  close: function() {
    if (!this.overlay) return;
    this.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (typeof this.onClose === 'function') this.onClose();
  },

  /* ---- Determinar tipo ---- */
  _getType: function(f) {
    if (!f || !f.type) return 'file';
    if (f.type.startsWith('image/')) return 'image';
    if (f.type.startsWith('video/')) return 'video';
    return 'file';
  },

  _getIcon: function(type) {
    return this._icons[type] || this._icons.file;
  },

  /* ---- Formatar tamanho ---- */
  _formatSize: function(bytes) {
    if (!bytes || bytes === 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0; let sz = bytes;
    while (sz >= 1024 && i < units.length - 1) { sz /= 1024; i++; }
    return sz.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  },

  /* ---- Visualizador de Imagem ---- */
  _openViewer: function(file) {
    if (!file || !file.dataUrl) return;
    this._closeViewer();
    this._viewerFile = file;
    this._viewerZoom = 1;

    const viewer = document.createElement('div');
    viewer.className = 'mural-viewer';
    viewer.id = 'mural-viewer';
    viewer.innerHTML = `
      <div class="mural-viewer-bg" id="mural-viewer-bg"></div>
      <img class="mural-viewer-img" id="mural-viewer-img" src="${file.dataUrl}" alt="${this._esc(file.name||'')}" />
      <div class="mural-viewer-controls">
        <button class="mural-viewer-btn" id="mv-zoom-in" type="button" aria-label="Aumentar zoom" title="Aumentar zoom">${this._icons.zoomIn}</button>
        <button class="mural-viewer-btn" id="mv-zoom-out" type="button" aria-label="Diminuir zoom" title="Diminuir zoom">${this._icons.zoomOut}</button>
        <button class="mural-viewer-btn" id="mv-fullscreen" type="button" aria-label="Tela cheia" title="Tela cheia">${this._icons.fullscreen}</button>
        <button class="mural-viewer-btn" id="mv-download" type="button" aria-label="Baixar" title="Baixar">${this._icons.download}</button>
        <button class="mural-viewer-btn" id="mv-share" type="button" aria-label="Compartilhar" title="Compartilhar">${this._icons.share}</button>
        <button class="mural-viewer-btn mural-viewer-btn-close" id="mv-close" type="button" aria-label="Fechar" title="Fechar">${this._icons.close}</button>
      </div>
      <div class="mural-viewer-info" id="mural-viewer-info">${this._esc(file.name||'')}</div>
    `;
    document.body.appendChild(viewer);
    requestAnimationFrame(() => viewer.classList.add('is-open'));

    // Eventos
    const img = viewer.querySelector('#mural-viewer-img');
    const bg = viewer.querySelector('#mural-viewer-bg');

    document.getElementById('mv-close').addEventListener('click', () => this._closeViewer());
    bg.addEventListener('click', () => this._closeViewer());

    document.getElementById('mv-zoom-in').addEventListener('click', () => {
      this._viewerZoom = Math.min(3, this._viewerZoom + 0.25);
      img.style.transform = 'scale(' + this._viewerZoom + ')';
      img.classList.toggle('is-zoomed', this._viewerZoom > 1);
    });
    document.getElementById('mv-zoom-out').addEventListener('click', () => {
      this._viewerZoom = Math.max(0.25, this._viewerZoom - 0.25);
      img.style.transform = 'scale(' + this._viewerZoom + ')';
      img.classList.toggle('is-zoomed', this._viewerZoom > 1);
    });

    document.getElementById('mv-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    document.getElementById('mv-download').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name || 'imagem';
      a.click();
    });

    document.getElementById('mv-share').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: file.name || 'Imagem', url: file.dataUrl });
      }
    });

    // ESC
    this._viewerEscHandler = (e) => { if (e.key === 'Escape') this._closeViewer(); };
    document.addEventListener('keydown', this._viewerEscHandler);
  },

  _closeViewer: function() {
    const viewer = document.getElementById('mural-viewer');
    if (!viewer) return;
    viewer.classList.remove('is-open');
    viewer.classList.add('is-closing');
    if (this._viewerEscHandler) {
      document.removeEventListener('keydown', this._viewerEscHandler);
      this._viewerEscHandler = null;
    }
    setTimeout(() => { if (viewer.parentNode) viewer.remove(); }, 280);
  },

  /* ============================================================
   * LEITOR DE ARQUIVOS — texto, código, PDF e binários
   * ============================================================ */

  /* ---- Auxiliar: converte dataUrl em bytes ---- */
  _dataUrlToBytes: function(dataUrl) {
    try {
      const b64 = String(dataUrl).split(',')[1] || '';
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch (e) {
      return new Uint8Array(0);
    }
  },

  /* ---- Descobre se o arquivo é texto legível ---- */
  _isTextFile: function(file) {
    if (!file || !file.name && !file.type) return false;
    const type = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    if (type.startsWith('text/')) return true;
    if (type === 'application/json' || type === 'application/xml' ||
        type === 'application/javascript' || type === 'application/x-javascript' ||
        type === 'application/x-httpd-php' || type === 'application/x-sh') return true;
    return /\.(txt|log|md|csv|json|js|mjs|cjs|ts|tsx|jsx|py|html|htm|css|scss|xml|yml|yaml|sh|bat|cmd|sql|ini|conf|cfg|env|gitignore|dockerfile|vue|svelte|php|rb|go|rs|java|c|h|cpp|hpp|lua|r|ps1)$/.test(name);
  },

  /* ---- Abre um arquivo no leitor ---- */
  _openFileReader: function(file) {
    if (!file || !file.dataUrl) return;
    this._closeFileReader();
    this._readerFile = file;
    this._readerObjectUrl = null;

    const isPdf = String(file.type || '').toLowerCase() === 'application/pdf' ||
                  /\.pdf$/i.test(String(file.name || ''));
    const isText = this._isTextFile(file);

    // Monta URL de objeto (para PDF / abrir em nova aba)
    const bytes = this._dataUrlToBytes(file.dataUrl);
    if (bytes.length) {
      const mime = file.type || 'application/octet-stream';
      const blob = new Blob([bytes], { type: mime });
      this._readerObjectUrl = URL.createObjectURL(blob);
    }

    const reader = document.createElement('div');
    reader.className = 'mural-reader';
    reader.id = 'mural-reader';
    const name = this._esc(file.name || 'arquivo');
    const meta = `${this._esc(file.type || 'arquivo')} · ${this._formatSize(file.size)}`;

    reader.innerHTML = `
      <div class="mural-reader-bg" id="mural-reader-bg"></div>
      <div class="mural-reader-panel">
        <header class="mural-reader-head">
          <div class="mural-reader-head-info">
            <div class="mural-reader-name" id="mural-reader-name">${name}</div>
            <div class="mural-reader-meta" id="mural-reader-meta">${meta}</div>
          </div>
          <div class="mural-reader-actions">
            <button class="mural-viewer-btn" id="mr-copy" type="button" aria-label="Copiar" title="Copiar">${this._icons.file}</button>
            <button class="mural-viewer-btn" id="mr-open" type="button" aria-label="Abrir em nova aba" title="Abrir em nova aba">${this._icons.fullscreen}</button>
            <button class="mural-viewer-btn" id="mr-download" type="button" aria-label="Baixar" title="Baixar">${this._icons.download}</button>
            <button class="mural-viewer-btn mural-viewer-btn-close" id="mr-close" type="button" aria-label="Fechar" title="Fechar">${this._icons.close}</button>
          </div>
        </header>
        <div class="mural-reader-body" id="mural-reader-body"></div>
      </div>
    `;
    document.body.appendChild(reader);
    requestAnimationFrame(() => reader.classList.add('is-open'));

    // Eventos
    const bg = reader.querySelector('#mural-reader-bg');
    document.getElementById('mr-close').addEventListener('click', () => this._closeFileReader());
    bg.addEventListener('click', () => this._closeFileReader());

    document.getElementById('mr-open').addEventListener('click', () => {
      if (this._readerObjectUrl) window.open(this._readerObjectUrl, '_blank');
      else window.open(file.dataUrl, '_blank');
    });

    document.getElementById('mr-download').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = this._readerObjectUrl || file.dataUrl;
      a.download = file.name || 'arquivo';
      a.click();
    });

    document.getElementById('mr-copy').addEventListener('click', () => {
      const el = document.getElementById('mural-reader-text');
      if (!el) return;
      const text = el.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    });

    // ESC
    this._readerEscHandler = (e) => { if (e.key === 'Escape') this._closeFileReader(); };
    document.addEventListener('keydown', this._readerEscHandler);

    // Conteúdo conforme o tipo
    const body = reader.querySelector('#mural-reader-body');

    if (isPdf && this._readerObjectUrl) {
      const iframe = document.createElement('iframe');
      iframe.className = 'mural-reader-frame';
      iframe.src = this._readerObjectUrl;
      iframe.setAttribute('title', file.name || 'arquivo');
      body.appendChild(iframe);
      document.getElementById('mr-copy').style.display = 'none';
      return;
    }

    if (isText) {
      const bytes2 = this._dataUrlToBytes(file.dataUrl);
      let text = '';
      try {
        text = new TextDecoder('utf-8').decode(bytes2);
      } catch (e) {
        text = '';
      }
      const pre = document.createElement('pre');
      pre.className = 'mural-reader-text';
      pre.id = 'mural-reader-text';
      pre.textContent = text;
      body.appendChild(pre);
      return;
    }

    // Tipo não suportado para leitura direta
    document.getElementById('mr-copy').style.display = 'none';
    const uns = document.createElement('div');
    uns.className = 'mural-reader-unsupported';
    uns.innerHTML = `
      <div class="mural-reader-unsupported-icon">${this._icons.file}</div>
      <h3>Este tipo de arquivo não pode ser visualizado aqui</h3>
      <p>Você pode baixá-lo ou abri-lo em nova aba.</p>
    `;
    body.appendChild(uns);
  },

  _closeFileReader: function() {
    const reader = document.getElementById('mural-reader');
    if (!reader) return;
    reader.classList.remove('is-open');
    reader.classList.add('is-closing');
    if (this._readerEscHandler) {
      document.removeEventListener('keydown', this._readerEscHandler);
      this._readerEscHandler = null;
    }
    if (this._readerObjectUrl) {
      URL.revokeObjectURL(this._readerObjectUrl);
      this._readerObjectUrl = null;
    }
    setTimeout(() => { if (reader.parentNode) reader.remove(); }, 280);
  },

  /* ---- Renderizar ---- */
  render: function() {
    LizData.loadUploadedFiles();
    let files = [...LizData.uploadedFiles];

    // Filtro
    if (this.filter !== 'all') {
      files = files.filter(f => this._getType(f) === this.filter);
    }

    // Busca
    if (this.search) {
      const q = this.search.toLowerCase();
      files = files.filter(f => (f.name||'').toLowerCase().includes(q));
    }

    // Ordenação
    const sortField = this.sortBy;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    files.sort((a, b) => {
      let va, vb;
      if (sortField === 'name') { va = (a.name||'').toLowerCase(); vb = (b.name||'').toLowerCase(); return va < vb ? -dir : va > vb ? dir : 0; }
      if (sortField === 'date') { va = a.timestamp||0; vb = b.timestamp||0; return (va - vb) * dir; }
      if (sortField === 'type') { va = this._getType(a); vb = this._getType(b); return va < vb ? -dir : va > vb ? dir : 0; }
      if (sortField === 'size') { va = a.size||0; vb = b.size||0; return (va - vb) * dir; }
      return 0;
    });

    if (files.length === 0) {
      this._renderEmpty();
      return;
    }

    const viewClass = this.viewMode === 'grid' ? ' mural-grid-view' : '';
    let h = `<table class="mural-table${viewClass}">
      <thead><tr>
        <th class="col-name">Nome</th>
        <th class="col-date">Modificado</th>
        <th class="col-size">Tamanho</th>
      </tr></thead><tbody>`;

    files.forEach((f, i) => {
      const type = this._getType(f);
      const name = f.name || 'arquivo';
      const date = f.timestamp ? new Date(f.timestamp).toLocaleDateString('pt-BR') : '—';
      const size = this._formatSize(f.size);
      const icon = this._getIcon(type);
      const isImg = type === 'image';
      const selected = f.id === this.selectedId ? ' is-selected' : '';
      const tag = type !== 'file' ? '<span class="mural-file-tag">' + type + '</span>' : '';

      h += `<tr class="mural-row${selected}" data-id="${this._esc(f.id)}" data-type="${type}" style="animation-delay:${Math.min(i*30,500)}ms">
        <td class="col-name">
          <div class="mural-file-cell">
            <div class="mural-thumb">${isImg ? '<img src="'+f.dataUrl+'" alt="" />' : '<span class="mural-thumb-icon">'+icon+'</span>'}</div>
            <div>
              <div class="mural-file-name">${this._esc(name)}</div>
              <div class="mural-file-info">${date} ${tag}</div>
            </div>
          </div>
        </td>
        <td class="col-date">${date}</td>
        <td class="col-size">${size}</td>
      </tr>`;
    });

    h += '</tbody></table>';
    this.body.innerHTML = h;
    this._bindRowEvents();
  },

  /* ---- Estado vazio ---- */
  _renderEmpty: function() {
    const hasFilters = this.filter !== 'all' || this.search;
    this.body.innerHTML = `
      <div class="mural-empty">
        <div class="mural-empty-icon">${this._icons.image}</div>
        <h2>${hasFilters ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo guardado'}</h2>
        <p>${hasFilters ? 'Tente ajustar os filtros ou a pesquisa.' : 'Envie imagens para começar a preencher seu mural.'}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          ${!hasFilters ? '<button class="mural-empty-btn" id="mural-empty-upload" type="button">' + this._icons.upload + ' Enviar arquivos</button>' : ''}
          ${!hasFilters ? '<button class="mural-empty-btn" id="mural-empty-example" type="button" style="background:transparent;border-color:rgba(139,92,246,0.15);color:var(--mural-text-sec)">Carregar exemplos</button>' : ''}
        </div>
      </div>`;
    const btn = document.getElementById('mural-empty-upload');
    if (btn) btn.addEventListener('click', () => this._triggerUpload());
    const exBtn = document.getElementById('mural-empty-example');
    if (exBtn) exBtn.addEventListener('click', () => {
      // Cria 6 arquivos de exemplo (cores sólidas)
      const colors = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
      const names = ['Design.webp','Dashboard.webp','Gráfico.webp','Mockup.webp','Logo.webp','App.webp'];
      colors.forEach((c, i) => {
        // Cria um SVG colorido como dataUrl
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="'+c+'"/><text x="200" y="160" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="24" font-family="Inter,sans-serif">'+names[i]+'</text></svg>';
        LizData.saveUploadedFile({
          name: names[i],
          size: Math.floor(Math.random()*500000)+50000,
          type: 'image/webp',
          dataUrl: 'data:image/svg+xml;base64,'+btoa(svg),
          convTitle: 'Mural'
        });
      });
      this.render();
    });
  },

  /* ---- Eventos dos botões das linhas ---- */
  _bindRowEvents: function() {
    this.body.querySelectorAll('.mural-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.dataset.id;
        if (!id) return;
        // Selecionar
        this.body.querySelectorAll('.mural-row.is-selected').forEach(r => r.classList.remove('is-selected'));
        row.classList.add('is-selected');
        this.selectedId = id;

        // Se for imagem, abrir visualizador; senão, abrir leitor de arquivos
        LizData.loadUploadedFiles();
        const file = LizData.uploadedFiles.find(f => f.id === id);
        if (file && file.type && file.type.startsWith('image/')) {
          this._openViewer(file);
        } else if (file) {
          this._openFileReader(file);
        }
      });

      // Clique direito
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = row.dataset.id;
        this._openContextMenu(e.clientX, e.clientY, id);
      });
    });
  },

  /* ---- Menu de contexto ---- */
  _openContextMenu: function(x, y, fileId) {
    this._closeContextMenu();
    this.contextFileId = fileId;

    const menu = document.createElement('div');
    menu.className = 'mural-context';
    menu.id = 'mural-context';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.innerHTML = `
      <button class="mural-context-item" data-action="open">${this._icons.image}<span>Abrir</span></button>
      <button class="mural-context-item" data-action="preview">${this._icons.search}<span>Visualizar</span></button>
      <div class="mural-context-divider"></div>
      <button class="mural-context-item" data-action="rename">${this._icons.file}<span>Renomear</span></button>
      <button class="mural-context-item" data-action="share">${this._icons.upload}<span>Compartilhar</span></button>
      <div class="mural-context-divider"></div>
      <button class="mural-context-item" data-action="copy">${this._icons.file}<span>Copiar</span></button>
      <button class="mural-context-item" data-action="download">${this._icons.upload}<span>Baixar</span></button>
      <div class="mural-context-divider"></div>
      <button class="mural-context-item danger" data-action="delete">${this._icons.close}<span>Excluir</span></button>
    `;

    document.body.appendChild(menu);
    requestAnimationFrame(() => menu.classList.add('is-open'));

    // Ajustar se sair da tela
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';

    // Ações
    menu.querySelectorAll('.mural-context-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const id = this.contextFileId;
        this._closeContextMenu();
        if (action === 'delete') {
          LizData.deleteUploadedFile(id);
          this.render();
        } else if (action === 'open' || action === 'preview') {
          LizData.loadUploadedFiles();
          const file = LizData.uploadedFiles.find(f => f.id === id);
          if (file && file.type && file.type.startsWith('image/')) {
            this._openViewer(file);
          } else if (file) {
            this._openFileReader(file);
          }
        } else if (action === 'rename') {
          LizData.loadUploadedFiles();
          const file = LizData.uploadedFiles.find(f => f.id === id);
          if (!file) return;
          const newName = prompt('Novo nome do arquivo:', file.name);
          if (newName && LizData.renameUploadedFile(id, newName)) {
            this.render();
            if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Arquivo renomeado');
          }
        } else if (action === 'download') {
          LizData.loadUploadedFiles();
          const file = LizData.uploadedFiles.find(f => f.id === id);
          if (!file || !file.dataUrl) return;
          const a = document.createElement('a');
          a.href = file.dataUrl;
          a.download = file.name || 'arquivo';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else if (action === 'share') {
          LizData.loadUploadedFiles();
          const file = LizData.uploadedFiles.find(f => f.id === id);
          if (!file) return;
          if (navigator.share) {
            navigator.share({ title: file.name || 'Arquivo', url: file.dataUrl }).catch(() => {});
          } else if (typeof LizChat !== 'undefined' && LizChat.toast) {
            LizChat.toast('Compartilhamento não suportado neste navegador');
          }
        } else if (action === 'copy') {
          LizData.loadUploadedFiles();
          const file = LizData.uploadedFiles.find(f => f.id === id);
          if (!file) return;
          this._copyFile(file);
        }
      });
    });

    // Fechar ao clicar fora
    this._contextCloseHandler = (e) => { if (!menu.contains(e.target)) this._closeContextMenu(); };
    setTimeout(() => document.addEventListener('click', this._contextCloseHandler), 10);
  },

  _closeContextMenu: function() {
    const menu = document.getElementById('mural-context');
    if (menu) { menu.classList.remove('is-open'); setTimeout(() => menu.remove(), 200); }
    if (this._contextCloseHandler) { document.removeEventListener('click', this._contextCloseHandler); this._contextCloseHandler = null; }
  },

  /* ---- Copiar arquivo ----
   * Imagens vão pro clipboard como PNG (ClipboardItem);
   * demais tipos copiam o nome. Degrada com toast em cada falha. */
  _copyFile: function(file) {
    const toast = (typeof LizChat !== 'undefined' && LizChat.toast)
      ? (m) => LizChat.toast(m)
      : () => {};

    if (file.type && file.type.startsWith('image/') && navigator.clipboard && window.ClipboardItem) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1;
        canvas.height = img.naturalHeight || 1;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (!blob) { toast('Não foi possível copiar'); return; }
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            toast('Imagem copiada');
          } catch (e) {
            toast('Não foi possível copiar');
          }
        }, 'image/png');
      };
      img.onerror = () => toast('Não foi possível copiar');
      img.src = file.dataUrl;
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(file.name || '')
        .then(() => toast('Nome do arquivo copiado'), () => toast('Não foi possível copiar'));
    } else {
      toast('Cópia não suportada neste navegador');
    }
  },

  /* ---- Upload ---- */
  _triggerUpload: function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.json,.js,.ts,.py,.html,.css,.md,.mp3,.wav,.mp4';
    input.onchange = (e) => {
      this._handleUpload(e.target.files);
      input.value = '';
    };
    input.click();
  },

  _handleUpload: function(files) {
    const MAX = 10 * 1024 * 1024;
    const valid = [];
    for (const f of files) { if (f.size <= MAX) valid.push(f); }
    if (!valid.length) return;

    // Mostrar overlay de progresso
    if (!this._uploadOverlay) {
      this._uploadOverlay = document.createElement('div');
      this._uploadOverlay.className = 'mural-upload-overlay';
      this._uploadOverlay.innerHTML = '<div class="mural-upload-card" id="mural-upload-card"></div>';
      document.body.appendChild(this._uploadOverlay);
    }
    const card = this._uploadOverlay.querySelector('#mural-upload-card');
    card.innerHTML = '';
    const total = valid.length;
    let completed = 0;

    valid.forEach((file) => {
      const item = document.createElement('div');
      item.className = 'mural-upload-item';
      item.innerHTML = `
        <span class="mural-upload-icon">${this._icons.file}</span>
        <div class="mural-upload-info">
          <div class="mural-upload-name">${this._esc(file.name)}</div>
          <div class="mural-upload-progress">
            <div class="mural-upload-bar"><div class="mural-upload-bar-fill" id="uf-${this._esc(file.name)}"></div></div>
            <span class="mural-upload-pct" id="up-${this._esc(file.name)}">0%</span>
          </div>
        </div>
        <button class="mural-upload-cancel" data-file="${this._esc(file.name)}">${this._icons.close}</button>
      `;
      card.appendChild(item);

      const reader = new FileReader();
      // Cancelar upload: aborta a leitura e remove o item da lista
      const cancelBtn = item.querySelector('.mural-upload-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          try { reader.abort(); } catch (e) { /* já finalizado */ }
          item.remove();
          completed++;
          if (completed === total) {
            this._uploadOverlay.classList.remove('is-open');
            this.render();
          }
        });
      }
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          const bar = document.getElementById('uf-' + this._esc(file.name));
          const pctEl = document.getElementById('up-' + this._esc(file.name));
          if (bar) bar.style.width = pct + '%';
          if (pctEl) pctEl.textContent = pct + '%';
        }
      };
      reader.onload = (e) => {
        LizData.saveUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
          timestamp: Date.now()
        });
        completed++;
        if (completed === total) {
          this._uploadOverlay.classList.remove('is-open');
          this.render();
        }
      };
      reader.readAsDataURL(file);
    });

    this._uploadOverlay.classList.add('is-open');
  },

  /* ---- Eventos globais ---- */
  bindEvents: function() {
    // Botão voltar
    this.overlay.querySelector('#mural-back').addEventListener('click', () => this.close());

    // Filtros
    this.overlay.querySelectorAll('.mural-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.overlay.querySelectorAll('.mural-filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.filter = btn.dataset.filter;
        this.render();
      });
    });

    // Pesquisa
    this.overlay.querySelector('#mural-search').addEventListener('input', (e) => {
      this.search = e.target.value;
      // Debounce
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.render(), 200);
    });

    // Ordenação
    this.overlay.querySelector('#mural-sort-btn').addEventListener('click', () => {
      document.getElementById('mural-sort-dropdown').classList.toggle('is-open');
    });
    this.overlay.querySelectorAll('.mural-sort-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const sort = opt.dataset.sort;
        if (this.sortBy === sort) {
          this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortBy = sort;
          this.sortDir = 'asc';
        }
        this.overlay.querySelectorAll('.mural-sort-option').forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');
        document.getElementById('mural-sort-dropdown').classList.remove('is-open');
        document.querySelector('#mural-sort-btn span').textContent = opt.textContent;
        this.render();
      });
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('mural-sort-wrap');
      if (wrap && !wrap.contains(e.target)) {
        document.getElementById('mural-sort-dropdown')?.classList.remove('is-open');
      }
    });

    // Alternar visualização
    document.getElementById('mural-view-toggle').addEventListener('click', () => {
      this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
      document.getElementById('mural-view-toggle').innerHTML = this.viewMode === 'list' ? this._icons.grid : this._icons.list;
      this.render();
    });

    // ESC para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('is-open')) {
        this.close();
      }
    });
  }
};
