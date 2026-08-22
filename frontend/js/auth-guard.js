/* ============================================================
 *  Liz — auth-guard.js
 *  Protege as páginas do chat: quem abre /chat/ (ou /chat/mobile/)
 *  sem sessão ativa no Firebase é redirecionado para a tela de
 *  login. Carregar SEMPRE depois do firebase-config.js.
 *
 *  Enquanto a sessão não é confirmada, o <html> mantém a classe
 *  "liz-auth-gate" (esconde o app e mostra o aviso de verificação).
 * ============================================================ */
(function () {
  // Convenção de rotas (espelho do appUrl() do app.js):
  //   nuvem → login na raiz, app em /chat/ (mobile em /chat/mobile/)
  //   local (serve.js) → app na raiz, login em /tela-login-html/
  function loginUrl() {
    var path = window.location.pathname;
    if (path.indexOf('/chat/mobile') === 0) return '../../index.html';
    if (path.indexOf('/chat') === 0) return '../index.html';
    if (path.indexOf('/mobile') === 0) return '../tela-login-html/index.html';
    return 'tela-login-html/index.html';
  }

  var authReadyResolve;
  window.lizAuthReadyPromise = new Promise(function (resolve) {
    authReadyResolve = resolve;
  });

  function goLogin() {
    if (authReadyResolve) authReadyResolve(false);
    window.lizAuthReady = false;
    window.location.replace(loginUrl());
  }

  function unlock() {
    document.documentElement.classList.remove('liz-auth-gate');
    window.lizAuthReady = true;
    if (authReadyResolve) authReadyResolve(true);
  }

  // O firebase-config.js busca as chaves no backend e inicializa o SDK;
  // só depois disso dá pra perguntar quem está logado.
  var configPromise = window.firebaseConfigPromise || Promise.resolve();

  configPromise
    .then(function () {
      // Sem SDK/config não tem como validar sessão → manda pro login.
      if (!window.firebaseReady || typeof firebase === 'undefined' || !firebase.auth) {
        goLogin();
        return;
      }
      firebase.auth().onAuthStateChanged(
        function (user) {
          if (user) unlock();
          else goLogin();
        },
        function () {
          goLogin();
        }
      );
    })
    .catch(function () {
      goLogin();
    });

  // Segurança extra: se em 10s a sessão não for confirmada, derruba
  // pro login (ex.: rede travada carregando o SDK/config).
  setTimeout(function () {
    if (document.documentElement.classList.contains('liz-auth-gate')) goLogin();
  }, 10000);
})();
