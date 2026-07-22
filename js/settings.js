/* ============================================================
 *  Liz — settings.js
 *  Lógica do painel flutuante de ajustes (categorias, páginas)
 * ============================================================ */

const LizSettings = {
  /** Mostra painel flutuante de ajustes ao lado do menu */
  showFloatPanel(action) {
    const existing = document.getElementById('main-float-panel');
    if (existing && existing.classList.contains('is-visible') && existing.dataset.action === action) {
      this.hideFloatPanel();
      return;
    }
    const old = document.getElementById('main-float-panel');
    if (old) old.remove();

    LizUI._hideFloatPanel();
    LizUI.setActivePill(action);

    const panel = document.createElement('div');
    panel.id = 'main-float-panel';
    panel.className = 'liz-main-float-panel';
    panel.dataset.action = action;

    const titles = {
      conversations: 'Conversas recentes',
      tools: 'Ferramentas da Liz',
      settings: 'Ajustes',
    };
    const icons = {
      conversations: LizConfig.icons.chats || '',
      tools: LizConfig.icons.tools || '',
      settings: LizConfig.icons.settings || '',
    };
    const title = titles[action] || action;
    let bodyHtml = '';

    if (action === 'settings') {
      const cats = [
        { id: 'appearance', icon: 'sun', label: 'Aparência' },
        { id: 'notifications', icon: 'chats', label: 'Notificações' },
        { id: 'chat', icon: 'sparkle', label: 'Chat' },
        { id: 'history', icon: 'folder', label: 'Histórico' },
        { id: 'shortcuts', icon: 'code', label: 'Atalhos' },
        { id: 'memory', icon: 'filesMenu', label: 'Memória' },
        { id: 'account', icon: 'settings', label: 'Conta' },
        { id: 'language', icon: 'filter', label: 'Idioma e Região' },
      ];
      bodyHtml = '<div class="liz-float-settings" id="main-float-settings-hub">';
      cats.forEach((c) => {
        bodyHtml += '<button class="liz-float-set-btn" data-cat="' + c.id + '" type="button">' +
          '<span class="liz-float-set-ico">' + (LizConfig.icons[c.icon] || LizConfig.icons.sparkle) + '</span>' +
          '<span>' + c.label + '</span>' +
          '<span class="liz-float-set-arrow">' + (LizConfig.icons.continue || '') + '</span>' +
          '</button>';
      });
      bodyHtml += '</div>';
    }

    panel.innerHTML = '<div class="liz-float-head">' +
      '<span class="liz-float-title">' +
        '<span class="liz-float-title-ico">' + (icons[action] || '') + '</span>' + title +
      '</span>' +
      '<button class="liz-float-close" type="button">' + (LizConfig.icons.close || '×') + '</button>' +
      '</div>' +
      '<div class="liz-float-body">' + bodyHtml + '</div>';

    document.body.appendChild(panel);
    void panel.offsetHeight;
    panel.classList.add('is-visible');

    panel.querySelector('.liz-float-close').addEventListener('click', () => this.hideFloatPanel());
    panel.querySelectorAll('.liz-float-set-btn[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => this.showSettingsPage(btn.dataset.cat));
    });

    setTimeout(() => {
      const handler = (e) => {
        if (!panel.contains(e.target) && !e.target.closest('.float-pill')) {
          this.hideFloatPanel();
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
      panel._outsideHandler = handler;
    }, 10);

    const escHandler = (e) => {
      if (e.key === 'Escape') { this.hideFloatPanel(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
    panel._escHandler = escHandler;
  },

  hideFloatPanel() {
    const panel = document.getElementById('main-float-panel');
    if (!panel) return;
    panel.classList.remove('is-visible');
    if (panel._outsideHandler) document.removeEventListener('click', panel._outsideHandler);
    if (panel._escHandler) document.removeEventListener('keydown', panel._escHandler);
    LizUI.clearActivePill();
    setTimeout(() => panel.remove(), 260);
  },

  showSettingsPage(pageId) {
    const panel = document.getElementById('main-float-panel');
    if (!panel) return;
    const body = panel.querySelector('.liz-float-body');
    if (!body) return;

    const titles = {
      appearance: 'Aparência', notifications: 'Notificações', chat: 'Chat',
      history: 'Histórico', shortcuts: 'Atalhos', memory: 'Memória',
      account: 'Conta', language: 'Idioma e Região',
    };
    const title = titles[pageId] || pageId;

    setTimeout(() => {
      body.innerHTML = '<div class="settings-page-anim">' +
        '<div class="liz-float-settings-top">' +
        '<button class="liz-float-settings-back" type="button" aria-label="Voltar">' +
          (LizConfig.icons.continue || '←') +
        '</button>' +
        '<span class="liz-float-settings-page-title">' + title + '</span>' +
        '</div>' +
        this._getPageHTML(pageId) +
        '</div>';

      body.querySelector('.liz-float-settings-back').addEventListener('click', () => {
        // Anima saída: fade out rápido
        const animWrap = body.querySelector('.settings-page-anim');
        if (animWrap) animWrap.style.opacity = '0';

        setTimeout(() => {
          const cats = [
            { id: 'appearance', icon: 'sun', label: 'Aparência' },
            { id: 'notifications', icon: 'chats', label: 'Notificações' },
            { id: 'chat', icon: 'sparkle', label: 'Chat' },
            { id: 'history', icon: 'folder', label: 'Histórico' },
            { id: 'shortcuts', icon: 'code', label: 'Atalhos' },
            { id: 'memory', icon: 'filesMenu', label: 'Memória' },
            { id: 'account', icon: 'settings', label: 'Conta' },
            { id: 'language', icon: 'filter', label: 'Idioma e Região' },
          ];
          let html = '<div class="liz-float-settings" id="main-float-settings-hub">';
          cats.forEach((c, i) => {
            html += '<button class="liz-float-set-btn settings-cat-anim" data-cat="' + c.id + '" type="button" style="animation-delay:' + (i * 0.03) + 's">' +
              '<span class="liz-float-set-ico">' + (LizConfig.icons[c.icon] || LizConfig.icons.sparkle) + '</span>' +
              '<span>' + c.label + '</span>' +
              '<span class="liz-float-set-arrow">' + (LizConfig.icons.continue || '') + '</span>' +
              '</button>';
          });
          html += '</div>';
          body.innerHTML = html;
          body.querySelectorAll('.liz-float-set-btn[data-cat]').forEach((btn) => {
            btn.addEventListener('click', () => this.showSettingsPage(btn.dataset.cat));
          });
        }, 120);
      });

      this._bindPageActions(pageId, panel);
    }, 0);
  },

  _getPageHTML(pageId) {
    const pages = {
      appearance: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Tema</p>
            <div class="segmented" id="float-appearance-segmented">
              <button class="seg-btn" data-theme-val="dark" type="button">Escuro</button>
              <button class="seg-btn" data-theme-val="light" type="button">Claro</button>
              <button class="seg-btn" data-theme-val="auto" type="button">Automático</button>
            </div>
          </div>
          <div class="settings-group">
            <p class="settings-label">Tamanho da Fonte</p>
            <div class="segmented" id="float-font-size-segmented">
              <button class="seg-btn" data-font-size="small" type="button">Pequena</button>
              <button class="seg-btn" data-font-size="medium" type="button">Média</button>
              <button class="seg-btn" data-font-size="large" type="button">Grande</button>
            </div>
          </div>
          <div class="settings-group">
            <p class="settings-label">Cor de Destaque</p>
            <div class="accent-color-grid" id="float-accent-color-grid">
              <button class="accent-color-btn is-active" data-accent="purple" type="button" style="--accent-color:#8b5cf6" aria-label="Roxo"></button>
              <button class="accent-color-btn" data-accent="blue" type="button" style="--accent-color:#3b82f6" aria-label="Azul"></button>
              <button class="accent-color-btn" data-accent="green" type="button" style="--accent-color:#10b981" aria-label="Verde"></button>
              <button class="accent-color-btn" data-accent="rose" type="button" style="--accent-color:#f43f5e" aria-label="Rosa"></button>
            </div>
          </div>
          <div class="settings-group">
            <p class="settings-label">Personalização</p>
            <label class="settings-row">
              <span>Como a Liz te chama</span>
              <input type="text" class="settings-input" id="float-user-name-input" value="Victor" />
            </label>
          </div>
        </div>`,
      notifications: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Notificações</p>
            <label class="settings-toggle">
              <input type="checkbox" id="float-notifications" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Notificações de mensagens</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-notification-sound" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Som de notificação</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-notification-vibrate" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Vibrar ao receber mensagem</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-notification-preview" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Prévia da mensagem</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-notification-group" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Agrupar notificações</span>
            </label>
          </div>
        </div>`,
      chat: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Comportamento</p>
            <label class="settings-toggle">
              <input type="checkbox" id="float-show-suggestions" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Mostrar sugestões iniciais</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-continuation-suggestions" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Sugestões de continuação</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-timestamp" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Mostrar timestamp</span>
            </label>
          </div>
          <div class="settings-group">
            <p class="settings-label">Aparência</p>
            <label class="settings-toggle">
              <input type="checkbox" id="float-animations" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Animações suaves</span>
            </label>
            <label class="settings-toggle">
              <input type="checkbox" id="float-glow" checked />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">Brilho roxo premium</span>
            </label>
          </div>
        </div>`,
      history: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Histórico</p>
            <div class="settings-info-row">
              <span class="settings-info-text" id="float-history-count">0 conversas</span>
              <span class="settings-info-text" id="float-files-count">0 arquivos</span>
            </div>
            <div class="settings-actions-row">
              <button class="settings-action-btn" id="float-export-all" type="button">
                <span class="settings-action-btn-ico">${LizConfig.icons.download || ''}</span>
                Exportar conversas
              </button>
              <button class="settings-action-btn settings-action-btn-danger" id="float-clear-history" type="button">
                <span class="settings-action-btn-ico settings-action-btn-ico-danger">${LizConfig.icons.trash || ''}</span>
                Limpar histórico
              </button>
            </div>
          </div>
        </div>`,
      shortcuts: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Atalhos de Teclado</p>
            <div class="shortcuts-grid">
              <div class="shortcut-row"><kbd class="shortcut-key">Enter</kbd><span class="shortcut-desc">Enviar mensagem</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">Shift</kbd><span class="shortcut-plus">+</span><kbd class="shortcut-key">Enter</kbd><span class="shortcut-desc">Nova linha</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">⌘/Ctrl</kbd><span class="shortcut-plus">+</span><kbd class="shortcut-key">N</kbd><span class="shortcut-desc">Nova conversa</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">⌘/Ctrl</kbd><span class="shortcut-plus">+</span><kbd class="shortcut-key">F</kbd><span class="shortcut-desc">Buscar na conversa</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">⌘/Ctrl</kbd><span class="shortcut-plus">+</span><kbd class="shortcut-key">E</kbd><span class="shortcut-desc">Modo foco</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">Esc</kbd><span class="shortcut-desc">Fechar painel</span></div>
              <div class="shortcut-row"><kbd class="shortcut-key">Espaço</kbd><span class="shortcut-desc">Abrir/Recolher menu</span></div>
            </div>
          </div>
        </div>`,
      memory: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Armazenamento</p>
            <div class="memory-info">
              <div class="memory-bar-track">
                <div class="memory-bar-fill" id="float-memory-bar-fill" style="width: 0%"></div>
              </div>
              <div class="memory-details">
                <span id="float-memory-used-text">Calculando...</span>
                <span class="memory-limit-text">~5 MB</span>
              </div>
            </div>
          </div>
          <div class="settings-group">
            <p class="settings-label">Gerenciamento</p>
            <button class="settings-action-btn" id="float-clear-cache" type="button">
              <span class="settings-action-btn-ico">${LizConfig.icons.trash || ''}</span>
              Limpar cache do navegador
            </button>
          </div>
        </div>`,
      account: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Conta</p>
            <div class="account-card">
              <div class="account-avatar"><span class="account-avatar-letter">V</span></div>
              <div class="account-info">
                <span class="account-name">Victor</span>
                <span class="account-email">victor@email.com</span>
                <span class="account-plan">Plano Gratuito</span>
              </div>
            </div>
            <label class="settings-row" style="margin-top: 10px;">
              <span>Email</span>
              <input type="email" class="settings-input" id="float-email-input" value="victor@email.com" />
            </label>
          </div>
        </div>`,
      language: `
        <div class="liz-float-settings-page">
          <div class="settings-group">
            <p class="settings-label">Idioma</p>
            <label class="settings-row">
              <span>Idioma</span>
              <select class="settings-input" id="float-language" style="width:130px">
                <option value="pt-BR">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
          </div>
          <div class="settings-group">
            <p class="settings-label">Regional</p>
            <label class="settings-row">
              <span>Formato de data</span>
              <select class="settings-input" id="float-date-format" style="width:130px">
                <option value="DMY">Dia/Mês/Ano</option>
                <option value="MDY">Mês/Dia/Ano</option>
              </select>
            </label>
          </div>
        </div>`,
    };
    return pages[pageId] || '';
  },

  _bindPageActions(pageId, panel) {
    if (pageId === 'history') {
      const exportBtn = panel.querySelector('#float-export-all');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          LizData.loadSavedConversations();
          const allConvs = LizData.savedConversations;
          if (allConvs.length === 0) { if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Nenhuma conversa para exportar'); return; }
          let md = '# Todas as conversas - Liz\n\n';
          allConvs.forEach((conv) => {
            md += '## ' + conv.title + '\n\n';
            conv.messages.forEach((m) => {
              md += (m.role === 'user' ? '**Você:**' : '**Liz:**') + ' ' + m.content + '\n';
              if (m.time) md += '*(' + m.time + ')*';
              md += '\n\n';
            });
            md += '---\n\n';
          });
          md += '*Exportado por Liz Chat*';
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = 'liz-conversas-completas.md'; document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(a.href);
          if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast(allConvs.length + ' conversas exportadas!');
        });
      }
      const clearBtn = panel.querySelector('#float-clear-history');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (confirm('Tem certeza? Todas as conversas salvas serão apagadas.')) {
            LizData.savedConversations = [];
            try { localStorage.removeItem(LizData.STORAGE_KEY); } catch (e) { /* ignore */ }
            const countEl = panel.querySelector('#float-history-count');
            if (countEl) countEl.textContent = '0 conversas';
            if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Histórico limpo');
          }
        });
      }
    }
    if (pageId === 'memory') {
      const cacheBtn = panel.querySelector('#float-clear-cache');
      if (cacheBtn) {
        cacheBtn.addEventListener('click', () => {
          if (confirm('Limpar cache local?')) {
            try {
              localStorage.removeItem(LizData.STORAGE_KEY);
              localStorage.removeItem(LizData.UPLOADS_KEY);
              LizData.savedConversations = [];
              LizData.uploadedFiles = [];
              const bar = panel.querySelector('#float-memory-bar-fill');
              const text = panel.querySelector('#float-memory-used-text');
              if (bar) bar.style.width = '0%';
              if (text) text.textContent = '0 KB usados';
              if (typeof LizChat !== 'undefined' && LizChat.toast) LizChat.toast('Cache limpo');
            } catch (e) { /* ignore */ }
          }
        });
      }
    }
    if (pageId === 'appearance') {
      // Theme segmented
      document.querySelectorAll('#float-appearance-segmented .seg-btn[data-theme-val]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.themeVal;
          const effective = val === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : val;
          LizUI.setTheme(effective, true);
          localStorage.setItem(LizConfig.theme.storageKey, val);
          document.querySelectorAll('#float-appearance-segmented .seg-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
      // Font size
      document.querySelectorAll('#float-font-size-segmented .seg-btn[data-font-size]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const size = btn.dataset.fontSize;
          document.querySelectorAll('#float-font-size-segmented .seg-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          document.documentElement.setAttribute('data-font-size', size);
          localStorage.setItem('liz-font-size', size);
        });
      });
      // Accent color
      document.querySelectorAll('#float-accent-color-grid .accent-color-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#float-accent-color-grid .accent-color-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const color = getComputedStyle(btn).getPropertyValue('--accent-color').trim();
          document.documentElement.style.setProperty('--color-brand', color);
          localStorage.setItem('liz-accent-color', color);
          localStorage.setItem('liz-accent-name', btn.dataset.accent);
        });
      });
    }
    if (pageId === 'chat') {
      const chatToggles = [
        'float-show-suggestions', 'float-continuation-suggestions',
        'float-timestamp', 'float-animations', 'float-glow'
      ];
      chatToggles.forEach((id) => {
        const el = panel.querySelector('#' + id);
        if (el) {
          // Restore saved state
          const saved = localStorage.getItem('liz-' + id.replace('float-', ''));
          if (saved !== null) el.checked = saved === 'true';

          el.addEventListener('change', () => {
            const key = 'liz-' + id.replace('float-', '');
            localStorage.setItem(key, el.checked);
            if (typeof LizChat !== 'undefined' && typeof LizChat.applyChatSettings === 'function') {
              LizChat.applyChatSettings();
            }
          });
        }
      });
    }
    if (pageId === 'notifications') {
      const notifToggles = ['float-notifications', 'float-notification-sound', 'float-notification-vibrate', 'float-notification-preview', 'float-notification-group'];
      notifToggles.forEach((id) => {
        const el = panel.querySelector('#' + id);
        if (el) {
          const saved = localStorage.getItem('liz-' + id.replace('float-', ''));
          if (saved !== null) el.checked = saved === 'true';
          el.addEventListener('change', () => {
            localStorage.setItem('liz-' + id.replace('float-', ''), el.checked);
          });
        }
      });
    }
    if (pageId === 'language') {
      const langSelect = panel.querySelector('#float-language');
      if (langSelect) {
        langSelect.addEventListener('change', () => {
          localStorage.setItem('liz-language', langSelect.value);
        });
      }
    }
  },
};

window.LizSettings = LizSettings;
