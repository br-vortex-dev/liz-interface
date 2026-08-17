/* ============================================================
 *  Liz — build do frontend para o Render (Static Site)
 *  Copia SOMENTE os arquivos públicos para ./public, deixando
 *  de fora backend, testes e afins (nada sensível vai pro ar).
 *  Uso: node scripts/build-frontend.js
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

// Arquivos e pastas públicas (na raiz do projeto)
const FILES = ['index.html', 'manifest.json', 'sw.js', 'coroa.svg'];
const DIRS = ['css', 'js', 'mobile', 'tela-login-html'];

// Garante saída limpa
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of FILES) {
  fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  console.log('[build] arquivo:', f);
}

for (const d of DIRS) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
  console.log('[build] pasta:', d + '/');
}

console.log('[build] pronto ->', OUT);
