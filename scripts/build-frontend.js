/* ============================================================
 *  Liz — build do frontend para a nuvem (Render Static Site)
 *  Layout publicado:
 *    /        → tela de login (conteúdo de tela-login-html)
 *    /chat/   → app principal do chat
 *  Deixa de fora backend, testes e afins (nada sensível vai pro ar).
 *  Uso: node scripts/build-frontend.js
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

// Garante saída limpa
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1) Login na raiz (tudo que está em tela-login-html)
fs.cpSync(path.join(ROOT, 'tela-login-html'), OUT, { recursive: true });
console.log('[build] raiz: tela de login (/)');

// 2) App principal em /chat
const APP = path.join(OUT, 'chat');
fs.mkdirSync(APP, { recursive: true });
for (const f of ['index.html', 'manifest.json', 'sw.js', 'coroa.svg']) {
  fs.copyFileSync(path.join(ROOT, f), path.join(APP, f));
}
for (const d of ['css', 'js', 'mobile']) {
  fs.cpSync(path.join(ROOT, d), path.join(APP, d), { recursive: true });
}
console.log('[build] /chat: chat principal');

console.log('[build] pronto ->', OUT);
