/* ============================================================
 *  Liz — ui-polaroid-wall.js
 *  Mural de Polaroids: scroll inércia, balanço, interações físicas
 * ============================================================ */

LizUI.polaroidWall = {
  overlay: null,
  container: null,
  tracks: [],
  isDragging: false,
  startX: 0,
  scrollLeft: 0,
  velocity: 0,
  lastX: 0,
  lastTime: 0,
  animationFrame: null,
  longPressTimer: null,
  swipeThreshold: 8,

  // ---- Inicialização ----
  init: function() {
    this.createOverlay();
    this.bindEvents();
  },

  // ---- Criar Overlay ----
  createOverlay: function() {
    if (this.overlay) return;

    const overlay = document.createElement('section');
    overlay.className = 'polaroid-wall-overlay';
    overlay.id = 'polaroid-wall';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Mural de Polaroids');

    overlay.innerHTML = `
      <header class="polaroid-wall-header">
        <button class="polaroid-wall-back" type="button" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Voltar</span>
        </button>
        <div class="polaroid-wall-actions">
          <button class="polaroid-wall-action-btn" type="button" aria-label="Adicionar" title="Adicionar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button class="polaroid-wall-action-btn" type="button" aria-label="Atualizar" title="Atualizar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </header>

      <img class="polaroid-wall-crown" src="coroa.svg" alt="Coroa da Liz" />

      <div class="polaroid-wall-container" id="polaroid-container"></div>

      <p class="polaroid-wall-whisper">"Cada Polaroid aqui é um flash da nossa história..."</p>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.container = overlay.querySelector('#polaroid-container');
  },

  // ---- Abrir Mural ----
  open: function() {
    if (!this.overlay) this.init();
    this.render();
    this.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  },

  // ---- Fechar Mural ----
  close: function() {
    if (!this.overlay) return;
    this.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    this.stopMomentum();
  },

  // ---- Renderizar Cards ----
  render: function() {
    LizData.loadUploadedFiles();
    const files = LizData.uploadedFiles;

    if (files.length === 0) {
      this.renderEmpty();
      return;
    }

    // Dividir em fios (máx 6 por fio)
    const rows = [];
    for (let i = 0; i < files.length; i += 6) {
      rows.push(files.slice(i, i + 6));
    }

    let html = '';
    rows.forEach((rowFiles, rowIndex) => {
      html += `<div class="polaroid-string-row" data-row="${rowIndex}">`;
      html += `<div class="polaroid-string"></div>`;
      html += `<div class="polaroid-track" data-track="${rowIndex}">`;

      rowFiles.forEach((file) => {
        html += this.renderCard(file);
      });

      html += `</div></div>`;
    });

    this.container.innerHTML = html;
    this.tracks = Array.from(this.container.querySelectorAll('.polaroid-track'));
    this.bindTrackEvents();
  },

  // ---- Renderizar Card Individual ----
  renderCard: function(file) {
    const type = this.getCardType(file);
    const isFavorite = file.favorite ? 'is-favorite' : '';
    const isArchived = file.archived ? 'is-archived' : '';
    const name = this._esc(file.name);
    const date = new Date(file.timestamp || Date.now()).toLocaleDateString('pt-BR');

    let contentHtml = '';

    if (type === 'image') {
      contentHtml = `<img src="${file.dataUrl}" alt="${name}" loading="lazy" />`;
    } else if (type === 'text') {
      const preview = file.textContent || file.name;
      contentHtml = `<div class="polaroid-text">${this._esc(preview.substring(0, 120))}</div>`;
    } else if (type === 'code') {
      const code = file.textContent || '// código';
      contentHtml = `<div class="polaroid-code">${this._esc(code.substring(0, 200))}</div>`;
    } else {
      contentHtml = `
        <span class="polaroid-icon">${LizConfig.icons.file}</span>
        <span class="polaroid-name">${name}</span>
      `;
    }

    return `
      <article class="polaroid-card ${isFavorite} ${isArchived}" data-type="${type}" data-file-id="${this._esc(file.id)}" tabindex="0" role="button" aria-label="${name}">
        <span class="polaroid-clip">
          <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="0" width="8" height="20" rx="2" fill="#d4a574"/>
            <rect x="6" y="16" width="12" height="18" rx="3" fill="#c4956a"/>
            <rect x="9" y="18" width="6" height="14" rx="2" fill="#b8895e"/>
            <circle cx="12" cy="8" r="2" fill="#a07850"/>
          </svg>
        </span>
        <span class="polaroid-favorite">
          <svg viewBox="0 0 24 24" fill="#d4af37" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21.4 8 14 2 9.4h7.6z"/>
          </svg>
        </span>
        <div class="polaroid-body">
          <div class="polaroid-content">${contentHtml}</div>
          <span class="polaroid-caption">${name}</span>
        </div>
      </article>
    `;
  },

  // ---- Determinar Tipo do Card ----
  getCardType: function(file) {
    if (file.type && file.type.startsWith('image/')) return 'image';
    if (file.type && (file.type.includes('text') || file.name.match(/\.(txt|md|doc|docx)$/i))) return 'text';
    if (file.name.match(/\.(js|ts|py|html|css|json|java|cpp|c|rb|go|rs)$/i)) return 'code';
    return 'generic';
  },

  // ---- Estado Vazio ----
  renderEmpty: function() {
    this.container.innerHTML = `
      <div class="polaroid-wall-empty">
        <div class="polaroid-wall-empty-string">
          <span class="polaroid-wall-empty-clip">
            <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="0" width="8" height="20" rx="2" fill="#d4a574"/>
              <rect x="6" y="16" width="12" height="18" rx="3" fill="#c4956a"/>
              <rect x="9" y="18" width="6" height="14" rx="2" fill="#b8895e"/>
              <circle cx="12" cy="8" r="2" fill="#a07850"/>
            </svg>
          </span>
          <div class="polaroid-wall-empty-note">A Liz está esperando a primeira foto...</div>
        </div>
        <p class="polaroid-wall-empty-text">Envie arquivos para começar seu mural</p>
      </div>
    `;
  },

  // ---- Bind de Eventos ----
  bindEvents: function() {
    // Botão voltar
    this.overlay.querySelector('.polaroid-wall-back').addEventListener('click', () => this.close());

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('is-open')) {
        this.close();
      }
    });

    // Botão adicionar
    this.overlay.querySelector('.polaroid-wall-action-btn').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.json,.js,.ts,.py,.html,.css,.md';
      input.onchange = (e) => {
        this.handleUpload(e.target.files);
        input.value = '';
      };
      input.click();
    });

    // Botão atualizar
    this.overlay.querySelectorAll('.polaroid-wall-action-btn')[1].addEventListener('click', () => {
      this.render();
    });
  },

  // ---- Bind de Eventos dos Tracks ----
  bindTrackEvents: function() {
    this.tracks.forEach((track) => {
      // Mouse events
      track.addEventListener('mousedown', (e) => this.onDragStart(e, track));
      track.addEventListener('mousemove', (e) => this.onDragMove(e, track));
      track.addEventListener('mouseup', (e) => this.onDragEnd(e, track));
      track.addEventListener('mouseleave', (e) => this.onDragEnd(e, track));

      // Touch events
      track.addEventListener('touchstart', (e) => this.onTouchStart(e, track), { passive: false });
      track.addEventListener('touchmove', (e) => this.onTouchMove(e, track), { passive: false });
      track.addEventListener('touchend', (e) => this.onTouchEnd(e, track));

      // Click nos cards
      track.querySelectorAll('.polaroid-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (this.isDragging) return;
          this.onCardClick(e, card);
        });

        // Long press
        card.addEventListener('touchstart', (e) => {
          this.longPressTimer = setTimeout(() => {
            this.onCardLongPress(card);
          }, 600);
        });

        card.addEventListener('touchend', () => {
          clearTimeout(this.longPressTimer);
        });

        card.addEventListener('touchmove', () => {
          clearTimeout(this.longPressTimer);
        });
      });
    });
  },

  // ---- Drag com Mouse ----
  onDragStart: function(e, track) {
    this.isDragging = true;
    this.startX = e.pageX;
    this.scrollLeft = this.getTrackPosition(track);
    this.velocity = 0;
    this.lastX = e.pageX;
    this.lastTime = Date.now();
    track.classList.add('is-dragging');
    this.stopMomentum();
  },

  onDragMove: function(e, track) {
    if (!this.isDragging) return;
    e.preventDefault();

    const x = e.pageX;
    const walk = x - this.startX;
    const newPos = this.scrollLeft + walk;
    this.setTrackPosition(track, newPos);

    // Calcular velocidade
    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (x - this.lastX) / dt;
    }
    this.lastX = x;
    this.lastTime = now;

    // Ventania: balançar cards próximos
    if (Math.abs(this.velocity) > this.swipeThreshold) {
      this.triggerWindEffect(track);
    }
  },

  onDragEnd: function(e, track) {
    if (!this.isDragging) return;
    this.isDragging = false;
    track.classList.remove('is-dragging');
    this.startMomentum(track);
  },

  // ---- Touch Events ----
  onTouchStart: function(e, track) {
    const touch = e.touches[0];
    this.isDragging = true;
    this.startX = touch.pageX;
    this.scrollLeft = this.getTrackPosition(track);
    this.velocity = 0;
    this.lastX = touch.pageX;
    this.lastTime = Date.now();
    track.classList.add('is-dragging');
    this.stopMomentum();
  },

  onTouchMove: function(e, track) {
    if (!this.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.pageX;
    const walk = x - this.startX;
    const newPos = this.scrollLeft + walk;
    this.setTrackPosition(track, newPos);

    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (x - this.lastX) / dt;
    }
    this.lastX = x;
    this.lastTime = now;

    if (Math.abs(this.velocity) > this.swipeThreshold) {
      this.triggerWindEffect(track);
    }
  },

  onTouchEnd: function(e, track) {
    if (!this.isDragging) return;
    this.isDragging = false;
    track.classList.remove('is-dragging');
    this.startMomentum(track);
  },

  // ---- Posição do Track ----
  getTrackPosition: function(track) {
    const transform = track.style.transform;
    const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    return match ? parseFloat(match[1]) : 0;
  },

  setTrackPosition: function(track, pos) {
    const maxScroll = 0;
    const minScroll = -(track.scrollWidth - track.parentElement.offsetWidth);
    const clampedPos = Math.max(minScroll, Math.min(maxScroll, pos));
    track.style.transform = `translateX(${clampedPos}px)`;
  },

  // ---- Inércia / Momentum ----
  startMomentum: function(track) {
    if (Math.abs(this.velocity) < 0.1) return;

    track.classList.add('is-settling');
    let currentVel = this.velocity * 15;

    const animate = () => {
      currentVel *= 0.95; // friction
      const currentPos = this.getTrackPosition(track);
      const newPos = currentPos + currentVel;
      this.setTrackPosition(track, newPos);

      if (Math.abs(currentVel) > 0.5) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        track.classList.remove('is-settling');
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  },

  stopMomentum: function() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  },

  // ---- Efeito de Ventania ----
  triggerWindEffect: function(track) {
    const cards = track.querySelectorAll('.polaroid-card:not(.is-swinging)');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('is-swinging');
        setTimeout(() => card.classList.remove('is-swinging'), 800);
      }, i * 50);
    });
  },

  // ---- Click no Card ----
  onCardClick: function(e, card) {
    // Balanço suave
    card.classList.add('is-swinging');
    setTimeout(() => card.classList.remove('is-swinging'), 800);

    // Toggle favorito com duplo clique
    if (e.detail === 2) {
      this.toggleFavorite(card);
    }
  },

  // ---- Long Press ----
  onCardLongPress: function(card) {
    const fileId = card.dataset.fileId;
    LizData.loadUploadedFiles();
    const file = LizData.uploadedFiles.find(f => f.id === fileId);
    if (file && file.type && file.type.startsWith('image/')) {
      this.openPreview(file.dataUrl, file.name);
    }
  },

  // ---- Toggle Favorito ----
  toggleFavorite: function(card) {
    const fileId = card.dataset.fileId;
    LizData.loadUploadedFiles();
    const file = LizData.uploadedFiles.find(f => f.id === fileId);
    if (file) {
      file.favorite = !file.favorite;
      LizData.saveUploadedFile(file);
      card.classList.toggle('is-favorite');
    }
  },

  // ---- Preview ----
  openPreview: function(src, filename) {
    if (typeof LizUI.openPreview === 'function') {
      LizUI.openPreview(src, filename);
    }
  },

  // ---- Upload ----
  handleUpload: function(files) {
    const MAX_SIZE = 10 * 1024 * 1024;
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        if (typeof LizChat !== 'undefined') {
          LizChat.toast('Arquivo muito grande (máx. 10 MB): ' + file.name);
        }
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    let completed = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        LizData.saveUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
          convTitle: 'Mural'
        });
        completed++;
        if (completed === validFiles.length) {
          this.render();
        }
      };
      reader.readAsDataURL(file);
    });
  },

  // ---- Escape HTML ----
  _esc: function(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ---- Inicializar quando o DOM estiver pronto ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Adicionar botão no menu se necessário
  });
}
