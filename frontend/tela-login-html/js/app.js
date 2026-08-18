/* ============================================================
   TELA DE LOGIN — JavaScript (Vanilla, convertido do React)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ======================== STATE ========================
  const state = {
    page: 'login',
    prevPage: null,
    isTransitioning: false,
    displayPage: 'login',
    theme: getInitialTheme(),
    themeSource: localStorage.getItem('liz-theme-source') || 'system'
  }

  // ======================== THEME ========================
  function getInitialTheme() {
    const stored = localStorage.getItem('liz-theme')
    const source = localStorage.getItem('liz-theme-source')
    if (source === 'manual' && stored) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }

  function applyTheme(nextTheme) {
    state.theme = nextTheme
    localStorage.setItem('liz-theme', nextTheme)
    localStorage.setItem('liz-theme-source', 'manual')
    state.themeSource = 'manual'
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  function toggleTheme(e) {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    // Update thumb animation immediately
    const thumb = document.querySelector('.theme-toggle-thumb')
    if (thumb) {
      const targetPos = nextTheme === 'light' ? 1 : 0
      animateThumbTo(targetPos)
    }

    // Fallback for browsers without View Transitions
    if (!document.startViewTransition) {
      root.classList.remove('theme-morphing')
      void root.offsetWidth
      root.classList.add('theme-morphing')
      setTimeout(() => root.classList.remove('theme-morphing'), 850)
      applyTheme(nextTheme)
      updateThemeToggleIcon()
      return
    }

    const x = e?.clientX ?? window.innerWidth - 46
    const y = e?.clientY ?? 38
    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    root.setAttribute('data-theme-reveal', nextTheme)

    document.startViewTransition(() => {
      applyTheme(nextTheme)
      updateThemeToggleIcon()
    })
  }

  function updateThemeToggleIcon() {
    const thumb = document.querySelector('.theme-toggle-thumb')
    if (!thumb) return
    const isDark = state.theme === 'dark'
    thumb.innerHTML = isDark
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    // Update thumb background color via CSS variable
    thumb.style.background = isDark ? '#8b5cf6' : '#f59e0b'
  }

  // Theme toggle thumb animation (JS-driven, like React version)
  const THUMB_TRAVEL = 24
  let thumbCurrentPos = state.theme === 'light' ? 1 : 0
  let thumbTargetPos = state.theme === 'light' ? 1 : 0
  let thumbAnimationRef = null

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  function applyThumbPos(pos) {
    const thumb = document.querySelector('.theme-toggle-thumb')
    if (!thumb) return
    const x = pos * THUMB_TRAVEL
    const rot = pos * 180
    thumb.style.transform = `translateX(${x}px) rotate(${rot}deg)`
  }

  function animateThumbTo(newTarget) {
    if (thumbAnimationRef) {
      cancelAnimationFrame(thumbAnimationRef)
      thumbAnimationRef = null
    }
    thumbTargetPos = newTarget

    const startX = thumbCurrentPos
    const delta = newTarget - startX
    if (Math.abs(delta) < 0.001) return

    const duration = 420
    const startTime = performance.now()

    function step(now) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(t)
      const pos = startX + delta * eased
      thumbCurrentPos = pos
      applyThumbPos(pos)
      if (t < 1) {
        thumbAnimationRef = requestAnimationFrame(step)
      } else {
        thumbCurrentPos = newTarget
        thumbAnimationRef = null
      }
    }
    thumbAnimationRef = requestAnimationFrame(step)
  }

  // Listen to system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (state.themeSource !== 'manual') {
      const newTheme = e.matches ? 'light' : 'dark'
      state.theme = newTheme
      document.documentElement.setAttribute('data-theme', newTheme)
      updateThemeToggleIcon()
    }
  })

  // ======================== NAVIGATION (SPA) ========================
  function navigate(dest) {
    if (dest === state.page || state.isTransitioning) return
    state.prevPage = state.page
    state.isTransitioning = true

    const wrapper = document.getElementById('page-wrapper')
    wrapper.classList.remove('page-enter')
    wrapper.classList.add('page-exit')

    setTimeout(() => {
      state.displayPage = dest
      state.page = dest
      renderActivePage()

      // O novo wrapper já é criado com class="page-enter" dentro de renderActivePage()
      requestAnimationFrame(() => {
        state.isTransitioning = false
      })
    }, 250)
  }

  // ======================== ICONS ========================
  const icons = {
    email: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    google: `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    github: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`
  }

  // ======================== PHRASE CAROUSEL ========================
  const PHRASE_SETS = {
    login: [
      'Inteligência que transforma ideias em realidade',
      'Inovação ao alcance de todos',
      'Construindo o futuro, linha por linha',
      'Onde a tecnologia encontra a criatividade',
      'Seu parceiro em soluções inteligentes',
      'Transformando desafios em soluções digitais',
      'Criatividade e tecnologia em perfeita sintonia',
      'Ideias ganham forma com inteligência',
      'Conectando pessoas ao futuro',
      'Soluções simples para grandes ideias',
      'Tecnologia feita para evoluir com você',
      'Cada detalhe pensado para impressionar',
      'O próximo passo começa com uma ideia',
      'Design, código e inteligência em harmonia',
      'A inovação começa aqui',
    ],
    register: [
      'Sua jornada tecnológica começa aqui',
      'Crie sua conta e explore o novo',
      'Junte-se à comunidade Liz',
      'Transformando o amanhã hoje',
      'O futuro aguarda suas ideias',
      'Seja parte da revolução digital',
      'Construa o impossível conosco',
      'Inovação sem limites',
    ]
  }

  let phraseInterval = null

  function startPhraseCarousel(variant = 'login') {
    stopPhraseCarousel()
    const phrases = PHRASE_SETS[variant] || PHRASE_SETS.login
    let index = 0
    const el = document.querySelector('.phrase-carousel')
    if (!el) return
    el.textContent = phrases[0]

    phraseInterval = setInterval(() => {
      index = (index + 1) % phrases.length
      if (el) {
        el.style.animation = 'none'
        void el.offsetWidth
        el.style.animation = ''
        el.textContent = phrases[index]
      }
    }, 4000)
  }

  function stopPhraseCarousel() {
    if (phraseInterval) {
      clearInterval(phraseInterval)
      phraseInterval = null
    }
  }

  // ======================== SVG DECORATIONS ========================
  function getDecoSvg() {
    return `<svg class="bg-deco" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon class="deco deco-hex-1" points="720,80 830,143 830,269 720,332 610,269 610,143" />
      <polygon class="deco deco-hex-2" points="200,500 260,535 260,605 200,640 140,605 140,535" />
      <polygon class="deco deco-tri" points="1200,120 1260,220 1140,220" />
      <circle class="deco deco-circle-1" cx="1350" cy="300" r="50" />
      <circle class="deco deco-circle-2" cx="100" cy="750" r="35" />
      <polygon class="deco deco-diamond" points="1350,550 1375,590 1350,630 1325,590" />
    </svg>`
  }

  function getRegisterDecoSvg() {
    return `<svg class="bg-deco-register" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon class="deco-r deco-r-hex-1" points="720,80 830,143 830,269 720,332 610,269 610,143" />
      <polygon class="deco-r deco-r-hex-2" points="200,500 260,535 260,605 200,640 140,605 140,535" />
      <polygon class="deco-r deco-r-tri" points="1200,120 1260,220 1140,220" />
      <circle class="deco-r deco-r-circle-1" cx="1350" cy="300" r="50" />
      <circle class="deco-r deco-r-circle-2" cx="100" cy="750" r="35" />
      <polygon class="deco-r deco-r-diamond" points="1350,550 1375,590 1350,630 1325,590" />
    </svg>`
  }

  // ======================== CROWN EASTER EGG ========================
  const CROWN_SECRET = '01100101 01110101 00100000 01110011 01101111 01110101 00100000 01100001 00100000 01101100 01101001 01111010'

  let crownSecretTimer = null

  function createCrownSecretBox() {
    const box = document.createElement('div')
    box.className = 'crown-secret-box'
    box.setAttribute('aria-hidden', 'true')
    const span = document.createElement('span')
    span.className = 'crown-secret-text'
    span.textContent = CROWN_SECRET
    box.appendChild(span)
    return box
  }

  function toggleCrownSecret(container) {
    const existing = container.querySelector('.crown-secret-box')
    if (!existing) {
      const box = createCrownSecretBox()
      box.classList.add('is-entering')
      container.appendChild(box)
    } else {
      existing.classList.remove('is-entering')
      existing.classList.add('is-leaving')
      setTimeout(() => {
        if (existing.parentNode) existing.parentNode.removeChild(existing)
      }, 500)
    }
  }

  // ======================== PASSWORD STRENGTH ========================
  function calculateStrength(password) {
    if (!password) return { percent: 0, color: '#ef4444', label: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    const percent = Math.ceil((strength / 5) * 100)
    const color = percent < 33 ? '#ef4444' : percent < 66 ? '#f59e0b' : '#10b981'
    const label = percent < 33 ? 'Fraca' : percent < 66 ? 'Média' : 'Forte'
    return { percent, color, label }
  }

  // ======================== FIREBASE AUTH ========================
  function showFormAlert(alertId, message, type = 'error') {
    const el = document.getElementById(alertId)
    if (!el) return
    el.textContent = message
    el.dataset.type = type
    el.hidden = false
  }

  function hideFormAlert(alertId) {
    const el = document.getElementById(alertId)
    if (!el) return
    el.hidden = true
    el.textContent = ''
  }

  function firebaseErrorMessage(code) {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-login-credentials':
        return 'E-mail ou senha incorretos'
      case 'auth/invalid-email':
        return 'E-mail inválido'
      case 'auth/user-disabled':
        return 'Esta conta foi desativada'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente'
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado'
      case 'auth/weak-password':
        return 'A senha é muito fraca (mínimo 6 caracteres)'
      case 'auth/network-request-failed':
        return 'Falha de conexão. Verifique sua internet'
      case 'auth/popup-closed-by-user':
        return 'A janela do Google fechou antes de concluir. Verifique: 1) se o navegador (Brave/Chrome) não está bloqueando cookies de terceiros — permita para este site; 2) se o Público-alvo do Google Auth Platform está em Produção (não em Teste).'
      case 'auth/cancelled-popup-request':
        return 'Outra janela de login já estava aberta'
      case 'auth/operation-not-allowed':
        return 'Este método de login não está ativado no Firebase'
      case 'auth/unauthorized-domain':
        return 'Este domínio não está autorizado no Firebase (Authentication → Settings)'
      default:
        return `Erro ao autenticar (${code || 'desconhecido'}). Tente novamente`
    }
  }

  const FIREBASE_NOT_CONFIGURED_MSG =
    'Firebase indisponível. Preencha as variáveis FIREBASE_* no backend/.env e suba o backend'

  // Aguarda o config chegar do backend antes de usar o Firebase
  async function ensureFirebaseReady() {
    if (window.firebaseConfigPromise) {
      await window.firebaseConfigPromise
    }
    return window.firebaseReady
  }

  // URL do app principal: localmente o login vive em /tela-login-html/ e o app
  // na raiz; na nuvem o login fica na raiz e o app em /chat/.
  function appUrl() {
    return location.pathname.includes('tela-login-html') ? '../index.html' : 'chat/'
  }

  // Overlay de sucesso de login → "Continuar" leva ao app principal
  function presentLoginSuccess(displayName) {
    const root = document.getElementById('root')
    const overlayDiv = document.createElement('div')
    overlayDiv.innerHTML = renderSuccessOverlay('login', displayName)
    root.appendChild(overlayDiv.firstElementChild)
    startPhraseCycle(root)

    document.getElementById('btn-continue-login')?.addEventListener('click', () => {
      window.location.href = appUrl()
    })
  }

  // Frases que se alternam na linha de status do overlay de sucesso
  function startPhraseCycle(scope) {
    const el = scope?.querySelector('.success-phrase')
    if (!el) return
    let phrases = []
    try { phrases = JSON.parse(el.dataset.phrases || '[]') } catch { return }
    if (phrases.length < 2) return
    let i = 0
    // leitores de tela não devem ouvir cada troca — o overlay já anuncia a primeira
    el.setAttribute('aria-hidden', 'true')
    const swap = () => {
      el.classList.remove('is-animating')
      void el.offsetWidth // reinicia a animação
      el.classList.add('is-animating')
      setTimeout(() => {
        i = (i + 1) % phrases.length
        el.textContent = phrases[i]
      }, 300)
    }
    setInterval(swap, 4000)
  }

  // Banco (Firestore): salva o perfil em users/{uid}.
  // As rules garantem que só o próprio usuário acessa esse documento.
  async function saveUserToFirestore(user, provider) {
    if (!window.firebaseReady || typeof firebase.firestore !== 'function') return
    try {
      const ref = firebase.firestore().collection('users').doc(user.uid)
      const snap = await ref.get()
      const data = {
        name: user.displayName || '',
        email: user.email || '',
        provider,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
      if (!snap.exists) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp()
      }
      await ref.set(data, { merge: true })
    } catch (err) {
      console.warn('[Liz] perfil não salvo no Firestore:', err.message)
    }
  }

  // Login social (Google / GitHub) — popup primeiro; se o navegador barrar
  // o popup (Brave / cookies de terceiros bloqueados), cai no redirecionamento.
  async function socialSignIn(providerName, alertId) {
    hideFormAlert(alertId)
    // Popup do Google exige origem http(s) — file:// nunca funciona
    if (location.protocol === 'file:') {
      showFormAlert(alertId, 'O login com ' + (providerName === 'github' ? 'GitHub' : 'Google') + ' não funciona abrindo o arquivo direto. Acesse pelo endereço normal do site (na nuvem ou pelo servidor local).')
      return
    }
    if (!(await ensureFirebaseReady())) {
      showFormAlert(alertId, FIREBASE_NOT_CONFIGURED_MSG)
      return
    }
    const provider = providerName === 'github'
      ? new firebase.auth.GithubAuthProvider()
      : new firebase.auth.GoogleAuthProvider()
    const isBrave = !!(navigator.brave && await navigator.brave.isBrave().catch(() => false))
    // Google sempre usa o fluxo direto (sem popup, sem handler do firebaseapp):
    // funciona igual no desktop, no Brave e no celular.
    if (providerName === 'google') {
      startManualGoogleFlow(alertId)
      return
    }
    try {
      let user
      try {
        const result = await firebase.auth().signInWithPopup(provider)
        user = result.user
      } catch (popupErr) {
        const redirectCodes = ['auth/popup-blocked', 'auth/web-storage-unsupported', 'auth/operation-not-supported-in-this-environment', 'auth/popup-closed-by-user']
        // popup-closed-by-user em navegador normal pode ser fechamento
        // intencional — só força redirect no Brave ou em erros de ambiente
        const intentionalClose = popupErr.code === 'auth/popup-closed-by-user' && !isBrave
        if (!redirectCodes.includes(popupErr.code) || intentionalClose) throw popupErr
        if (providerName === 'google') {
          // Fluxo direto: o Google devolve o id_token na própria página —
          // não depende do handler do firebaseapp nem de cookies de terceiros.
          console.warn('[Liz] popup indisponível (' + popupErr.code + '), usando fluxo direto do Google')
          startManualGoogleFlow(alertId)
          return
        }
        console.warn('[Liz] popup indisponível (' + popupErr.code + '), usando redirecionamento')
        await firebase.auth().signInWithRedirect(provider)
        return // a página navega; o retorno é tratado por handleRedirectResult()
      }
      await saveUserToFirestore(user, providerName)
      const rawName = user.displayName || (user.email ? user.email.split('@')[0] : 'Visitante')
      presentLoginSuccess(rawName)
    } catch (err) {
      showFormAlert(alertId, firebaseErrorMessage(err.code))
    }
  }

  // Retorno do signInWithRedirect (a página recarrega com o resultado na URL)
  async function handleRedirectResult() {
    if (!(await ensureFirebaseReady())) return
    try {
      const result = await firebase.auth().getRedirectResult()
      if (!result.user) return
      const providerName = result.credential && result.credential.providerId === 'github.com' ? 'github' : 'google'
      await saveUserToFirestore(result.user, providerName)
      const rawName = result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Visitante')
      presentLoginSuccess(rawName)
    } catch (err) {
      console.warn('[Liz] retorno do redirecionamento falhou:', err.code || err.message, '| hash:', location.hash.slice(0, 80))
      // operation-not-supported: Brave bloqueia o mecanismo de redirect do SDK —
      // o fluxo do Google agora é o direto (handleManualGoogleReturn), então ignora.
      const ignorable = ['auth/redirect-cancelled-by-user', 'auth/operation-not-supported-in-this-environment']
      if (err.code && !ignorable.includes(err.code)) {
        showFormAlert('login-alert', 'O retorno do Google falhou (' + err.code + '). Recarregue e tente de novo, ou use o login por e-mail.')
      }
    }
  }

  // Fluxo direto do Google (OAuth implícito): a página navega pro Google e
  // volta com o id_token na própria URL (#id_token=...). Não usa popup nem o
  // handler do firebaseapp.com — funciona com o Brave de Shields ligados.
  function startManualGoogleFlow(alertId) {
    const clientId = (window.firebaseConfig || {}).googleOAuthClientId
    if (!clientId) {
      showFormAlert(alertId, 'Cliente OAuth do Google não configurado. Reinicie o backend (GOOGLE_OAUTH_CLIENT_ID no .env).')
      return
    }
    const params = new URLSearchParams({
      client_id: clientId,
      // A própria URL da página de login (raiz na nuvem, caminho de dev local);
      // normaliza o host local pra bater com as URIs cadastradas no cliente OAuth
      redirect_uri: location.protocol + '//' + location.host.replace('127.0.0.1', 'localhost') + (location.pathname.endsWith('/') ? location.pathname : location.pathname + '/'),
      response_type: 'id_token',
      scope: 'openid email profile',
      state: 'liz-google',
      nonce: 'liz-' + Math.random().toString(36).slice(2) + Date.now().toString(36),
      prompt: 'select_account',
    })
    location.assign('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString())
  }

  // Retorno do fluxo direto: pega o id_token do hash e entra com ele
  async function handleManualGoogleReturn() {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : ''
    if (!hash.includes('id_token=')) return
    const idToken = new URLSearchParams(hash).get('id_token')
    // Tira o token da URL imediatamente (segurança + estética)
    history.replaceState(null, '', location.pathname + location.search)
    if (!idToken) return
    if (!(await ensureFirebaseReady())) return
    try {
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken)
      const user = (await firebase.auth().signInWithCredential(credential)).user
      await saveUserToFirestore(user, 'google')
      const rawName = user.displayName || (user.email ? user.email.split('@')[0] : 'Visitante')
      presentLoginSuccess(rawName)
    } catch (err) {
      console.error('[Liz] signInWithCredential falhou:', err.code || err.message)
      showFormAlert('login-alert', firebaseErrorMessage(err.code))
    }
  }

  // ======================== RENDER FUNCTIONS ========================

  function renderLoginPage() {
    return `
      <div class="login-page">
        ${getDecoSvg()}

        <div class="container">
          <div class="brand">
            <button type="button" class="crown-trigger" data-crown="login" aria-label="Easter egg da coroa">
              <img class="crown" src="coroa.svg" alt="Coroa" />
            </button>
            <div class="brand-divider">
              <span class="brand-divider-line"></span>
              <span class="brand-divider-dot"></span>
              <span class="brand-divider-line"></span>
            </div>
            <div class="brand-text">
              <h1 class="brand-title">Liz</h1>
              <p class="brand-tagline"><span class="phrase-carousel phrase-anim"></span></p>
            </div>
          </div>

          <div class="form-side">
            <div class="login-card">
              <div class="card-header">
                <h2>Entrar</h2>
                <p>Preencha seus dados abaixo</p>
              </div>

              <div class="form-alert" id="login-alert" role="alert" hidden></div>

              <form id="login-form" novalidate>
                <div class="field" id="login-email-field">
                  <label for="login-email">E-mail</label>
                  <div class="input-wrapper">
                    <span class="input-icon">${icons.email}</span>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      autocomplete="email"
                    />
                  </div>
                  <span class="error-msg" id="login-email-error"></span>
                </div>

                <div class="field" id="login-password-field">
                  <label for="login-password">Senha</label>
                  <div class="input-wrapper">
                    <span class="input-icon">${icons.lock}</span>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      autocomplete="current-password"
                    />
                    <button type="button" class="toggle-pw" data-toggle="login-password" aria-label="Mostrar senha">
                      ${icons.eye}
                    </button>
                  </div>
                  <div class="strength-meter" id="login-strength"></div>
                  <span class="error-msg" id="login-pw-error"></span>
                </div>

                <div class="row-between">
                  <label class="checkbox-label">
                    <input type="checkbox" id="remember-me" />
                    <span class="checkmark"></span>
                    Lembrar de mim
                  </label>
                  <a href="#" class="forgot-link" id="forgot-link">Esqueceu a senha?</a>
                </div>

                <button type="submit" class="btn-login" id="btn-login">Entrar</button>
              </form>

              <div class="divider">
                <span>ou continue com</span>
              </div>

              <div class="social-buttons">
                <button class="btn-social" type="button" data-social="google">
                  ${icons.google}
                  Google
                </button>
                <button class="btn-social" type="button" data-social="github">
                  ${icons.github}
                  GitHub
                </button>
              </div>

              <p class="signup-text">
                Não tem uma conta? <a href="#" data-nav="register" class="nav-link">Cadastre-se</a>
              </p>

              <footer class="login-footer">
                <span class="footer-line"></span>
                <p>O futuro pertence a quem ousa construí-lo</p>
                <span class="footer-line"></span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderRegisterPage() {
    return `
      <div class="register-alt-page">
        ${getRegisterDecoSvg()}

        <div class="register-alt-container">
          <div class="register-alt-brand">
            <button type="button" class="crown-trigger" data-crown="register" aria-label="Easter egg da coroa">
              <img class="register-alt-crown" src="coroa.svg" alt="Coroa" />
            </button>
            <div class="register-alt-divider">
              <span class="brand-divider-line"></span>
              <span class="brand-divider-dot"></span>
              <span class="brand-divider-line"></span>
            </div>
            <div class="register-alt-brand-text">
              <h1 class="register-alt-brand-title">Liz</h1>
              <p class="register-alt-tagline"><span class="phrase-carousel phrase-anim"></span></p>
            </div>
          </div>

          <div class="register-alt-form-side">
            <div class="register-alt-card">
              <div class="register-alt-card-header">
                <h2>Criar Conta</h2>
                <p>Preencha seus dados para começar</p>
              </div>

              <div class="form-alert" id="register-alert" role="alert" hidden></div>

              <form id="register-form" novalidate>
                <div class="register-alt-field" id="reg-name-field">
                  <label for="reg-name">Nome completo</label>
                  <div class="register-alt-input-wrapper">
                    <span class="register-alt-input-icon">${icons.user}</span>
                    <input id="reg-name" type="text" placeholder="Seu nome" />
                  </div>
                  <span class="register-alt-error-msg" id="reg-name-error"></span>
                </div>

                <div class="register-alt-field" id="reg-email-field">
                  <label for="reg-email">E-mail</label>
                  <div class="register-alt-input-wrapper">
                    <span class="register-alt-input-icon">${icons.email}</span>
                    <input id="reg-email" type="email" placeholder="seu@email.com" />
                  </div>
                  <span class="register-alt-error-msg" id="reg-email-error"></span>
                </div>

                <div class="register-alt-field" id="reg-password-field">
                  <label for="reg-password">Senha</label>
                  <div class="register-alt-input-wrapper">
                    <span class="register-alt-input-icon">${icons.lock}</span>
                    <input id="reg-password" type="password" placeholder="••••••••" />
                    <button type="button" class="register-alt-toggle-pw" data-toggle="reg-password" aria-label="Mostrar senha">
                      ${icons.eye}
                    </button>
                  </div>
                  <div class="register-alt-strength-meter" id="reg-strength-bar"></div>
                  <span class="register-alt-error-msg" id="reg-pw-error"></span>
                </div>

                <div class="register-alt-field" id="reg-confirm-field">
                  <label for="reg-confirm">Confirmar Senha</label>
                  <div class="register-alt-input-wrapper">
                    <span class="register-alt-input-icon">${icons.lock}</span>
                    <input id="reg-confirm" type="password" placeholder="••••••••" />
                    <button type="button" class="register-alt-toggle-pw" data-toggle="reg-confirm" aria-label="Mostrar confirmação de senha">
                      ${icons.eye}
                    </button>
                  </div>
                  <span class="register-alt-error-msg" id="reg-confirm-error"></span>
                </div>

                <div class="register-alt-terms-notice">
                  <p>
                    Ao criar minha conta eu concordo com os
                    <a href="#" class="register-alt-link" data-nav="terms">Termos de Uso</a>
                    e
                    <a href="#" class="register-alt-link" data-nav="privacy">Política de Privacidade</a>.
                  </p>
                </div>

                <button type="submit" class="register-alt-btn" id="btn-register">Criar Conta</button>
              </form>

              <div class="register-alt-divider-text">
                <span>ou cadastre-se com</span>
              </div>

              <div class="register-alt-social-buttons">
                <button class="register-alt-btn-social" type="button" data-social="google">
                  ${icons.google}
                  Google
                </button>
                <button class="register-alt-btn-social" type="button" data-social="github">
                  ${icons.github}
                  GitHub
                </button>
              </div>

              <p class="register-alt-login-text">
                Já tem uma conta? <a href="#" data-nav="login" class="nav-link">Entre agora</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderSuccessOverlay(type, userName) {
    // Nome vem do perfil Google/e-mail — escapa pra não virar HTML (XSS)
    const safeName = String(userName || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    const crown = `
      <div class="success-crown-slot" aria-hidden="true">
        <span class="success-mote mote-1"></span>
        <span class="success-mote mote-2"></span>
        <span class="success-mote mote-3"></span>
        <img class="success-crown" src="coroa.svg" alt="" />
      </div>
    `
    const ornament = `
      <div class="success-ornament" aria-hidden="true"><i></i><span class="gem"></span><i></i></div>
    `
    const arrow = `
      <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
    `
    if (type === 'login') {
      return `
        <div class="success-overlay" role="status" aria-live="polite">
          <div class="success-scene">
            ${crown}
            <p class="success-eyebrow">Bem-vindo de volta</p>
            <h2 class="success-name">${safeName}</h2>
            ${ornament}
            <p class="success-line"><span class="success-dot" aria-hidden="true"></span><span class="success-phrase" data-phrases='["A corte estava à sua espera","O salão se ilumina com a sua chegada","O reino sentiu a sua falta","Suas conversas esperam por você"]'>A corte estava à sua espera</span></p>
            <button class="btn-continue" id="btn-continue-login">Continuar ${arrow}</button>
          </div>
        </div>
      `
    }
    return `
      <div class="success-overlay" role="status" aria-live="polite">
        <div class="success-scene">
          ${crown}
          <p class="success-eyebrow">Conta criada</p>
          <h2 class="success-name">${safeName}</h2>
          ${ornament}
          <p class="success-line"><span class="success-dot" aria-hidden="true"></span><span class="success-phrase" data-phrases='["Sua coroa está reservada — entre para assumi-la","A corte aguarda a sua apresentação","Um lugar à mesa já foi preparado"]'>Sua coroa está reservada — entre para assumi-la</span></p>
          <button class="btn-continue" id="btn-continue-register">Ir para o login ${arrow}</button>
        </div>
      </div>
    `
  }

  // Terms page (simplified text for readability)
  function renderTermsPage() {
    return `
      <div class="legal-page-container">
        <div class="legal-page-header">
          <button id="legal-back" class="legal-page-back-button">← Voltar</button>
          <h1 class="legal-page-title">LIZ AI BRASIL</h1>
          <div class="legal-page-subtitle">
            <span>Termos de Uso</span>
            <span>Última atualização: 18 de maio de 2026</span>
          </div>
        </div>
        <div class="legal-page-content">
          <p>Bem-vindo à LIZ AI BRASIL. Estes Termos de Uso regem o acesso e uso da nossa plataforma de inteligência artificial. Ao usar nossos serviços, você concorda com estes termos. Leia com atenção.</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar ou usar a plataforma LIZ AI BRASIL ("Serviço", "Plataforma", "nós", "nosso"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não use nossos serviços.</p>

          <h2>2. Descrição do Serviço</h2>
          <p>A LIZ AI BRASIL é uma plataforma de inteligência artificial que oferece:</p>
          <ul>
            <li>Assistente de IA conversacional para responder perguntas, auxiliar em tarefas e fornecer informações</li>
            <li>Geração de código e assistência em programação</li>
            <li>Análise de documentos e processamento de texto</li>
            <li>Geração de imagens através de modelos de IA</li>
            <li>Integração via API e CLI para desenvolvedores</li>
          </ul>

          <h2>3. Elegibilidade</h2>
          <p>Você deve ter pelo menos 18 anos de idade para usar nossos serviços.</p>

          <h2>4. Conta de Usuário</h2>
          <p>Para acessar certos recursos, você precisa criar uma conta fornecendo informações precisas e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>

          <h2>5. Uso Aceitável</h2>
          <p>Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido usar o serviço para atividades ilegais, gerar conteúdo prejudicial, violar direitos de terceiros, ou abusar do sistema.</p>

          <h2>6. Planos e Pagamentos</h2>
          <p>Oferecemos diferentes planos de assinatura: Gratuito (300 mensagens/mês), Pro (2.400 mensagens/mês), Max (5.000 mensagens/mês) e Ultra (12.000 mensagens/mês). Os pagamentos são processados através do Cakto.</p>

          <h2>7. Propriedade Intelectual</h2>
          <p>A LIZ AI BRASIL, incluindo código, design, marca e logotipos, é propriedade da Lux Games Studios. Você mantém os direitos sobre o conteúdo que cria usando nossa plataforma.</p>

          <h2>8. Limitações de Responsabilidade</h2>
          <p>Os modelos de inteligência artificial podem gerar informações imprecisas. Sempre verifique informações críticas com fontes especializadas. O serviço é fornecido "COMO ESTÁ".</p>

          <h2>9. Privacidade</h2>
          <p>Sua privacidade é importante para nós. Consulte nossa Política de Privacidade para entender como coletamos, usamos e protegemos seus dados.</p>

          <h2>10. Contato</h2>
          <p>Se você tiver dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail: studiosluxgames@gmail.com</p>
          <p>© 2026 LIZ AI BRASIL — Lux Games Studios. Todos os direitos reservados.</p>

          <div class="legal-page-footer-links">
            <button type="button" data-nav="terms">Termos de Uso</button>
            <span>·</span>
            <button type="button" data-nav="privacy">Política de Privacidade</button>
          </div>
        </div>
      </div>
    `
  }

  function renderForgotPasswordPage() {
    return `
      <div class="forgot-page">
        ${getRegisterDecoSvg()}

        <div class="forgot-container">
          <div class="forgot-brand">
            <button type="button" class="crown-trigger" data-crown="forgot" aria-label="Easter egg da coroa">
              <img class="register-alt-crown" src="coroa.svg" alt="Coroa" />
            </button>
            <div class="register-alt-divider">
              <span class="brand-divider-line"></span>
              <span class="brand-divider-dot"></span>
              <span class="brand-divider-line"></span>
            </div>
            <div class="register-alt-brand-text">
              <h1 class="register-alt-brand-title">Liz</h1>
              <p class="register-alt-tagline"><span class="phrase-carousel phrase-anim"></span></p>
            </div>
          </div>

          <div class="forgot-form-side">
            <div class="forgot-card">
              <div class="forgot-card-header">
                <h2>Recuperar Senha</h2>
                <p>Digite seu e-mail para receber o link de recuperação</p>
              </div>

              <div class="form-alert" id="forgot-alert" role="alert" hidden></div>

              <form id="forgot-form" novalidate>
                <div class="forgot-field" id="forgot-email-field">
                  <label for="forgot-email">E-mail</label>
                  <div class="forgot-input-wrapper">
                    <span class="forgot-input-icon">${icons.email}</span>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      autocomplete="email"
                    />
                  </div>
                  <span class="forgot-error-msg" id="forgot-email-error"></span>
                </div>

                <button type="submit" class="forgot-btn" id="btn-forgot">Enviar Link</button>
              </form>

              <div class="forgot-back-link">
                <p><a href="#" data-nav="login">← Voltar ao login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderSuccessForgot() {
    return `
      <div class="success-overlay" role="status" aria-live="polite">
        <div class="success-scene">
          <div class="success-crown-slot" aria-hidden="true">
            <span class="success-mote mote-1"></span>
            <span class="success-mote mote-2"></span>
            <div class="success-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 7 9 6 9-6"/></svg>
            </div>
          </div>
          <p class="success-eyebrow">E-mail enviado</p>
          <h2 class="success-name">Verifique sua caixa</h2>
          <div class="success-ornament" aria-hidden="true"><i></i><span class="gem"></span><i></i></div>
          <p class="success-note">Enviamos as instruções para o seu e-mail. O link é temporário — redefina sua senha logo.</p>
          <button class="btn-continue" id="btn-back-login">Voltar ao login
            <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    `
  }

  function validateForgotField() {
    const emailInput = document.getElementById('forgot-email')
    const fieldEl = document.getElementById('forgot-email-field')
    const errorEl = document.getElementById('forgot-email-error')
    const val = emailInput.value

    fieldEl.classList.remove('has-error', 'is-valid')

    if (!val) {
      errorEl.textContent = ''
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'E-mail inválido'
    } else {
      fieldEl.classList.add('is-valid')
      errorEl.textContent = ''
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault()
    const emailInput = document.getElementById('forgot-email')
    const btnForgot = document.getElementById('btn-forgot')
    const fieldEl = document.getElementById('forgot-email-field')
    const errorEl = document.getElementById('forgot-email-error')

    // Validate
    if (!emailInput.value) {
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'E-mail obrigatório'
      return
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'E-mail inválido'
      return
    }

    // Loading
    btnForgot.disabled = true
    btnForgot.innerHTML = '<span class="register-alt-spinner"></span>'
    hideFormAlert('forgot-alert')

    try {
      if (!(await ensureFirebaseReady())) throw { code: 'firebase-not-configured' }

      await firebase.auth().sendPasswordResetEmail(emailInput.value.trim())

      btnForgot.disabled = false
      btnForgot.textContent = 'Enviar Link'

      // Show success
      const root = document.getElementById('root')
      const overlayDiv = document.createElement('div')
      overlayDiv.innerHTML = renderSuccessForgot()
      root.appendChild(overlayDiv.firstElementChild)

      document.getElementById('btn-back-login')?.addEventListener('click', () => {
        navigate('login')
      })
    } catch (err) {
      btnForgot.disabled = false
      btnForgot.textContent = 'Enviar Link'
      showFormAlert('forgot-alert',
        err.code === 'firebase-not-configured'
          ? FIREBASE_NOT_CONFIGURED_MSG
          : firebaseErrorMessage(err.code))
    }
  }

  function renderPrivacyPage() {
    return `
      <div class="legal-page-container">
        <div class="legal-page-header">
          <button id="legal-back" class="legal-page-back-button">← Voltar</button>
          <h1 class="legal-page-title">LIZ AI BRASIL</h1>
          <div class="legal-page-subtitle">
            <span>Política de Privacidade</span>
            <span>Última atualização: 18 de maio de 2026</span>
          </div>
        </div>
        <div class="legal-page-content">
          <p>Sua privacidade é nossa prioridade. Esta política descreve de forma transparente e clara quais dados coletamos, como os usamos, com quem compartilhamos e quais são seus direitos conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

          <p><strong>1. Quem Somos</strong><br>
          A LIZ AI BRASIL é uma plataforma de inteligência artificial operada pela Lux Games Studios.</p>

          <p><strong>2. Dados que Coletamos</strong><br>
          Coletamos dados fornecidos por você (e-mail, nome, senha criptografada, dados de pagamento) e dados coletados automaticamente (endereço IP, dados de uso, conversas com a IA).</p>

          <p><strong>3. Como Usamos Seus Dados</strong><br>
          Utilizamos seus dados exclusivamente para fornecer o serviço, autenticação, melhorias, segurança, comunicação, suporte e cumprimento legal. Não vendemos seus dados.</p>

          <p><strong>4. Compartilhamento de Dados</strong><br>
          Seus dados podem ser compartilhados com provedores de infraestrutura (Supabase, Cloudflare), provedores de IA e processamento de pagamento (Cakto). Não vendemos seus dados a terceiros.</p>

          <p><strong>5. Seus Direitos (LGPD)</strong><br>
          Você tem direito de acesso, correção, exclusão, portabilidade, revogação de consentimento e oposição. Para exercer seus direitos, entre em contato: studiosluxgames@gmail.com</p>

          <p><strong>6. Segurança</strong><br>
          Adotamos criptografia HTTPS/TLS, autenticação segura com bcrypt, rate limiting, monitoramento e backups criptografados.</p>

          <p><strong>7. Contato</strong><br>
          E-mail: studiosluxgames@gmail.com<br>
          Empresa: Lux Games Studios</p>
          <p>© 2026 LIZ AI BRASIL — Lux Games Studios. Todos os direitos reservados.</p>

          <div class="legal-page-footer-links">
            <button type="button" data-nav="terms">Termos de Uso</button>
            <span>·</span>
            <button type="button" data-nav="privacy">Política de Privacidade</button>
          </div>
        </div>
      </div>
    `
  }

  // ======================== MAIN RENDER ========================
  function renderActivePage() {
    const root = document.getElementById('root')
    let pageContent = ''
    switch (state.displayPage) {
      case 'login':
        pageContent = renderLoginPage()
        break
      case 'register':
        pageContent = renderRegisterPage()
        break
      case 'terms':
        pageContent = renderTermsPage()
        break
      case 'privacy':
        pageContent = renderPrivacyPage()
        break
      case 'forgot':
        pageContent = renderForgotPasswordPage()
        break
    }
    // Wrapper com id="page-wrapper" para as animações de transição de página funcionarem
    root.innerHTML = `<div id="page-wrapper" class="page-enter">${pageContent}</div>`

    // Start phrase carousel
    if (state.displayPage === 'login' || state.displayPage === 'register') {
      startPhraseCarousel(state.displayPage)
    }

    // Start crown floating animation after entrance animation completes
    setTimeout(() => {
      const crowns = document.querySelectorAll('.crown, .register-alt-crown')
      crowns.forEach(c => c.classList.add('is-floating'))
    }, 1200)

    // Bind events
    bindEvents()
  }

  // ======================== EVENT BINDING ========================
  function bindEvents() {
    // Navigation links
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        navigate(el.dataset.nav)
      })
    })

    // Legal back button
    const legalBack = document.getElementById('legal-back')
    if (legalBack) {
      legalBack.addEventListener('click', () => {
        navigate(state.prevPage || 'register')
      })
    }

    // Crown easter egg
    document.querySelectorAll('.crown-trigger').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        const container = el.parentElement
        toggleCrownSecret(container)
      })
    })

    // Password toggle
    document.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const inputId = el.dataset.toggle
        const input = document.getElementById(inputId)
        if (!input) return
        const isPassword = input.type === 'password'
        input.type = isPassword ? 'text' : 'password'
        el.innerHTML = isPassword ? icons.eyeOff : icons.eye
        el.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha')
      })
    })

    // Forgot link - navega para a tela de recuperação de senha
    const forgotLink = document.getElementById('forgot-link')
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault()
        navigate('forgot')
      })
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-form')
    if (forgotForm) {
      const forgotEmail = document.getElementById('forgot-email')
      forgotEmail.addEventListener('input', () => validateForgotField())
      forgotForm.addEventListener('submit', handleForgotSubmit)
    }

    // Social buttons (Firebase — Google / GitHub)
    document.querySelectorAll('[data-social]').forEach(el => {
      el.addEventListener('click', () => {
        const alertId = state.displayPage === 'register' ? 'register-alert' : 'login-alert'
        socialSignIn(el.dataset.social, alertId)
      })
    })

    // Login form
    const loginForm = document.getElementById('login-form')
    if (loginForm) {
      const emailInput = document.getElementById('login-email')
      const passwordInput = document.getElementById('login-password')

      // Real-time validation
      emailInput.addEventListener('input', () => validateLoginField('email'))
      passwordInput.addEventListener('input', () => {
        validateLoginField('password')
        updateLoginStrength()
      })

      loginForm.addEventListener('submit', handleLoginSubmit)
    }

    // Register form
    const registerForm = document.getElementById('register-form')
    if (registerForm) {
      const regName = document.getElementById('reg-name')
      const regEmail = document.getElementById('reg-email')
      const regPassword = document.getElementById('reg-password')
      const regConfirm = document.getElementById('reg-confirm')

      regName.addEventListener('input', () => validateRegisterField('name'))
      regEmail.addEventListener('input', () => validateRegisterField('email'))
      regPassword.addEventListener('input', () => {
        validateRegisterField('password')
        updateRegisterStrength()
      })
      regConfirm.addEventListener('input', () => validateRegisterField('confirm'))

      registerForm.addEventListener('submit', handleRegisterSubmit)
    }

    // Success overlay buttons
    const btnContinueLogin = document.getElementById('btn-continue-login')
    if (btnContinueLogin) {
      btnContinueLogin.addEventListener('click', () => {
        // Logado → vai pro app principal da Liz
        window.location.href = appUrl()
      })
    }

    const btnContinueRegister = document.getElementById('btn-continue-register')
    if (btnContinueRegister) {
      btnContinueRegister.addEventListener('click', () => {
        navigate('login')
      })
    }
  }

  // ======================== LOGIN VALIDATION ========================
  function validateLoginField(field) {
    const emailInput = document.getElementById('login-email')
    const passwordInput = document.getElementById('login-password')

    if (field === 'email') {
      const fieldEl = document.getElementById('login-email-field')
      const errorEl = document.getElementById('login-email-error')
      const val = emailInput.value

      fieldEl.classList.remove('has-error', 'is-valid')
      removeValidCheck(emailInput)

      if (!val) {
        errorEl.textContent = ''
      } else if (!/\S+@\S+\.\S+/.test(val)) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'E-mail inválido'
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
        addValidCheck(emailInput)
      }
    } else if (field === 'password') {
      const fieldEl = document.getElementById('login-password-field')
      const errorEl = document.getElementById('login-pw-error')
      const val = passwordInput.value

      fieldEl.classList.remove('has-error', 'is-valid')

      if (!val) {
        errorEl.textContent = ''
      } else if (val.length < 8) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'Mínimo de 8 caracteres'
      } else if (!/[\d\W_]/.test(val)) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'Inclua ao menos 1 número ou símbolo'
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
      }
    }
  }

  function updateLoginStrength() {
    const password = document.getElementById('login-password').value
    const meter = document.getElementById('login-strength')
    const { percent, color, label } = calculateStrength(password)

    if (!password) {
      meter.innerHTML = ''
      return
    }

    meter.innerHTML = `
      <div class="strength-bar-track">
        <div class="strength-bar-fill" style="width:${percent}%;background-color:${color}"></div>
      </div>
      <span class="strength-label" style="color:${color}">${label}</span>
    `
  }

  function addValidCheck(input) {
    const wrapper = input.closest('.input-wrapper') || input.closest('.register-alt-input-wrapper')
    if (!wrapper) return
    const existing = wrapper.querySelector('.valid-check, .register-alt-valid-check')
    if (existing) return
    const check = document.createElement('span')
    check.className = wrapper.classList.contains('register-alt-input-wrapper') ? 'register-alt-valid-check' : 'valid-check'
    check.setAttribute('aria-hidden', 'true')
    check.innerHTML = icons.check
    // Insert before toggle button if exists
    const toggle = wrapper.querySelector('.toggle-pw, .register-alt-toggle-pw')
    if (toggle) {
      wrapper.insertBefore(check, toggle)
    } else {
      wrapper.appendChild(check)
    }
  }

  function removeValidCheck(input) {
    const wrapper = input.closest('.input-wrapper') || input.closest('.register-alt-input-wrapper')
    if (!wrapper) return
    const check = wrapper.querySelector('.valid-check, .register-alt-valid-check')
    if (check) check.parentNode.removeChild(check)
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    const emailInput = document.getElementById('login-email')
    const passwordInput = document.getElementById('login-password')
    const btnLogin = document.getElementById('btn-login')

    // Validate all fields
    let hasError = false

    // Email
    const emailField = document.getElementById('login-email-field')
    const emailError = document.getElementById('login-email-error')
    if (!emailInput.value) {
      emailField.classList.add('has-error')
      emailError.textContent = 'E-mail obrigatório'
      hasError = true
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      emailField.classList.add('has-error')
      emailError.textContent = 'E-mail inválido'
      hasError = true
    }

    // Password
    const pwField = document.getElementById('login-password-field')
    const pwError = document.getElementById('login-pw-error')
    if (!passwordInput.value) {
      pwField.classList.add('has-error')
      pwError.textContent = 'Senha obrigatória'
      hasError = true
    } else if (passwordInput.value.length < 8) {
      pwField.classList.add('has-error')
      pwError.textContent = 'Mínimo de 8 caracteres'
      hasError = true
    } else if (!/[\d\W_]/.test(passwordInput.value)) {
      pwField.classList.add('has-error')
      pwError.textContent = 'Inclua ao menos 1 número ou símbolo'
      hasError = true
    }

    if (hasError) return

    // Loading state
    btnLogin.disabled = true
    btnLogin.innerHTML = '<span class="spinner"></span>'
    hideFormAlert('login-alert')

    try {
      if (!(await ensureFirebaseReady())) throw { code: 'firebase-not-configured' }

      // "Lembrar de mim" → LOCAL persiste entre reinícios do navegador,
      // SESSION mantém a sessão só enquanto a aba estiver aberta.
      const remember = document.getElementById('remember-me')?.checked ?? true
      await firebase.auth().setPersistence(
        remember
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION
      )

      const credential = await firebase.auth().signInWithEmailAndPassword(
        emailInput.value.trim(),
        passwordInput.value
      )

      btnLogin.disabled = false
      btnLogin.textContent = 'Entrar'

      const user = credential.user
      await saveUserToFirestore(user, 'password')
      const rawName = user.displayName || emailInput.value.trim().split('@')[0]
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
      presentLoginSuccess(displayName)
    } catch (err) {
      console.error('[Liz] erro no login:', err)
      btnLogin.disabled = false
      btnLogin.textContent = 'Entrar'
      showFormAlert('login-alert',
        err.code === 'firebase-not-configured'
          ? FIREBASE_NOT_CONFIGURED_MSG
          : firebaseErrorMessage(err.code))
    }
  }

  // ======================== REGISTER VALIDATION ========================
  function validateRegisterField(field) {
    const nameInput = document.getElementById('reg-name')
    const emailInput = document.getElementById('reg-email')
    const passwordInput = document.getElementById('reg-password')
    const confirmInput = document.getElementById('reg-confirm')

    if (field === 'name') {
      const fieldEl = document.getElementById('reg-name-field')
      const errorEl = document.getElementById('reg-name-error')
      fieldEl.classList.remove('has-error', 'is-valid')
      removeValidCheck(nameInput)
      if (!nameInput.value) {
        errorEl.textContent = ''
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
        addValidCheck(nameInput)
      }
    } else if (field === 'email') {
      const fieldEl = document.getElementById('reg-email-field')
      const errorEl = document.getElementById('reg-email-error')
      fieldEl.classList.remove('has-error', 'is-valid')
      removeValidCheck(emailInput)
      if (!emailInput.value) {
        errorEl.textContent = ''
      } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'E-mail inválido'
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
        addValidCheck(emailInput)
      }
    } else if (field === 'password') {
      const fieldEl = document.getElementById('reg-password-field')
      const errorEl = document.getElementById('reg-pw-error')
      fieldEl.classList.remove('has-error', 'is-valid')
      removeValidCheck(passwordInput)
      if (!passwordInput.value) {
        errorEl.textContent = ''
      } else if (passwordInput.value.length < 8) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'Mínimo de 8 caracteres'
      } else if (!/[\d\W_]/.test(passwordInput.value)) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'Inclua ao menos 1 número ou símbolo'
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
        addValidCheck(passwordInput)

        // Re-validate confirm if it has value
        if (confirmInput.value) validateRegisterField('confirm')
      }
    } else if (field === 'confirm') {
      const fieldEl = document.getElementById('reg-confirm-field')
      const errorEl = document.getElementById('reg-confirm-error')
      fieldEl.classList.remove('has-error', 'is-valid')
      removeValidCheck(confirmInput)
      if (!confirmInput.value) {
        errorEl.textContent = ''
      } else if (confirmInput.value !== passwordInput.value) {
        fieldEl.classList.add('has-error')
        errorEl.textContent = 'As senhas não coincidem'
      } else {
        fieldEl.classList.add('is-valid')
        errorEl.textContent = ''
        addValidCheck(confirmInput)
      }
    }
  }

  function updateRegisterStrength() {
    const password = document.getElementById('reg-password').value
    const bar = document.getElementById('reg-strength-bar')
    const { percent, color } = calculateStrength(password)

    if (!password) {
      bar.innerHTML = ''
      return
    }

    bar.innerHTML = `<div class="register-alt-strength-bar" style="width:${percent}%;background-color:${color}"></div>`
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    const nameInput = document.getElementById('reg-name')
    const emailInput = document.getElementById('reg-email')
    const passwordInput = document.getElementById('reg-password')
    const confirmInput = document.getElementById('reg-confirm')
    const btnRegister = document.getElementById('btn-register')

    let hasError = false

    // Validate all fields with full messages
    if (!nameInput.value) {
      const fieldEl = document.getElementById('reg-name-field')
      const errorEl = document.getElementById('reg-name-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'Nome obrigatório'
      hasError = true
    }

    if (!emailInput.value) {
      const fieldEl = document.getElementById('reg-email-field')
      const errorEl = document.getElementById('reg-email-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'E-mail obrigatório'
      hasError = true
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      const fieldEl = document.getElementById('reg-email-field')
      const errorEl = document.getElementById('reg-email-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'E-mail inválido'
      hasError = true
    }

    if (!passwordInput.value) {
      const fieldEl = document.getElementById('reg-password-field')
      const errorEl = document.getElementById('reg-pw-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'Senha obrigatória'
      hasError = true
    } else if (passwordInput.value.length < 8) {
      const fieldEl = document.getElementById('reg-password-field')
      const errorEl = document.getElementById('reg-pw-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'Mínimo de 8 caracteres'
      hasError = true
    } else if (!/[\d\W_]/.test(passwordInput.value)) {
      const fieldEl = document.getElementById('reg-password-field')
      const errorEl = document.getElementById('reg-pw-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'Inclua ao menos 1 número ou símbolo'
      hasError = true
    }

    if (!confirmInput.value) {
      const fieldEl = document.getElementById('reg-confirm-field')
      const errorEl = document.getElementById('reg-confirm-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'Confirmação obrigatória'
      hasError = true
    } else if (confirmInput.value !== passwordInput.value) {
      const fieldEl = document.getElementById('reg-confirm-field')
      const errorEl = document.getElementById('reg-confirm-error')
      fieldEl.classList.add('has-error')
      errorEl.textContent = 'As senhas não coincidem'
      hasError = true
    }

    if (hasError) return

    // Loading state
    btnRegister.disabled = true
    btnRegister.innerHTML = '<span class="register-alt-spinner"></span>'
    hideFormAlert('register-alert')

    try {
      if (!(await ensureFirebaseReady())) throw { code: 'firebase-not-configured' }

      // A conta é criada pelo BACKEND (POST /api/auth/signup): assim a
      // política de senha (mínimo 8 caracteres + número ou símbolo) vale
      // no servidor, não só neste JavaScript. O displayName já vai junto.
      const signupRes = await fetch(window.LIZ_API_BASE_URL + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value,
        }),
      })
      if (!signupRes.ok) {
        const errBody = await signupRes.json().catch(() => ({}))
        if (signupRes.status === 409) throw { code: 'auth/email-already-in-use' }
        throw {
          code: 'signup-failed',
          message: errBody.message || 'Não foi possível criar a conta. Tente novamente',
        }
      }

      // Usuário criado — agora autentica no navegador e salva o perfil
      // no banco (users/{uid}; as rules garantem acesso só ao dono).
      const credential = await firebase.auth().signInWithEmailAndPassword(
        emailInput.value.trim(),
        passwordInput.value
      )
      await saveUserToFirestore(credential.user, 'password')

      btnRegister.disabled = false
      btnRegister.textContent = 'Criar Conta'

      const displayName = nameInput.value.trim().split(' ')[0]

      // Show success overlay
      const root = document.getElementById('root')
      const overlayDiv = document.createElement('div')
      overlayDiv.innerHTML = renderSuccessOverlay('register', displayName)
      root.appendChild(overlayDiv.firstElementChild)
      startPhraseCycle(root)

      const btnContinue = document.getElementById('btn-continue-register')
      if (btnContinue) {
        btnContinue.addEventListener('click', () => {
          navigate('login')
        })
      }
    } catch (err) {
      console.error('[Liz] erro no cadastro:', err)
      btnRegister.disabled = false
      btnRegister.textContent = 'Criar Conta'
      showFormAlert('register-alert',
        err.code === 'firebase-not-configured'
          ? FIREBASE_NOT_CONFIGURED_MSG
          : err.code === 'signup-failed'
            ? err.message
            : firebaseErrorMessage(err.code))
    }
  }

  // ======================== THEME TOGGLE EVENT ========================
  // The theme toggle button is outside the SPA root, so we bind it once here
  document.getElementById('theme-toggle-btn')?.addEventListener('click', (e) => {
    toggleTheme(e)
  })

  // ======================== INIT ========================
  // Apply initial theme
  document.documentElement.setAttribute('data-theme', state.theme)

  // Sync the toggle icon with the initial theme
  updateThemeToggleIcon()

  // Render initial page
  renderActivePage()

  // Conclui login que voltou de um signInWithRedirect (Brave/sem popup)
  handleRedirectResult()

  // Conclui login que voltou do fluxo direto do Google (#id_token=...)
  handleManualGoogleReturn()

  // Set initial thumb position
  setTimeout(() => {
    applyThumbPos(state.theme === 'light' ? 1 : 0)
    // Also update the aria-label to match the initial theme
    const btn = document.getElementById('theme-toggle-btn')
    if (btn) {
      btn.setAttribute('aria-label', state.theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro')
      btn.setAttribute('title', state.theme === 'dark' ? 'Modo claro' : 'Modo escuro')
    }
  }, 50)

  // Expose navigate for global use (if needed)
  window.__navigate = navigate
})
