/* ============================================================
 *  Orquestrador de dev — sobe frontend estático (8321) e
 *  backend API (3000) num único processo.
 *  Uso: node tests/dev-all.js
 * ============================================================ */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const children = [
  { name: 'frontend', script: path.join(__dirname, 'serve.js'), env: { PORT: '8321' } },
  { name: 'backend', script: path.join(ROOT, 'backend', 'server.js'), env: { PORT: '3000' } },
];

children.forEach(({ name, script, env }) => {
  const child = spawn(process.execPath, [script], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    console.log(`[dev-all] ${name} encerrou (code ${code})`);
  });
});

console.log('[dev-all] frontend: http://localhost:8321 | backend: http://localhost:3000/api/health');

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
