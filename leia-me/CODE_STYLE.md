# 📐 Liz — Guia de Estilo (Code Style)

Este documento define os padrões de código do projeto **Liz**. Siga estas convenções para manter consistência entre os dois projetos: Chat (Vanilla JS) e Tela de Login (Vanilla JS).

---

## 📁 1. Nomeação de Arquivos

### Chat (Vanilla JS)

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| JavaScript | `lowercase.js` | `config.js`, `data.js`, `ui-core.js`, `chat.js` |
| CSS | `lowercase.css` | `base.css`, `chat.css`, `settings.css` |
| HTML | `lowercase.html` | `index.html` |
| SVG | `lowercase.svg` | `coroa.svg` |
| Markdown | `UPPERCASE.md` | `ARCHITECTURE.md`, `CODE_STYLE.md` |

### Tela de Login (Vanilla JS)

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| JavaScript | `lowercase.js` | `app.js` |
| CSS | `lowercase.css` | `style.css` |
| HTML | `lowercase.html` | `index.html` |
| SVG | `lowercase.svg` | `coroa.svg` |

### Regras gerais

- **Não** use caracteres especiais, acentos ou espaços em nomes de arquivo.
- Use `lowercase` para todos os arquivos (JS, CSS, HTML, SVG).

---

## 🧱 2. Como Criar Componentes

### Login (Vanilla JS)

Use **funções modulares** no padrão de módulo com objeto único:

```js
// ✅ Correto: funções agrupadas em objeto
const App = {
  state: {
    page: 'login',
    theme: 'dark',
    // ...
  },

  init() {
    this._bindEvents()
    this.renderActivePage()
    // ...
  },

  // Métodos privados com prefixo _
  _handleSubmit(e) {
    e.preventDefault()
    // ...
  },

  renderActivePage() {
    // render via innerHTML
  },
}

document.addEventListener('DOMContentLoaded', () => App.init())
```

```js
// ❌ Evitar (funções soltas, variáveis globais múltiplas)
let someGlobal = ''
function doSomething() { }
```

**Estrutura do arquivo app.js:**

1. **Constantes** (ícones SVG, textos, configurações)
2. **Estado** (state object)
3. **Funções de tema** (getInitialTheme, applyTheme, toggleTheme)
4. **Funções de navegação** (navigate, renderActivePage)
5. **Funções de renderização** (renderLoginPage, renderRegisterPage, etc.)
6. **Validação** (validateLoginField, validateRegisterField, etc.)
7. **Event binding** (bindEvents)
8. **Handlers** (handleLoginSubmit, handleRegisterSubmit, etc.)
9. **Inicialização** (DOMContentLoaded)

### Vanilla JS (Chat)

Use o **padrão de módulo** com objeto único exportado globalmente:

```js
// ✅ Correto
const LizUI = {
  el: {},

  init() {
    // ...
  },

  renderBrand() {
    // ...
  },

  _privateMethod() {
    // ...
  },
}

window.LizUI = LizUI
```

```js
// ❌ Evitar (funções soltas, variáveis globais múltiplas)
let someGlobal = ''
function doSomething() { }
```

---

## 📦 3. Como Organizar Imports

### JavaScript Vanilla

Scripts são carregados no HTML em ordem. A ordem importa:

```html
<script src="js/config.js"></script>      <!-- 1º: constantes e ícones -->
<script src="js/data.js"></script>        <!-- 2º: dados e localStorage -->
<script src="js/ui-core.js"></script>     <!-- 3º: objeto base LizUI -->
<script src="js/ui-chat.js"></script>     <!-- 4º: mensagens e chat -->
<script src="js/ui-panels.js"></script>   <!-- 5º: painéis e tema -->
<script src="js/ui-gallery.js"></script>  <!-- 6º: galeria e upload -->
<script src="js/ui-projects.js"></script> <!-- 7º: projetos -->
<script src="js/settings.js"></script>    <!-- 8º: ajustes -->
<script src="js/chat.js"></script>        <!-- 9º: orquestração -->
```

### Login (Vanilla JS)

Scripts são carregados no HTML em ordem. O app.js é o único script da tela de login:

```html
<script src="js/app.js"></script>
```

O app.js contém tudo: estado, renderização, validação, eventos e handlers em um único arquivo organizado por seções.

---

## ✍️ 4. Como Escrever Funções

### Vanilla JS

**Métodos no objeto módulo:**

```js
const LizChat = {
  // Métodos públicos: verbo + substantivo, camelCase
  sendMessage() {
    if (!text) return   // guard clause no início
    // ...
  },

  newConversation() {
    // ...
  },

  // Métodos "privados" (convenção): prefixo _
  _saveCurrentConversation() {
    // ...
  },

  // Async com async/await
  async _simulateReply(userText) {
    LizUI.showTyping()
    await this._delay(850)
    LizUI.removeTyping()
    // ...
  },

  // Promises explícitas para delays
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },
}
```

**Callbacks e closures:**

```js
// ✅ Arrow function para callback
el.form.addEventListener('submit', (e) => {
  e.preventDefault()
  this.sendMessage()
})

// ✅ Função nomeada para handler reutilizável (em caso raro)
const save = () => {
  const newText = textarea.value.trim()
  if (newText && newText !== originalText) {
    LizChat.editMessage(msgIndex, newText)
  }
}
```

**Guarda (early return) sempre no início:**

```js
// ✅ Correto
sendMessage() {
  const { el } = LizUI
  const text = el.input.value.trim()
  if (!text) return  // ← guarda logo no início

  // ... resto da função
}
```

### Login (Vanilla JS)

**Handlers de evento:**

```js
const handleLoginSubmit = async (e) => {
  e.preventDefault()
  if (!validate()) return
  btnLogin.disabled = true
  btnLogin.innerHTML = '<span class="spinner"></span>'
  // ...
}

const handleInputChange = () => {
  validateLoginField('email')
  validateLoginField('password')
}
```

### Regras gerais

- Nomes de função devem ser **verbos** ou **verbos + substantivo**: `sendMessage()`, `renderBrand()`, `toggleTools()`, `validate()`.
- Use **early return** para casos de borda.
- Prefira **async/await** sobre `.then()`.
- Funções puras (sem efeito colateral) são preferíveis.
- Mantenha funções pequenas e com **única responsabilidade**.

---

## 🪝 5. Gerenciamento de Estado

### Vanilla JS (Chat e Login)

Use **objetos de estado** para gerenciar dados da aplicação:

```js
// ✅ Correto: estado centralizado em objeto
const state = {
  page: 'login',
  theme: 'dark',
  themeSource: 'system',
  isTransitioning: false,
  messages: [],
}
```

```js
// ✅ Para persistência, use localStorage com try/catch
saveState() {
  try {
    localStorage.setItem('liz-state', JSON.stringify(this.state))
  } catch (e) {
    console.warn('Erro ao salvar estado:', e)
  }
}
```

### Funções de estado

- Use **variáveis de módulo** para estado global (no Chat: `LizChat.messages`, `LizUI.activePanel`)
- Use **objetos** para estado complexo (no Login: `App.state`)
- Evite **variáveis globais soltas** — agrupe em objetos namespaced
- Para estado que precisa de reatividade, manipule o DOM diretamente

## 🛡️ 6. Como Tratar Erros

### Validação de formulário

Sempre com **validação em tempo real** (no `input`) + **validação no submit`**:

```js
// ✅ Validação em tempo real (no evento input)
function validateLoginField(field) {
  const fieldEl = document.getElementById('login-email-field')
  const errorEl = document.getElementById('login-email-error')
  const val = document.getElementById('login-email').value

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

// ✅ Validação completa no submit
function validate() {
  let hasError = false
  if (!emailInput.value) {
    fieldEl.classList.add('has-error')
    errorEl.textContent = 'E-mail obrigatório'
    hasError = true
  }
  return !hasError
}
```

### Feedback visual

Use **classes CSS** para estados de erro/validação:

```html
<div class="field has-error">
  <input aria-invalid="true" />
  <span class="error-msg" role="alert">E-mail inválido</span>
</div>
```

```css
.field.has-error input {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}
.field.is-valid input {
  border-color: rgba(139, 92, 246, 0.35);
}
```

### Tratamento no Vanilla JS

- **Toast** para feedback não-crítico:
```js
// ✅ Usar LizChat.toast() para mensagens rápidas
this.toast('Arquivo muito grande (máx. 10 MB): ' + file.name)
```

- **Guardas** para casos de borda:
```js
if (!content) return
if (!galleryBody) return
if (this._galleryDragInited) return
if (this.introStage !== 'moving') return
```

- **localStorage** com try/catch:
```js
try {
  const raw = localStorage.getItem(this.STORAGE_KEY)
  this.savedConversations = raw ? JSON.parse(raw) : []
} catch (e) {
  console.warn('Erro ao carregar conversas salvas:', e)
  this.savedConversations = []
}
```

- **Fallback para QuotaExceededError**:
```js
try {
  localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles))
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    this.uploadedFiles.pop() // remove o mais antigo
    localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(this.uploadedFiles))
  }
}
```

- **Null checks** para elementos DOM:
```js
const panel = this.el.panels[name]
if (!panel) return
```

---

## 💬 7. Como Escrever Comentários

### Blocos de seção

Use `/* ===== */` para dividir arquivos grandes em seções visíveis:

```js
/* ============================================================
 *  Liz Chat — ui-core.js
 *  Tudo que mexe no DOM: coroa da marca, tela inicial,
 *  sugestões, mensagens, pílula ativa do menu, painéis e tema.
 * ============================================================ */
```

```css
/* ============================================================
   MENU FLUTUANTE — lateral esquerda (ilhas de vidro)
   ============================================================ */
```

### Comentários de método

Use `/** ... */` para descrever métodos importantes:

```js
/** Render dinâmico do conteúdo de cada painel (dados simulados). */
renderPanels() {
  // ...
}

/**
 * Envio de mensagem — valida, cria msg, renderiza, salva e simula reply.
 */
sendMessage() {
  // ...
}
```

### Comentários inline

- Use para explicar **por que** algo é feito, não **o que** é feito.

```js
// ✅ Explica a intenção
// Limpa o estado de transição anterior e reinicia a animação de pulse
this.el.crownToggle.classList.remove('is-pulsing')
void this.el.crownToggle.offsetWidth // força reflow p/ reiniciar a animação
```

```js
// ❌ Óbvio (não precisa)
// Adiciona a classe is-active
chip.classList.add('is-active')
```

### Quando comentar

| Situação | Deve comentar? |
|----------|---------------|
| Seção nova num arquivo grande | ✅ Sim |
| Workaround / hack | ✅ Sim |
| Lógica não-intuitiva | ✅ Sim |
| `var x = 5` | ❌ Não |
| `if (user) { ... }` | ❌ Não |
| Interface de API pública | ✅ Sim |
| Fluxo de animação complexo | ✅ Sim |
| Por que um número mágico | ✅ Sim (ex.: `CROWN_MOVE_DURATION: 750, // ms`) |

### Padrão para CSS

```css
/* ---- Tela inicial (coroa no centro) ----
   Composição equilibrada: centralizada com leve viés para baixo,
   ficando mais perto do composer. */
.empty-state {
  min-height: calc(100% - 8px);
  /* ... */
}
```

---

## 🏗️ 8. Estrutura de Arquivos

### Vanilla JS (chat.js / ui-core.js / etc.)

```
1. HEADER COMMENT (bloco com descrição do arquivo)
2. Definição do objeto (const LizX = { ... })
3. Propriedades de estado (el: {}, activePanel: null, ...)
4. Métodos de inicialização (init, render, ...)
5. Métodos de ação (send, toggle, open, close, ...)
6. Métodos auxiliares privados (_method)
7. Export (window.LizX = LizX)
```

### Login (Vanilla JS — app.js)

```
1. Estado global (App.state)
2. Funções de tema
3. Funções de navegação SPA
4. Constantes (ícones SVG, textos)
5. Funções de renderização (renderLoginPage, etc.)
6. Validação (validateLoginField, etc.)
7. Event binding (bindEvents)
8. Handlers (handleLoginSubmit, etc.)
9. Inicialização (DOMContentLoaded → App.init())
```

---

## 🎨 9. Padrões CSS

### Organização

```css
/* ============================================================
   SEÇÃO — descrição
   ============================================================ */

.sub-section {
  /* ... */
}
```

### Nomeação (BEM-like)

```css
/* Bloco */
.panel { }
.panel-head { }
.panel-body { }
.panel-title { }

/* Modificador */
.panel.is-open { }
.float-pill.is-active { }
.msg.is-highlighted { }
.gallery-empty.is-shown { }

/* Elemento com prefixo do bloco */
.float-pill-ico { }
.float-pill-label { }
.msg-bubble-user { }
```

### Variáveis CSS (design tokens)

Sempre use variáveis CSS em vez de valores brutos:

```css
/* ✅ Correto */
.button {
  background: var(--color-brand);
  border-radius: var(--radius-pill);
  color: var(--color-text-primary);
}

/* ❌ Evitar */
.button {
  background: #8b5cf6;
  border-radius: 999px;
  color: #ffffff;
}
```

### Temas

Use `[data-theme="light"]` para variantes de tema claro:

```css
.card {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}

[data-theme="light"] .card {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 0, 0, 0.1);
}
```

### Animações

Nomeie animações com `camelCase` e agrupe no topo do arquivo:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes crownFloat {
  0%   { transform: translateY(0); filter: drop-shadow(...); }
  50%  { transform: translateY(-10px); filter: drop-shadow(...); }
  100% { transform: translateY(0); filter: drop-shadow(...); }
}
```

---

## 📝 10. Convenções Gerais

### Vanilla JS

| Item | Padrão |
|------|--------|
| Declaração de variáveis | `const` (preferido), `let` (quando reatribuir). Evite `var` — migre para `const`/`let` ao editar trechos legados. |
| Template strings | Use `${...}` para interpolação |
| Strings | Aspas simples `'...'` (padrão), aspas duplas `"..."` para HTML |
| Semicolons | **Sempre** usar `;` ao final de cada statement |
| Comparação | `===` e `!==` (nunca `==` ou `!=`) |
| Arrow functions | Para callbacks e funções curtas |
| Async | `async/await` sobre `.then()` |
| Nomes privados | Prefixo `_` (convenção, não enforced) |

### Login (Vanilla JS)

| Item | Padrão |
|------|--------|
| Declaração de função | `function nome()` (funções nomeadas) ou métodos em objeto |
| Event handlers | Nome: `handleClick`, `handleSubmit`, `handleInputChange` |
| Estado booleano | `isLoading`, `showPassword`, `hasError` |
| Manipulação DOM | `innerHTML`, `classList`, `addEventListener` |
| Renderização | Funções que retornam string HTML ou manipulam DOM diretamente |

### HTML

```html
<!-- ✅ IDs com kebab-case -->
<button id="mobile-menu-btn" />
<div id="panel-conversations" />

<!-- ✅ Classes descritivas -->
<div class="floating-menu" />
<div class="panel-body" />

<!-- ✅ Acessibilidade -->
<button aria-label="Fechar" aria-expanded="true" />

<!-- ✅ Ordem de atributos -->
id → class → type → data-* → aria-* → event handlers
```

---

## ⚡ 11. Performance

### requestAnimationFrame (RAF)

Use **`requestAnimationFrame`** para animações JS e sincronização visual — executa no próximo ciclo de render do navegador.

```js
// ✅ Correto: animação via RAF
requestAnimationFrame(() => {
  this._introCrown.classList.add('intro-crown-enter')
})

// ✅ Correto: scroll sincronizado com o ciclo de render
_scrollToBottom() {
  requestAnimationFrame(() => {
    this.el.contentWrap.scrollTop = this.el.contentWrap.scrollHeight + 40
  })
}
```

```js
// ❌ Evitar: setTimeout para sync visual (não sincroniza com o frame)
setTimeout(() => element.classList.add('visible'), 16)
```

#### Cancelamento de RAF

Sempre cancele animações anteriores antes de iniciar uma nova:

```js
// ✅ Correto: cancela animação anterior antes de começar nova
const animateTo = useCallback((newTarget) => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current)  // ← interrompe animação anterior
    animationRef.current = null
  }
  // ... inicia nova animação
  animationRef.current = requestAnimationFrame(step)
}, [applyPos])

// ✅ Cleanup no desmonte (React)
useEffect(() => () => {
  if (animationRef.current) cancelAnimationFrame(animationRef.current)
}, [])
```

#### Uso de RAF no ThemeToggle

Use `requestAnimationFrame` + `performance.now()` para animações físicas com easing customizado:

```js
const duration = 420 // ms
const startTime = performance.now()

const step = (now) => {
  const elapsed = now - startTime
  const t = Math.min(elapsed / duration, 1)
  const eased = easeOutExpo(t)
  const pos = startX + delta * eased
  applyPos(pos)
  if (t < 1) {
    animationRef.current = requestAnimationFrame(step)  // ← continua animando
  }
}
animationRef.current = requestAnimationFrame(step)
```

---

### CSS will-change

Use **`will-change`** para preparar o navegador para animações de elementos específicos. **Remova após a animação** para liberar memória.

```css
/* ✅ Correto: avisa o navegador que opacidade e transform vão animar */
.element {
  will-change: transform, filter;
}
```

```js
// ✅ Adiciona antes da animação, remove depois
el.style.willChange = 'opacity, transform'
el.classList.add('intro-interface-hidden')

// ... depois da animação:
elem.style.willChange = ''  // ← libera o hint
```

**⚠️ Regras:**
- Use `will-change` **apenas para elementos que realmente serão animados**.
- **Nunca** aplique `will-change` em muitos elementos ao mesmo tempo (consome GPU).
- **Sempre** remova (`willChange = ''`) após a animação terminar.
- Use em CSS apenas para elementos com animação contínua (ex.: coroa flutuante).
- Prefira definir via JS para animações temporárias (`el.style.willChange`).

---

### Forçar Reflow

Use `void element.offsetWidth` para **forçar um reflow** e reiniciar animações CSS:

```js
// ✅ Correto: força reflow para reiniciar animação CSS
this.el.crownToggle.classList.remove('is-pulsing')
void this.el.crownToggle.offsetWidth  // ← força reflow (lê layout)
this.el.crownToggle.classList.add('is-pulsing')
```

```js
// ❌ Incorreto: a classe é re-adicionada no mesmo ciclo, sem efeito
this.el.crownToggle.classList.remove('is-pulsing')
this.el.crownToggle.classList.add('is-pulsing')  // ← navegador otimizou e ignorou
```

**⚠️ Use com moderação** — forçar reflow é caro. Só use quando precisar reiniciar uma animação CSS.

---

### Lazy Loading de Imagens

Sempre use `loading="lazy"` para imagens abaixo da dobra:

```html
<!-- ✅ Correto: carrega só quando estiver perto da viewport -->
<img src="foto.jpg" alt="Preview" loading="lazy" />

<!-- ❌ Evitar: carrega tudo de uma vez -->
<img src="foto.jpg" alt="Preview" />
```

No código JS (injeção de HTML):

```js
// ✅ Correto: loading="lazy" em imagens dinâmicas
html += '<img src="' + f.dataUrl + '" alt="' + name + '" loading="lazy" />'
```

---

### CSS Containment

Use **`contain`** ou **`content-visibility`** para isolar partes da UI que não precisam recalcular layout completo:

```css
/* ✅ Dica: use contain em painéis que abrem/fecham */
.panel-body {
  contain: layout style;
}

/* ✅ Dica: elementos abaixo da dobra podem pular render */
.messages-list {
  content-visibility: auto;
}
```

---

### Evitar Layout Shifting (CLS)

Sempre defina **dimensões explícitas** para imagens e elementos carregados dinamicamente:

```css
/* ✅ Correto: dimensões explícitas */
.gallery-item {
  aspect-ratio: 1;
  width: 100%;
}

.hero-crown-slot {
  width: 116px;
  height: 116px;
}
```

```css
/* ❌ Evitar: sem dimensões, causa layout shift */
.gallery-item {
  /* sem width/height/aspect-ratio */
}
```

---

### Debounce em Eventos Frequentes

Use **debounce** para eventos de alta frequência como `scroll`, `resize`, `input`:

```js
// ✅ Correto: debounce simples para filtro de busca
_filterMessages() {
  const query = this.el.searchInput?.value.trim().toLowerCase() || ''
  document.querySelectorAll('.msg').forEach((m) => {
    // ... filtra mensagens (executa a cada input, sem debounce)
  })
}
// ⚠️ Para performance com listas grandes, adicione debounce:
// let debounceTimer
// clearTimeout(debounceTimer)
// debounceTimer = setTimeout(() => this._filterMessages(), 150)
```

**Padrão de debounce recomendado:**

```js
// ✅ Padrão debounce para Vanilla JS
const debounce = (fn, delay = 150) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Uso:
el.input.addEventListener('input', debounce((e) => {
  this._filterMessages()
}, 200))
```

---

### Animações CSS vs JS

| Tipo | Quando usar | Exemplo no projeto |
|------|-------------|-------------------|
| **CSS animations/transitions** | Animações declarativas: hover, fade, float, pulse | `crownFloat`, `fadeInUp`, `gradientShift` |
| **Web Animations API** | Animações com cálculo dinâmico de posição | Movimento da coroa da intro (`element.animate()`) |
| **requestAnimationFrame** | Animações JS com easing customizado interrompível | Bolinha do ThemeToggle |
| **setTimeout** | Apenas para delays (não para animação visual) | `_delay(850)` antes de simular resposta |

```js
// ✅ Web Animations API para movimento calculado dinamicamente
const deltaX = targetCenterX - movingCenterX
const deltaY = targetCenterY - movingCenterY

this._introAnim = mover.animate(
  [
    { transform: 'translate(-50%, -50%) scale(1)' },
    { transform: `translate3d(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px), 0) scale(1)` }
  ],
  {
    duration: 750,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'forwards'
  }
)
```

---

### View Transitions API

Use a **View Transitions API** para transições suaves entre temas:

```js
// ✅ Transição radial ao trocar de tema (com fallback)
if (!document.startViewTransition) {
  // Fallback para navegadores sem suporte
  applyTheme(nextTheme)
  return
}

document.startViewTransition(() => {
  flushSync(() => applyTheme(nextTheme))
})
```

---

### Evitar Manipulação DOM Desnecessária

- **Cache de seletores**: armazene referências DOM em vez de consultar repetidamente.
- **Batch updates**: agrupe manipulações DOM em lote (use `innerHTML` em vez de múltiplos `appendChild`).
- **Estado mínimo**: só mantenha no estado o que é essencial. Derive o resto.

```js
// ✅ Bom: cache de elementos, estado mínimo
const el = {
  input: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
}
const strength = calculateStrength(password) // ← derivado, não armazenado

// ❌ Ruim: consulta DOM repetidamente
document.getElementById('chat-input').value = ''
document.getElementById('send-btn').disabled = true
```

---

### Regras de Performance (Resumo)

| Prática | Recomendação |
|---------|--------------|
| Animações JS | Use `requestAnimationFrame` + `cancelAnimationFrame` |
| Animações CSS | Prefira `transform` e `opacity` (não `width`, `height`, `top`, `left`) |
| `will-change` | Adicione antes, remova depois. Nunca em excesso. |
| Reflow | Só force com `offsetWidth` quando estritamente necessário |
| Imagens | Sempre `loading="lazy"` abaixo da dobra |
| Layout | Defina `aspect-ratio` ou dimensões explícitas |
| Containment | Use `contain: layout style` em componentes isolados |
| Debounce | Eventos de scroll/resize com `debounce(handler, 100)` |
| Re-renders (React) | `useCallback`, `useMemo`, estado mínimo |
| Transições de tema | View Transitions API com fallback |

---

## ♿ 12. Acessibilidade

### ARIA — Atributos Essenciais

#### `aria-label` — rótulo invisível (para elementos sem texto visível)

Use em **todo botão que não tenha texto** visível (apenas ícone):

```html
<!-- ✅ Correto: botão com ícone tem aria-label -->
<button type="button" aria-label="Nova conversa">
  <span class="float-pill-ico"><!-- SVG --></span>
</button>

<button type="button" aria-label="Alternar tema">
  <span id="theme-icon"><!-- SVG --></span>
</button>

<button type="submit" aria-label="Enviar mensagem" disabled>
  <span><!-- SVG send --></span>
</button>

<!-- ❌ Evitar: botão sem texto e sem aria-label -->
<button><span><!-- SVG --></span></button>
```

No HTML injetado via JS:

```js
// ✅ Correto: aria-label em botões dinâmicos
'<button class="reaction-btn" data-reaction="' + r.key + '" type="button" aria-label="Reagir com ' + r.emoji + '">'
```

#### `aria-hidden="true"` — esconder elementos decorativos

Use para **SVGs decorativos** e **painéis fechados**:

```html
<!-- ✅ Correto: SVG decorativo escondido do leitor de tela -->
<svg class="bg-deco" aria-hidden="true" ...>
  <polygon class="deco deco-hex-1" points="..." />
</svg>

<!-- ✅ Correto: painel modal fecha com aria-hidden -->
<section class="panel" role="dialog" aria-hidden="true">
  ...
</section>
```

```js
// ✅ Ao abrir: aria-hidden="false"
panel.setAttribute('aria-hidden', 'false')

// ✅ Ao fechar: aria-hidden="true"
panel.setAttribute('aria-hidden', 'true')
```

```jsx
// ✅ React: elementos decorativos (checkmark após input válido)
{emailValid && <span aria-hidden="true"><IconCheck /></span>}
```

#### `aria-expanded` — estado de expansão

Use em **botões que controlam abertura/fechamento** de menus ou painéis:

```html
<!-- ✅ Correto: coroa controla expansão do menu lateral -->
<img
  id="crown-toggle"
  role="button"
  tabindex="0"
  aria-expanded="true"
  src="coroa.svg"
  alt="Liz — mostrar ou ocultar ferramentas"
/>
```

```js
// ✅ Atualiza o estado ao colapsar/expandir
this.el.crownToggle.setAttribute('aria-expanded', String(!willCollapse))
```

#### `aria-invalid` e `aria-describedby` — validação de formulário

Sempre ligue o erro ao input via `aria-describedby` + `aria-invalid`:

```jsx
// ✅ Correto: input + mensagem de erro linkada
<input
  id="login-email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'login-email-error' : undefined}
/>
<span id="login-email-error" role="alert">{errors.email}</span>
```

```jsx
// ❌ Erro: input sem aria-describedby
<input id="login-email" />
<span className="error-msg">{errors.email}</span>  <!-- leitor não associa ao input -->
```

#### `aria-live` — regiões com atualização dinâmica

Use `aria-live="polite"` para conteúdo que muda sem interação direta do usuário:

```jsx
// ✅ Correto: tela de sucesso após login
<div className="success-overlay" role="status" aria-live="polite">
  <h2>Bem-vindo, {userName}</h2>
</div>
```

---

### `role` — Semântica para elementos não-nativos

Sempre adicione `role` quando usar um elemento HTML com semântica diferente da nativa:

| Elemento | role | Quando usar |
|----------|------|-------------|
| `<img>` clicável | `role="button"` | Coroa do header que expande menu |
| `<section>` modal | `role="dialog"` | Painéis de conversas, ferramentas, etc. |
| `<div>` de preview | `role="dialog"` | Preview modal de imagem |
| `<div>` de sucesso | `role="status"` | Overlay de sucesso pós-login |
| `<span>` de erro | `role="alert"` | Mensagens de erro em formulários |
| `<div>` modal galeria | `role="dialog"` | Galeria de imagens |
| SVG de marca | `role="img"` | Coroa oficial inline SVG |

```html
<!-- ✅ Correto: role="dialog" em painéis modais -->
<section class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
  ...
</section>

<!-- ✅ Correto: role="button" em elemento não-button -->
<img role="button" tabindex="0" src="coroa.svg" alt="..." />

<!-- ✅ Correto: role="alert" em mensagens de erro -->
<span class="error-msg" role="alert">E-mail inválido</span>
```

```html
<!-- ❌ Erro: falta role em elemento interativo não-nativo -->
<img onclick="..." src="coroa.svg" />  <!-- leitor não sabe que é clicável -->
```

---

### Gerenciamento de Foco

#### `:focus-visible` — foco visível apenas por teclado

Sempre use `:focus-visible` (não `:focus`) para estilos de foco. Assim, clique com mouse não mostra outline, mas navegação por teclado sim:

```css
/* ✅ Correto: outline só aparece na navegação por teclado */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
  border-radius: 8px;
}

/* ❌ Evitar: outline aparece mesmo com clique do mouse */
a:focus {
  outline: 2px solid var(--color-brand);
}
```

```css
/* ✅ CSS do projeto React (index.css) */
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
  border-radius: 6px;
}
```

#### `tabindex` — ordem de tabulação

Use `tabindex="0"` para tornar elementos não-focáveis (como `<img>`) focáveis por teclado:

```html
<!-- ✅ Correto: coroa do header é focável por Tab -->
<img role="button" tabindex="0" src="coroa.svg" alt="..." />
```

**Regras de `tabindex`:**

| Valor | Efeito |
|-------|--------|
| `0` | Elemento entra na ordem natural do Tab |
| `-1` | Elemento é focável via JS (`focus()`) mas NÃO via Tab |
| `>0` | ❌ **Evitar**: quebra a ordem natural de tabulação |

---

### Teclado — Eventos

#### Atalhos essenciais

Sempre implemente navegação por teclado para todas as ações:

```js
// ✅ Escape: fecha painéis, preview, galeria, sai do modo foco
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (this.isFocused) { this.exitFocusMode(); return }
    if (previewAberto) { LizUI.closePreview(); return }
    if (galeriaAberta) { LizUI.closeGallery(); return }
    LizUI.closePanel()
  }
})

// ✅ Enter/Space em elementos com role="button"
el.crownToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    LizUI.toggleTools()
  }
})

// ✅ Ctrl+F / Cmd+F: busca na conversa
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    if (this.messages.length > 0) {
      e.preventDefault()
      LizUI.showSearchBar()
    }
  }
})

// ✅ Enter (sem Shift): envia mensagem
el.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    this.sendMessage()
  }
})
```

#### Ações por tecla

| Tecla | Ação | Implementado em |
|-------|------|----------------|
| `Enter` | Enviar mensagem, ativar botão | `chat.js`, `ui-core.js` |
| `Shift + Enter` | Nova linha no textarea | Comportamento nativo |
| `Escape` | Fechar painel, preview, galeria, sair do foco | `chat.js` |
| `Space` | Ativar coroa (toggle menu) | `chat.js` _bindEvents |
| `Ctrl+F / Cmd+F` | Buscar na conversa | `chat.js` |
| `Tab` | Navegar entre elementos focáveis | Nativo + `tabindex="0"` |

---

### `prefers-reduced-motion` — Animação Reduzida

**Sempre respeite** a preferência do usuário por animações reduzidas. O projeto tem suporte em **3 camadas**:

#### 1. CSS — desliga animações e transições

```css
/* ✅ Correto: desliga TODAS as animações */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```css
/* ✅ CSS extra para elementos específicos (chat) */
@media (prefers-reduced-motion: reduce) {
  .intro-crown-wrap {
    display: none !important;  /* esconde a animação de introdução */
  }

  html.liz-booting .chat-app {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  .intro-crown-float .intro-crown-img,
  .hero-crown-img {
    animation: none;  /* coroa estática */
  }
}
```

```css
/* ✅ CSS extra para manter a flutuação da coroa (animação não essencial) */
@media (prefers-reduced-motion: reduce) {
  .crown,
  .register-alt-crown {
    animation: crownFloat 7s cubic-bezier(0.45, 0, 0.55, 1) infinite !important;
  }
}
```

#### 2. JavaScript — pula animação de introdução

```js
// ✅ Correto: detecta preferência e pula a animação completa
runIntroAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this._showInterfaceImmediately()  // ← revela a interface sem animação
    return
  }
  // ... animação normal
}
```

#### 3. CSS unificado — transições e fade sem movimento

```css
/* ✅ CSS na tela de login (style.css) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### `aria-modal` — Modais

Use `aria-modal="true"` + `role="dialog"` em **todo modal**, para indicar que o conteúdo fora do modal está inacessível:

```html
<!-- ✅ Correto: painel modal -->
<section
  class="panel"
  role="dialog"
  aria-modal="true"
  aria-labelledby="panel-conversations-title"
  aria-hidden="true"
>
  <header class="panel-head">
    <h3 id="panel-conversations-title">Conversas recentes</h3>
  </header>
  ...
</section>

<!-- ✅ Preview de imagem -->
<div class="preview-modal" role="dialog" aria-modal="true" aria-label="Preview de imagem">
  ...
</div>
```

---

### Navegação por Tab nos Modais

Quando um modal abre, o foco deve ser **trazido para dentro do modal** (idealmente no primeiro elemento interativo ou no título). Quando fecha, o foco deve **voltar ao elemento que abriu**:

```js
// ✅ Boa prática (a implementar — TODO no projeto)
openPanel(name) {
  // ... abre painel
  panel.querySelector('[data-close], h3')?.focus()  // foco no botão fechar ou título
}

closePanel() {
  // ... fecha painel
  this._lastFocused?.focus()  // restaura foco ao elemento que abriu
}
```

---

### Checklist de Acessibilidade

| Item | Obrigatório? |
|------|-------------|
| `aria-label` em botões sem texto | ✅ Sim |
| `aria-hidden="true"` em elementos decorativos | ✅ Sim |
| `aria-expanded` em controles de expandir/recolher | ✅ Sim |
| `aria-invalid` + `aria-describedby` em inputs com erro | ✅ Sim |
| `role="alert"` em mensagens de erro | ✅ Sim |
| `role="dialog"` + `aria-modal="true"` em modais | ✅ Sim |
| `:focus-visible` (não `:focus`) para outline | ✅ Sim |
| `tabindex="0"` em elementos interativos não-nativos | ✅ Sim |
| `prefers-reduced-motion` respeitado | ✅ Sim |
| Foco vai para o modal ao abrir | ⚠️ Recomendado |
| Foco retorna ao elemento que abriu ao fechar | ⚠️ Recomendado |
| Navegação por teclado (Escape, Enter) | ✅ Sim |
| Contraste suficiente (WCAG AA) | ✅ Sim (cores de marca) |

---

## 📋 13. Checklist de Revisão

Antes de commit, verifique:

- [ ] Nomes de arquivo seguem o padrão da seção 1?
- [ ] `requestAnimationFrame` + `cancelAnimationFrame` para animações JS?
- [ ] Imagens usam `loading="lazy"`?
- [ ] `will-change` é removido após a animação?
- [ ] Dimensões explícitas (aspect-ratio) para evitar layout shift?
- [ ] Debounce em eventos de scroll/resize quando necessário?
- [ ] Funções têm nomes descritivos (verbo + substantivo)?
- [ ] Guard clauses no início de funções?
- [ ] Tratamento de erros com try/catch no localStorage?
- [ ] Null checks para elementos do DOM?
- [ ] Event listeners têm cleanup adequado?
- [ ] Navegação por teclado (Escape, Enter, Tab) implementada?
- [ ] Variáveis CSS (tokens) usadas em vez de valores brutos?
- [ ] Tema claro (`[data-theme="light"]`) suportado?
- [ ] `prefers-reduced-motion` respeitado?
- [ ] `aria-label`, `aria-invalid`, `role` em elementos interativos?
- [ ] Sem `var`, sem `==`, sem `console.log` (salvo debug intencional)?
- [ ] Comentários explicam o "porquê", não o "o quê"?
