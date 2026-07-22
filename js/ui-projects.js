/* ============================================================
 *  Liz — ui-projects.js
 *  Página de projetos (espaços criativos)
 * ============================================================ */

LizUI._projectInsights = [
  'Liz acompanha cada detalhe deste espaço',
  'Criatividade em desenvolvimento com a Liz',
  'Um espaço que a Liz ajuda a evoluir',
  'Ideias transformadas em realidade aqui',
  'A Liz guarda cada inspiração deste lugar',
  'Colaboração entre você e a Liz em fluxo',
  'Este espaço respira criação e propósito',
  'Cada camada conta uma história para a Liz',
  'Potencial criativo em expansão constante',
  'A Liz sente que este projeto tem alma própria',
  'Sementes de algo maior estão aqui',
  'Onde as ideias encontram forma com a Liz',
];

LizUI._getProjectInsight = function(name) {
  const hash = (name || '').length + (name ? name.charCodeAt(0) || 0 : 0);
  return this._projectInsights[Math.abs(hash) % this._projectInsights.length];
};

LizUI.renderProjectsPage = function() {
  const content = this.el.projectsContent;
  if (!content) return;
  LizData.loadProjects();
  const currentFilter = this._projectsFilter || 'all';
  const searchQuery = this._projectsSearchQuery || '';
  let projects = searchQuery ? LizData.searchProjects(searchQuery) : LizData.getProjectsByFilter(currentFilter);
  const crownSvg = '<svg viewBox="0 0 810 580" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="0,520 160,520 60,140 270,310 400,80 530,310 740,140 640,520 800,520"/></svg>';
  let html = '<div class="liz-proj-container">';
  html += '<div class="liz-proj-header"><h1 class="liz-proj-header-title"><span class="liz-proj-header-crown">' + crownSvg + '</span>Projetos</h1>' +
    '<p class="liz-proj-header-sub">Onde a Liz cultiva ideias, dá forma a criações e expande possibilidades.</p></div>';
  html += '<div class="liz-proj-controls"><div class="liz-proj-search"><span class="liz-proj-search-icon">' + LizConfig.icons.search + '</span>' +
    '<input type="text" id="proj-search-input" placeholder="Explorar espaços..." value="' + this._esc(searchQuery) + '" autocomplete="off" /></div>' +
    '<button class="liz-proj-create-btn" id="proj-create-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Novo espaço</span></button></div>';
  const projectList = LizData.projectList;
  const recentCount = projectList.filter((p) => p.status !== 'archived').length;
  const archivedCount = projectList.filter((p) => p.status === 'archived').length;
  html += '<div class="liz-proj-nav"><button class="liz-proj-nav-btn' + (currentFilter === 'all' ? ' is-active' : '') + '" data-filter="all" type="button">Todos<span class="liz-proj-nav-count">' + projectList.length + '</span></button>' +
    '<button class="liz-proj-nav-btn' + (currentFilter === 'recent' ? ' is-active' : '') + '" data-filter="recent" type="button">Recentes<span class="liz-proj-nav-count">' + recentCount + '</span></button>' +
    '<button class="liz-proj-nav-btn' + (currentFilter === 'archived' ? ' is-active' : '') + '" data-filter="archived" type="button">Arquivo<span class="liz-proj-nav-count">' + archivedCount + '</span></button></div>';
  if (projects.length === 0) {
    html += '<div class="liz-proj-empty"><div class="liz-proj-empty-crown">' + crownSvg + '</div><p class="liz-proj-empty-title">Nenhum projeto encontrado</p><p class="liz-proj-empty-desc">Comece criando algo novo com a Liz.</p>' +
      '<button class="liz-proj-empty-btn" id="proj-empty-create-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;margin-right:6px;vertical-align:middle"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Criar primeiro projeto</button></div>';
  } else {
    html += '<div class="liz-proj-grid">';
    projects.forEach((p) => {
      const isArchived = p.status === 'archived';
      const accentColor = p.color || '#8b5cf6';
      const insight = this._getProjectInsight(p.name);
      html += '<div class="liz-proj-card" data-id="' + this._esc(p.id) + '"><div class="liz-proj-card-accent" style="background:linear-gradient(180deg,' + accentColor + ' 0%,rgba(139,92,246,0.3) 60%,transparent 100%)"></div><div class="liz-proj-card-content">' +
        '<div class="liz-proj-card-dot"><span class="liz-proj-card-dot-circle"></span><span class="liz-proj-card-dot-label">' + (isArchived ? 'Arquivo' : 'Ativo') + '</span></div>' +
        '<h3 class="liz-proj-card-name"><span class="liz-proj-card-name-icon">' + crownSvg + '</span>' + this._esc(p.name) + '</h3>' +
        '<p class="liz-proj-card-insight">\u201C' + insight + '\u201D</p>' +
        '<p class="liz-proj-card-desc">' + (p.desc ? this._esc(p.desc) : 'Espaço criativo sem descrição') + '</p>' +
        '<div class="liz-proj-card-footer"><span class="liz-proj-card-updated">' + this._esc(p.updatedAt) + '</span>' +
        '<div class="liz-proj-card-actions"><button class="liz-proj-card-action-btn proj-card-archive" data-id="' + this._esc(p.id) + '" type="button" title="' + (isArchived ? 'Restaurar' : 'Arquivar') + '">' +
          (isArchived ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 1 6 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>') +
        '</button><button class="liz-proj-card-action-btn liz-proj-card-action-btn--danger proj-card-delete" data-id="' + this._esc(p.id) + '" type="button" title="Excluir">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
        '</button></div></div></div><span class="liz-proj-card-watermark">LIZ</span></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  html += '<div class="liz-proj-mini-menu" id="proj-mini-menu"><div class="liz-proj-mini-wrap">' +
    '<button class="liz-proj-mini-pill" data-action="new" type="button" aria-label="Nova conversa"><span class="liz-proj-mini-pill-ico">' + LizConfig.icons.newChat + '</span><span class="liz-proj-mini-pill-label">Novo</span></button>' +
    '<button class="liz-proj-mini-pill" data-action="conversations" type="button" aria-label="Conversas"><span class="liz-proj-mini-pill-ico">' + LizConfig.icons.chats + '</span><span class="liz-proj-mini-pill-label">Conversas</span></button>' +
    '<button class="liz-proj-mini-pill" data-action="tools" type="button" aria-label="Ferramentas"><span class="liz-proj-mini-pill-ico">' + LizConfig.icons.tools + '</span><span class="liz-proj-mini-pill-label">Ferramentas</span></button>' +
    '<button class="liz-proj-mini-pill is-active" data-action="projects" type="button" aria-label="Projetos"><span class="liz-proj-mini-pill-ico">' + LizConfig.icons.projects + '</span><span class="liz-proj-mini-pill-label">Projetos</span></button>' +
    '<button class="liz-proj-mini-pill" data-action="settings" type="button" aria-label="Ajustes"><span class="liz-proj-mini-pill-ico">' + LizConfig.icons.settings + '</span><span class="liz-proj-mini-pill-label">Ajustes</span></button></div></div>';
  content.innerHTML = html;
  this._bindProjectEvents(content);
};

LizUI._bindProjectEvents = function(content) {
  const searchInput = document.getElementById('proj-search-input');
  if (searchInput) { searchInput.addEventListener('input', (e) => { this._projectsSearchQuery = e.target.value; this.renderProjectsPage(); }); }
  content.querySelectorAll('.liz-proj-nav-btn').forEach((tab) => { tab.addEventListener('click', () => { this._projectsFilter = tab.dataset.filter; this._projectsSearchQuery = ''; this.renderProjectsPage(); }); });
  ['proj-create-btn', 'proj-empty-create-btn'].map((id) => document.getElementById(id)).filter(Boolean).forEach((btn) => { btn.addEventListener('click', () => this._openCreateProjectModal()); });
  content.querySelectorAll('.proj-card-archive').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); LizData.archiveProject(btn.dataset.id); this.renderProjectsPage(); if (typeof LizChat !== 'undefined' && LizChat.toast) { const p = LizData.projectList.find((x) => x.id === btn.dataset.id); LizChat.toast(p && p.status === 'active' ? 'Projeto restaurado' : 'Projeto arquivado'); } });
  });
  content.querySelectorAll('.proj-card-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); if (confirm('Excluir este projeto? Esta ação não pode ser desfeita.')) { LizData.deleteProject(btn.dataset.id); this.renderProjectsPage(); if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Projeto excluído'); } });
  });
  content.querySelectorAll('.liz-proj-mini-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const action = pill.dataset.action;
      if (action === 'new') { LizUI.closePanel(); if (typeof LizChat !== 'undefined' && LizChat._handlePill) LizChat._handlePill('new'); }
      else if (action === 'projects') { LizUI.closePanel(); }
      else if (action === 'conversations' || action === 'tools') { LizUI._showFloatPanel(action); }
      else if (action === 'settings') { if (typeof LizSettings !== 'undefined') LizSettings.showFloatPanel(action); }
    });
  });
  const miniMenu = document.getElementById('proj-mini-menu');
  if (miniMenu) { miniMenu.classList.add('is-expanded'); }
};

LizUI._openCreateProjectModal = function() {
  const existing = document.querySelector('.liz-proj-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'liz-proj-modal-overlay';
  const closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  overlay.innerHTML = '<div class="liz-proj-modal"><div class="liz-proj-modal-header"><h3 class="liz-proj-modal-title">' +
    '<span class="liz-proj-modal-title-icon"><svg viewBox="0 0 810 580" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="0,520 160,520 60,140 270,310 400,80 530,310 740,140 640,520 800,520"/></svg></span>Novo Projeto</h3>' +
    '<button class="liz-proj-modal-close" id="proj-modal-close" type="button" aria-label="Fechar">' + closeSvg + '</button></div>' +
    '<div class="liz-proj-modal-field"><label for="proj-modal-name">Nome do projeto</label><input id="proj-modal-name" type="text" placeholder="Ex: Site da Liz" autocomplete="off" /></div>' +
    '<div class="liz-proj-modal-field"><label for="proj-modal-desc">Descrição</label><textarea id="proj-modal-desc" placeholder="Opcional — descreva brevemente o projeto" rows="2"></textarea></div>' +
    '<button class="liz-proj-modal-submit" id="proj-modal-submit" type="button">Criar Projeto</button></div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.classList.add('is-visible'); const input = document.getElementById('proj-modal-name'); if (input) setTimeout(() => input.focus(), 100); });
  const close = () => { overlay.classList.remove('is-visible'); setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('proj-modal-close').addEventListener('click', close);
  document.getElementById('proj-modal-submit').addEventListener('click', () => {
    const nameInput = document.getElementById('proj-modal-name');
    const descInput = document.getElementById('proj-modal-desc');
    const name = nameInput ? nameInput.value.trim() : '';
    if (nameInput) { nameInput.closest('.liz-proj-modal-field')?.classList.remove('has-error'); }
    if (!name) { if (nameInput) { nameInput.closest('.liz-proj-modal-field')?.classList.add('has-error'); nameInput.focus(); } return; }
    const desc = descInput ? descInput.value.trim() : '';
    LizData.createProject(name, desc);
    this._projectsFilter = 'all'; this._projectsSearchQuery = '';
    this.renderProjectsPage(); close();
    if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Projeto criado!');
  });
  document.getElementById('proj-modal-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('proj-modal-submit').click(); } if (e.key === 'Escape') close(); });
  document.getElementById('proj-modal-desc').addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
};
