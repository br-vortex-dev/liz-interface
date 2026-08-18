/* ============================================================
 * Servidor estático mínimo para desenvolvimento.
 * Uso: node frontend/scripts/serve.js   (porta padrão 8321, env PORT)
 * ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT ? Number(process.env.PORT) : (process.argv[2] ? Number(process.argv[2]) : 8321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

// Cabeçalhos de segurança (paridade com a produção; em dev ficam mais
// brandos — sem CSP rígida — pra não bloquear o backend local).
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Segurança: nunca servir arquivos fora da raiz do projeto
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // Dados do backend, testes e dotfiles nunca são servidos
  const firstSeg = urlPath.split('/')[1] || '';
  if (firstSeg === 'backend' || firstSeg === 'tests' || firstSeg.startsWith('.')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('Liz Chat dev: http://localhost:' + PORT);
});
