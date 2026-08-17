/* ============================================================
   CONFIGURAÇÃO DO FIREBASE — carregada do backend (.env)
   ------------------------------------------------------------
   As chaves NÃO ficam no frontend. Elas moram no arquivo
   backend/.env (variáveis FIREBASE_*) e o backend as serve
   pelo endpoint GET /api/firebase-config.

   Como configurar:
   1. Acesse https://console.firebase.google.com e crie/abra um projeto
   2. Configurações do projeto → Seus apps → adicione um app Web (</>)
   3. Copie os valores do firebaseConfig para o backend/.env
   4. Em Authentication → Sign-in method, ative:
      E-mail/senha, Google e GitHub (opcional)
   5. Suba o backend e abra a tela de login pelo backend:
      http://localhost:3001/tela-login-html/
   ============================================================ */

// Mesma regra do app principal (js/api.js → LizAPI.BASE_URL):
//   1. window.LIZ_API_BASE manda em tudo (se definida antes deste arquivo)
//   2. Na nuvem (Render): backend é o serviço "liz-api"
//   3. Local: backend de API na porta 3001 (o frontend roda separado na 8321)
const FIREBASE_CONFIG_URL = (function () {
  if (window.LIZ_API_BASE) return window.LIZ_API_BASE.replace(/\/+$/, '') + '/firebase-config'
  if (window.location.hostname.endsWith('.onrender.com')) {
    return 'https://liz-api.onrender.com/api/firebase-config'
  }
  return 'http://localhost:3001/api/firebase-config'
})()

// Indica se o Firebase está pronto para uso (config carregado com sucesso)
window.firebaseReady = false

// Promise que o app.js aguarda antes de qualquer operação de auth
window.firebaseConfigPromise = (async () => {
  try {
    if (typeof firebase === 'undefined') {
      throw new Error('SDK do Firebase não carregou (sem internet?)')
    }
    const res = await fetch(FIREBASE_CONFIG_URL)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `HTTP ${res.status}`)
    }
    const cfg = await res.json()
    window.firebaseConfig = cfg
    firebase.initializeApp(cfg)
    firebase.auth().languageCode = 'pt_BR' // e-mails de recuperação em português
    window.firebaseReady = true
  } catch (err) {
    console.warn('[Liz] Firebase indisponível:', err.message)
  }
})()
