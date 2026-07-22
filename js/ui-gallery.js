/* ============================================================
 *  Liz — ui-gallery.js
 *  Preview, galeria, upload panel, file messages
 * ============================================================ */

// ===================== FILE MESSAGE =====================
LizUI.renderFileMessage = function(file, index) {
  const isImage = file.type && file.type.startsWith('image/');
  const size = this._formatFileSize(file.size);
  const name = this._esc(file.name);
  const dataUrl = file.dataUrl || '';
  if (isImage) {
    return '<div class="file-msg file-msg-image"><div class="file-image-preview" style="background-image: url(' + dataUrl + ')" role="button" tabindex="0" data-file-url="' + dataUrl + '" data-file-name="' + name + '">' +
      '<img src="' + dataUrl + '" alt="' + name + '" loading="lazy" /><span class="file-image-expand">' + LizConfig.icons.expand + '</span></div>' +
      '<div class="file-info"><span class="file-name">' + name + '</span><span class="file-size">' + size + '</span></div></div>';
  }
  return '<div class="file-msg file-msg-doc"><span class="file-doc-icon">' + LizConfig.icons.file + '</span>' +
    '<div class="file-info"><span class="file-name">' + name + '</span><span class="file-size">' + size + '</span></div></div>';
};

// ===================== PREVIEW =====================
LizUI.openPreview = function(src, filename) {
  if (!this.el.previewOverlay) return;
  this.el.previewImg.src = src;
  this.el.previewImg.alt = filename || 'Preview';
  this.el.previewFilename.textContent = filename || 'Imagem';
  this.el.previewDownload.innerHTML = LizConfig.icons.download;
  this.el.previewDownload.onclick = () => { var a = document.createElement('a'); a.href = src; a.download = filename || 'imagem'; a.click(); };
  this.el.previewOverlay.setAttribute('aria-hidden', 'false');
  this.el.previewOverlay.classList.add('is-visible');
  document.body.style.overflow = 'hidden';
};

LizUI.closePreview = function() {
  if (!this.el.previewOverlay) return;
  this.el.previewOverlay.classList.remove('is-visible');
  this.el.previewOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// ===================== UPLOAD PANEL =====================
LizUI.openUploadPanel = function() {
  let panel = document.getElementById('upload-panel');
  let overlay = document.getElementById('upload-panel-overlay');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'upload-panel'; panel.className = 'upload-panel';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Histórico de arquivos');
    overlay = document.createElement('div');
    overlay.id = 'upload-panel-overlay'; overlay.className = 'upload-panel-overlay';
    overlay.addEventListener('click', () => this.closeUploadPanel());
    document.body.appendChild(overlay); document.body.appendChild(panel);
    document.addEventListener('keydown', function _upEsc(e) {
      const p = document.getElementById('upload-panel');
      if (e.key === 'Escape' && p && p.classList.contains('is-open')) LizUI.closeUploadPanel();
    });
  }
  LizData.loadUploadedFiles();
  const files = LizData.uploadedFiles;
  const images = files.filter((f) => f.type && f.type.startsWith('image/'));
  const docs = files.filter((f) => !f.type || !f.type.startsWith('image/'));
  let html = '<header class="upload-panel-head"><h3 class="upload-panel-title">Arquivos enviados</h3><div class="upload-panel-actions">' +
    '<button class="panel-close" data-close-uploads type="button" aria-label="Fechar"><span>' + LizConfig.icons.close + '</span></button></div></header>';
  html += '<div class="upload-panel-body">';
  if (files.length === 0) {
    html += '<div class="upload-panel-empty"><span class="upload-panel-empty-icon">' + LizConfig.icons.upload + '</span>Nenhum arquivo enviado ainda.<br>Arraste ou clique em Anexar para começar.</div>';
  } else {
    if (images.length > 0) {
      html += '<p class="upload-panel-section-title">Imagens (' + images.length + ')</p><div class="upload-panel-grid">';
      images.forEach((f) => { html += '<div class="upload-panel-thumb" data-url="' + f.dataUrl + '" data-name="' + this._esc(f.name) + '"><img src="' + f.dataUrl + '" alt="' + this._esc(f.name) + '" loading="lazy" /></div>'; });
      html += '</div>';
    }
    if (docs.length > 0) {
      html += '<p class="upload-panel-section-title">Documentos (' + docs.length + ')</p>';
      docs.forEach((f) => { html += '<div class="upload-panel-file"><span class="upload-panel-file-icon">' + LizConfig.icons.file + '</span><div class="upload-panel-file-info"><span class="upload-panel-file-name">' + this._esc(f.name) + '</span><span class="upload-panel-file-meta">' + this._formatFileSize(f.size) + '</span></div><button class="upload-panel-file-delete" data-delete-id="' + this._esc(f.id) + '" type="button" aria-label="Remover">' + LizConfig.icons.trash + '</button></div>'; });
    }
  }
  html += '</div>';
  panel.innerHTML = html;
  overlay.classList.add('is-visible');
  panel.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const closeBtn = panel.querySelector('[data-close-uploads]');
  if (closeBtn) closeBtn.addEventListener('click', () => this.closeUploadPanel());
  panel.querySelectorAll('.upload-panel-thumb').forEach((thumb) => { thumb.addEventListener('click', () => this.openPreview(thumb.dataset.url, thumb.dataset.name)); });
  panel.querySelectorAll('.upload-panel-file-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); const id = btn.dataset.deleteId; if (id) { LizData.deleteUploadedFile(id); this.openUploadPanel(); } });
  });
};

LizUI.closeUploadPanel = function() {
  const panel = document.getElementById('upload-panel');
  const overlay = document.getElementById('upload-panel-overlay');
  if (panel) panel.classList.remove('is-open');
  if (overlay) overlay.classList.remove('is-visible');
  document.body.style.overflow = '';
};

