/* ============================================================
 *  Frontend — test/frontend.test.js
 *  Testes de lógica pura (sem DOM real): rodam em Node com um
 *  sandbox que simula window/localStorage/document.
 *
 *  Cobertura (normal / borda / erro / integração):
 *   - data.js: newlines reais nas respostas, sem conversas fake,
 *     persistência por id, títulos duplicados, renameUploadedFile
 *   - ui-core.js: _esc (XSS), _markdown (bold, código, escape)
 *   - autoTitleFromMessages: normal, borda e erro
 *
 *  Rodar com: node --test test/frontend.test.js
 * ============================================================ */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function loadFrontend() {
  const store = {};
  const sandbox = {
    console,
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    matchMedia: () => ({ matches: false }),
  };
  sandbox.window = sandbox;
  sandbox.document = { addEventListener() {} };
  vm.createContext(sandbox);
  for (const f of ['js/config.js', 'js/data.js', 'js/ui-core.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
  }
  return sandbox.window;
}

/* ---------- 1. Respostas sem \n literal (bug histórico) ---------- */
test('respostas simuladas usam quebras de linha reais, nunca \\n literal', () => {
  const { LizData } = loadFrontend();
  const texts = [
    LizData.sampleMessages[1].content,
    ...Object.values(LizData.replies).flat(),
  ];
  const literalBsN = String.fromCharCode(92) + 'n'; // \n como texto
  for (const t of texts) {
    assert.ok(!t.includes(literalBsN), 'não pode conter \\n literal: ' + t.slice(0, 40));
  }
});

/* ---------- 2. Painel de conversas sem dados fictícios ---------- */
test('sem conversas salvas, getConversationGroups retorna vazio (zero fake)', () => {
  const { LizData } = loadFrontend();
  LizData.savedConversations = [];
  // length + JSON: arrays criadas em outro realm (vm) não passam deepStrictEqual
  assert.strictEqual(LizData.getConversationGroups().length, 0);
  assert.strictEqual(JSON.stringify(LizData.getConversationGroups()), '[]');
});

/* ---------- 3. Persistência por id (não por título) ---------- */
test('saveConversation atualiza pelo id sem duplicar', async () => {
  const { LizData } = loadFrontend();
  const id1 = await LizData.saveConversation('Título A', [{ role: 'user', content: 'oi', time: '10:00' }]);
  assert.ok(id1, 'deve retornar o id criado');

  const id2 = await LizData.saveConversation('Título A', [
    { role: 'user', content: 'oi', time: '10:00' },
    { role: 'liz', content: 'olá!', time: '10:01' },
  ], id1);

  assert.strictEqual(id1, id2, 'mesmo id na atualização');
  assert.strictEqual(LizData.savedConversations.length, 1, 'nada de duplicata');
  assert.strictEqual(LizData.savedConversations[0].messages.length, 2);
});

test('duas conversas com o MESMO título não colidem', async () => {
  const { LizData } = loadFrontend();
  const a = await LizData.saveConversation('Repetido', [{ role: 'user', content: '1', time: '10:00' }]);
  const b = await LizData.saveConversation('Repetido', [{ role: 'user', content: '2', time: '10:05' }]);
  assert.notStrictEqual(a, b);
  assert.strictEqual(LizData.savedConversations.length, 2);
  assert.strictEqual(LizData.getConversationById(a).messages[0].content, '1');
  assert.strictEqual(LizData.getConversationById(b).messages[0].content, '2');
});

/* ---------- 4. renameUploadedFile: normal / borda / erro ---------- */
test('renameUploadedFile: caminho normal, nome vazio e id inexistente', () => {
  const { LizData } = loadFrontend();
  LizData.saveUploadedFile({ name: 'foto.png', size: 10, type: 'image/png', dataUrl: 'data:,' });
  const id = LizData.uploadedFiles[0].id;

  assert.strictEqual(LizData.renameUploadedFile(id, 'nova.png'), true);
  assert.strictEqual(LizData.uploadedFiles[0].name, 'nova.png');

  assert.strictEqual(LizData.renameUploadedFile(id, '   '), false, 'nome vazio rejeita');
  assert.strictEqual(LizData.renameUploadedFile('id-que-nao-existe', 'x.png'), false);
});

/* ---------- 5. _esc bloqueia injeção de HTML ---------- */
test('_esc escapa os 5 caracteres perigosos (anti-XSS)', () => {
  const { LizUI } = loadFrontend();
  const out = LizUI._esc('<img src=x onerror="alert(1)">&\'');
  assert.ok(!out.includes('<'), 'nenhum < passa');
  assert.ok(!out.includes('>'), 'nenhum > passa');
  assert.ok(out.includes('&lt;img'));
  assert.ok(out.includes('&quot;'));
  assert.ok(out.includes('&#39;'));
});

/* ---------- 6. _markdown: negrito, bloco de código, escape ---------- */
test('_markdown renderiza bold, code block com header e escapa script', () => {
  const { LizUI } = loadFrontend();

  const bold = LizUI._markdown('isso é **importante**');
  assert.ok(bold.includes('<strong>importante</strong>'));

  const code = LizUI._markdown('olha:\n```js\nconst x = 1;\n```');
  assert.ok(code.includes('code-block'), 'bloco de código renderiza');
  assert.ok(code.includes('code-block-lang'), 'com etiqueta de linguagem');
  assert.ok(code.includes('data-copy-code'), 'com botão copiar');

  const xss = LizUI._markdown('<script>alert(1)</script>');
  assert.ok(!xss.includes('<script>'), 'script nunca vira HTML real');

  const br = LizUI._markdown('linha1\nlinha2');
  assert.ok(br.includes('linha1<br>linha2'), 'newline vira <br>');
});

/* ---------- 7. autoTitleFromMessages: normal / borda / erro ---------- */
test('autoTitleFromMessages: normal, entrada inválida, corte e código removido', () => {
  const { LizData } = loadFrontend();

  const normal = LizData.autoTitleFromMessages([
    { role: 'liz', content: 'resposta antes' },
    { role: 'user', content: '  Crie   um plano  ' },
  ]);
  assert.strictEqual(normal, 'Crie um plano');

  assert.strictEqual(LizData.autoTitleFromMessages(null), '', 'null → vazio');
  assert.strictEqual(LizData.autoTitleFromMessages([{ role: 'liz', content: 'x' }]), '', 'sem user → vazio');

  const longo = LizData.autoTitleFromMessages([{ role: 'user', content: 'a'.repeat(80) }]);
  assert.ok(longo.length <= 49, 'corta no limite');
  assert.ok(longo.endsWith('…'));

  const comCodigo = LizData.autoTitleFromMessages([{ role: 'user', content: 'conserta ```js\nxxx\n``` agora' }]);
  assert.strictEqual(comCodigo, 'conserta agora');
});
