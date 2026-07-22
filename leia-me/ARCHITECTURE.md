# 🏗️ Liz — Arquitetura do Projeto

Este documento descreve a estrutura, organização e responsabilidades de cada parte do projeto **Liz**, um assistente de IA com interface conversacional premium + tela de autenticação.

---

## 📁 Estrutura Geral

```
/
├── index.html                 ← Entry point do chat (desktop)
├── intercell.html             ← Entry point do chat (mobile)
├── coroa.svg                  ← SVG da coroa (favicon e identidade visual)
├── css/                       ← 16 arquivos CSS modulares (chat desktop)
│   ├── base.css               ← Reset, variáveis, tokens, toast
│   ├── animations.css         ← Todos os @keyframes
│   ├── layout.css             ← App layout, bg, formas decorativas
│   ├── theme.css              ← Tema escuro/claro, fonte, densidade
│   ├── header.css             ← Header, coroa, título, theme toggle
│   ├── menu.css               ← Menu flutuante lateral (pílulas)
│   ├── chat.css               ← Mensagens, composer, busca, reações
│   ├── panels.css             ← Overlay, painéis modais, float panel
│   ├── settings.css           ← Ajustes (groups, toggles, atalhos)
│   ├── projects.css           ← Página de projetos
│   ├── gallery.css            ← Galeria, preview, upload, drag
│   ├── focus-mode.css         ← Modo foco
│   ├── intro.css              ← Animação de introdução
│   ├── responsive.css         ← Breakpoints
│   └── accessibility.css      ← prefers-reduced-motion
├── js/                        ← 9 arquivos JS modulares (chat desktop)
│   ├── config.js              ← Configurações centrais e identidade visual
│   ├── data.js                ← Dados mockados + persistência localStorage
│   ├── ui-core.js             ← Objeto base LizUI (el, init, utils)
│   ├── ui-chat.js             ← Mensagens, sugestões, busca, reações
│   ├── ui-panels.js           ← Painéis, tema, pílulas do menu
│   ├── ui-gallery.js          ← Preview, galeria, upload
│   ├── ui-projects.js         ← Página de projetos
│   ├── settings.js            ← Painel flutuante de ajustes
│   ├── chat.js                ← Orquestração da aplicação
│   └── ui.js                  ← Versão legada do ui-core.js (não carregada no index.html)
├── css-cell/                  ← 6 arquivos CSS (chat mobile — intercell.html)
│   ├── base.css               ← Reset, variáveis, temas
│   ├── layout.css             ← Layout do app mobile
│   ├── chat.css               ← Mensagens, composer, estados
│   ├── panels.css             ← Overlay, modais, toast
│   ├── projects.css           ← Página de projetos mobile
│   └── theme.css              ← Tema escuro/claro mobile
├── js-cell/                   ← 4 arquivos JS (chat mobile — intercell.html)
│   ├── app.js                 ← Legado (não carregado no intercell.html)
│   ├── chat.js                ← Legado (não carregado no intercell.html)
│   ├── mobile.js              ← Orquestração completa da interface mobile (ÚNICO carregado)
│   └── ui-core.js             ← Legado (não carregado no intercell.html)
├── leia-me/                   ← Documentação do projeto
│   ├── AGENTS.md              ← Instruções para agentes de IA
│   ├── ARCHITECTURE.md        ← Este arquivo
│   ├── CODE_STYLE.md          ← Padrões de código
│   ├── PROJECT.md             ← Visão geral do projeto
│   ├── ROADMAP.md             ← Roadmap de desenvolvimento
│   └── UI_GUIDELINES.md       ← Diretrizes de interface
├── tela-login-html/           ← Login/Cadastro (HTML+CSS+JS vanilla)
│   ├── index.html             ← Entry point (HTML puro)
│   ├── coroa.svg              ← Coroa oficial
│   ├── css/
│   │   └── style.css          ← CSS completo (login, cadastro, termos, recuperar senha)
│   └── js/
│       └── app.js             ← SPA vanilla (navegação, formulários, validação, temas)
└── coroa.svg                 ← SVG da coroa (favicon e identidade visual)
```

---

## 🧩 Projeto 1: Chat (Vanilla JS)

### index.html
**Responsabilidade:** Entry point da aplicação. Contém toda a estrutura HTML do chat: header, menu flutuante, área de mensagens, composer (input), painéis modais (conversas, ferramentas, projetos, ajustes), overlay, preview de imagens, galeria, e modo foco.

Carrega os scripts em ordem específica: `config.js → data.js → ui-core.js → ui-chat.js → ui-panels.js → ui-gallery.js → ui-projects.js → settings.js → chat.js`.

### css/ — 15 arquivos CSS modulares

| Arquivo | Responsabilidade |
|---------|----------------|
| **base.css** | Design tokens, reset, scrollbar, tab navigation, focus ring, toast |
| **animations.css** | Todos os @keyframes (crownFloat, fadeInUp, toolCollapse, etc.) |
| **layout.css** | App layout, bg gradientes, grid, formas decorativas SVG |
| **theme.css** | Tema escuro/claro, tamanho fonte, densidade, fonte do código |
| **header.css** | Header, coroa, título Liz, status, theme toggle, botão mobile |
| **menu.css** | Menu flutuante lateral, pílulas de vidro, tooltips, collapse/expand |
| **chat.css** | Empty state, sugestões, starters, mensagens, composer, busca, reações, edição |
| **panels.css** | Overlay, painéis modais, cards, float panel do menu |
| **settings.css** | Ajustes: groups, segmented, toggles, selects, atalhos, conta, plano |
| **projects.css** | Página de projetos (espaços criativos) |
| **gallery.css** | Galeria, preview, upload panel, drag & drop, file messages |
| **focus-mode.css** | Modo foco, botão sair do foco |
| **intro.css** | Animação de introdução da coroa |
| **responsive.css** | Todos os breakpoints (1100px → 380px) |
| **accessibility.css** | prefers-reduced-motion |

### js/config.js
**Responsabilidade:** Configurações centrais do aplicativo.
- **brand**: nome e tagline da IA ("Liz")
- **theme**: chave de localStorage e tema padrão
- **suggestions**: modos de sugestão (Código, Design, Erros, Ideias) com labels, ícones, status e placeholders
- **startersByMode**: cards de início rápido para cada modo
- **crown**: SVG da coroa oficial (#b040d0)
- **icons**: Todos os ícones SVG inline (~35 ícones) usados na UI

### js/data.js
**Responsabilidade:** Camada de dados e persistência.
- **conversationGroups**: Dados mockados de conversas agrupadas por período (Hoje, Ontem, Semana)
- **savedConversations**: Conversas salvas carregadas do `localStorage`
- **tools**: Lista de ferramentas mockadas
- **projects**: Lista de projetos mockados (legado — substituído pela galeria)
- **sampleMessages**: Mensagens de exemplo para demonstração
- **replies**: Respostas simuladas da IA categorizadas por assunto
- **reactionEmojis**: Emojis disponíveis para reações
- **uploadedFiles**: Histórico de uploads persistido em `localStorage`
- Métodos: `saveConversation()`, `loadSavedConversations()`, `deleteConversation()`, `getConversationGroups()`, `saveUploadedFile()`, `deleteUploadedFile()`

### js/ — 9 arquivos JS

| Arquivo | Responsabilidade |
|---------|----------------|
| **config.js** | Constantes, identidade visual, ~35 ícones SVG |
| **data.js** | Dados mockados, localStorage (conversas, projetos, uploads) |
| **ui-core.js** | Objeto base LizUI: cache de elementos DOM, init(), renderBrand(), utils (_esc, _markdown, _formatFileSize) |
| **ui-chat.js** | Sugestões, starters, mensagens, busca, scroll, reações, edição inline |
| **ui-panels.js** | Pílulas do menu, toggleTools, openPanel/closePanel, float panels, initTheme/setTheme, settings events |
| **ui-gallery.js** | Preview, galeria, upload panel, project gallery, file messages |
| **ui-projects.js** | Página de projetos (render, CRUD, modal, mini-menu) |
| **settings.js** | Painel flutuante de ajustes (8 categorias, páginas internas, eventos) |
| **chat.js** | Orquestração: init, sendMessage, intro animation, focus mode |

### js/chat.js
**Responsabilidade:** Orquestração da aplicação.
- **init()**: Inicializa UI, carrega dados, conecta eventos, executa intro
- **_bindEvents()**: Conecta todos os eventos: formulário, input, coroa, menu, painéis, upload, drag & drop, teclado
- **_handlePill()**: Roteia cliques nas pílulas do menu
- **sendMessage()**: Envio de mensagens com transição para modo conversa
- **_simulateReply()**: Resposta simulada da IA
- **_handleFiles()**: Upload de arquivos pelo chat
- **editMessage() / deleteMessage()**: Edição e exclusão inline
- **toggleReaction()**: Sistema de reações
- **exportConversation()**: Exporta conversa para Markdown
- **newConversation()**: Limpa e volta ao estado inicial
- **toggleFocusMode() / exitFocusMode()**: Modo foco (atualmente sem trigger na UI)
- **runIntroAnimation()**: Animação de introdução da coroa
- **_revealInterface()**: Revela a interface após a intro
- **_finalizeCrown()**: Finaliza e limpa a animação da coroa

---

## 🌐 Projeto 2: Tela de Login (Vanilla HTML + CSS + JS)

### tela-login-html/index.html
**Responsabilidade:** Entry point da aplicação de autenticação. Estrutura HTML mínima com `<div id="root">` para renderização via JS, theme toggle fixo (fora do SPA) e carregamento do script `js/app.js`.

### tela-login-html/css/style.css
**Responsabilidade:** CSS completo e unificado (~2300 linhas) contendo:
- **Design tokens**: variáveis CSS para tema escuro e claro (mesma paleta do chat)
- **Animações**: phraseSlide, cardSlideIn, spin, dotPulse, gradientShift, overlayIn, successPop, crownBounce, shakeIn, checkPop, fadeInUp, decoPulse, decoFloat
- **Theme toggle**: track/thumb com animação morphing (themePulse, themeThumbPop)
- **Login page**: formulário, validação, força de senha, checkbox customizado, botões sociais
- **Register page**: 4 campos, validação em tempo real, strength meter, termos de uso
- **Forgot password page**: formulário de recuperação de senha
- **Legal pages**: Termos de Uso e Política de Privacidade com layout de documento
- **Success overlays**: animações de sucesso pós-login/cadastro
- **Responsividade**: adaptação para mobile
- **`prefers-reduced-motion`**: animações reduzidas

### tela-login-html/js/app.js
**Responsabilidade:** Aplicação SPA vanilla (~1600 linhas) com:
- **State**: página atual, transições, tema
- **Theme**: getInitialTheme, applyTheme, toggleTheme com View Transitions API + fallback
- **Animação do thumb**: animateThumbTo via requestAnimationFrame com easeOutExpo
- **SPA Navigation**: navigate() com transições pageExit/pageEnter via CSS
- **Ícones SVG**: inline (email, lock, eye, eyeOff, user, check, google, github)
- **Phrase Carousel**: startPhraseCarousel com troca a cada 4s (conjuntos para login/register)
- **SVG Decorations**: getDecoSvg, getRegisterDecoSvg (formas geométricas)
- **Crown Easter Egg**: toggleCrownSecret com código binário
- **Password Strength**: calculateStrength (5 critérios: ≥6, ≥8, maiúscula, número, símbolo)
- **Render Functions**: renderLoginPage, renderRegisterPage, renderTermsPage, renderPrivacyPage, renderForgotPasswordPage, renderSuccessOverlay
- **Validation**: validateLoginField, validateRegisterField, validateForgotField com feedback visual em tempo real
- **Event Binding**: bindEvents para navegação, formulários, social buttons, password toggle
- **Submit Handlers**: handleLoginSubmit, handleRegisterSubmit, handleForgotSubmit com loading state

---

## 🔄 Fluxo de Dados — Chat (Vanilla JS)

### Dependências entre os módulos

```
┌──────────────┐     ┌──────────────┐
│  config.js   │     │   data.js    │
│  (constantes)│     │  (dados +    │
│  ícones,     │     │  localStorage│
│  textos)     │     │  persist)    │
└──────┬───────┘     └──────┬───────┘
       │                    │
       │    ┌───────────────┘
       ▼    ▼
┌──────────────────────┐
│     ui-core.js       │
│  (objeto base LizUI) │
└──────┬───────────────┘
       │
       ├──────────────────────────┐
       ▼                          ▼
┌──────────────┐     ┌──────────────────────┐
│  ui-chat.js  │     │    ui-panels.js       │
│  (mensagens, │     │  (painéis, tema,      │
│   sugestões, │     │   pills, settings)    │
│   busca)     │     └──────────┬───────────┘
└──────────────┘                │
                                │
       ┌────────────────────────┘
       ▼
┌──────────────────────┐     ┌──────────────┐
│   ui-gallery.js      │     │ui-projects.js│
│  (preview, upload,   │     │  (projetos)  │
│   galeria)           │     └──────┬───────┘
└──────────────────────┘            │
                                    │
       ┌────────────────────────────┘
       ▼
┌──────────────────────┐
│    settings.js       │
│  (ajustes flutuante) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     chat.js          │
│   (orquestrador)     │
└──────────────────────┘
```

### Fluxo de Inicialização (App Boot)

```
DOMContentLoaded
       │
       ▼
LizChat.init()
       │
       ├── 1. LizData.loadSavedConversations()   ← lê localStorage('liz-chat-conversations')
       ├── 2. LizData.loadUploadedFiles()         ← lê localStorage('liz-chat-uploads')
       │
       ├── 3. LizUI.init()                        ← cache de elementos do DOM
       ├── 4. LizUI.renderBrand()                 ← injeta SVG da coroa + ícones
       ├── 5. LizUI.renderSuggestions()           ← renderiza chips de modo
       ├── 6. LizUI.renderStarters()              ← esvazia (só aparece ao selecionar modo)
       ├── 7. LizUI.renderPanels()                ← renderiza ferramentas, esvazia projetos
       ├── 8. LizUI.initTheme()                   ← carrega tema do localStorage
       ├── 9. LizUI.bindMessageActions()          ← eventos de clique nas mensagens
       │
       ├── 10. LizUI.renderSearchBar()            ← cria barra de busca (oculta)
       ├── 11. LizUI.renderScrollButton()         ← botão "rolar para o final"
       ├── 12. LizUI.initDragDrop()               ← overlay de drag & drop
       │
       ├── 13. LizUI.showEmptyState()             ← exibe tela inicial (coroa + "Liz")
       ├── 14. LizUI.updateSendState()            ← desabilita botão enviar
       │
       ├── 15. LizChat._bindEvents()              ← conecta todos os eventos
       │
       └── 16. LizChat.runIntroAnimation()        ← animação da coroa
```

### Fluxo de Envio de Mensagem

```
Usuário digita texto + Enter
       │
       ▼
chat.js: sendMessage()
       │
       ├── 1. valida se text não está vazio
       │
       ├── 2. [SE primeira mensagem]
       │      ├── a. cria título da conversa
       │      ├── b. LizUI.showConversation(title) → esconde empty-state, mostra messages-list
       │      ├── c. LizUI.clearMode() → limpa chip ativo
       │      ├── d. LizUI.renderMessages() → renderiza todas as mensagens
       │      └── e. LizUI.addExportButton() → adiciona botão de exportar
       │
       ├── 3. [SE já tem mensagens]
       │      └── LizUI.appendMessage() → adiciona ao final
       │
       ├── 4. limpa input, auto-resize, updateSendState
       ├── 5. LizChat._saveCurrentConversation() → salva no localStorage
       │
       └── 6. LizChat._simulateReply(userText)
                │
                ├── a. LizUI.showTyping() → bolha com 3 dots pulando
                ├── b. delay de 850ms
                ├── c. LizUI.removeTyping()
                ├── d. LizChat._pickReply() → seleciona resposta mock baseada em
                │    palavras-chave do texto do usuário
                │    (code, design, error, ideas → reply correspondente)
                ├── e. cria msg { role: 'liz', content, time }
                └── f. LizUI.appendMessage() + _saveCurrentConversation()
```

### Fluxo de Animação de Introdução

```
runIntroAnimation()
 │
 ├── [SE prefers-reduced-motion]
 │      └── _showInterfaceImmediately() → _revealInterface()
 │
 ├── 1. _hideAllInterface() → adiciona classe .intro-interface-hidden
 │      no header, floating-menu, chat-main, composer
 │
 ├── 2. esconde empty-crown via inline styles:
 │      crownInInterface.style.visibility = 'hidden'
 │      crownInInterface.style.animation = 'none'
 │
 ├── 3. cria <div class="intro-crown-wrap"> com <img src="coroa.svg">
 │      e adiciona ao body
 │
 ├── 4. requestAnimationFrame → .intro-crown-enter (escala + blur → visível)
 │
 ├── 5. setTimeout 480ms → .intro-crown-float (flutuação suave)
 │
 ├── 6. setTimeout 700ms → _minTimeElapsed = true → _checkReveal()
 │
 ├── 7. _waitForAppReady() → pooling a cada 50ms até fonts carregadas
 │      e layout do empty-crown ter dimensões > 0
 │
 ├── 8. _checkReveal() → se appReady && minTimeElapsed && stage == 'loading'
 │      → _startCrownMove()
 │
 ├── 9. _startCrownMove()
 │      ├── a. adiciona classe .crown-target-only no empty-crown da interface
 │      ├── b. setTimeout 120ms → inicia a Web Animation da coroa
 │      │    calculando deltaX/deltaY via getBoundingClientRect()
 │      │    entre o centro do mover e o alvo (.hero-crown-slot)
 │      ├── c. define setTimeout para _revealInterface() em 570ms
 │      │    (CROWN_MOVE_DURATION - REVEAL_OVERLAP = 750 - 180)
 │      └── d. animation.finished.then → _finalizeCrown() em 750ms
 │
 ├── 10. _revealInterface() [roda em 570ms OU em 750ms]
 │       ├── a. remove .crown-target-only do empty-crown
 │       ├── b. limpa inline styles (visibility, animation)
 │       ├── c. html: liz-booting → liz-intro-complete
 │       ├── d. remove .intro-interface-hidden dos elementos
 │       └── e. app.style.pointerEvents = ''
 │
 └── 11. _finalizeCrown() [roda em 750ms]
          ├── a. commitStyles() + cancel() da animação
          ├── b. remove o elemento .intro-crown-wrap do DOM
          └── c. chama _revealInterface() (mas guard previne re-exec)
```

### Fluxo de Upload de Arquivos (Chat)

```
Usuário clica em Anexar ou arrasta arquivo
       │
       ▼
LizChat._handleFiles(FileList)
       │
       ├── 1. filtra arquivos > 10MB (mostra toast de erro)
       │
       └── 2. para cada arquivo válido:
                │
                ├── a. FileReader.readAsDataURL(file)
                │
                └── b. onload:
                       ├── i.   cria msg = { role: 'user', content: '', file: {name,size,type,dataUrl}, time }
                       ├── ii.  push ao array de mensagens
                       ├── iii. [SE primeira mensagem] → showConversation + renderMessages
                       ├── iv.  [SE já tem] → appendMessage
                       ├── v.   LizData.saveUploadedFile() → salva no localStorage('liz-chat-uploads')
                       ├── vi.  _saveCurrentConversation()
                       └── vii. [SE último arquivo] → _simulateFileReply()
```

### Fluxo de Upload (Galeria de Projetos)

```
Usuário clica em "Upload" no painel de Projetos
       │
       ▼
Cria input[type=file] temporário
       │
       ▼
onchange → LizUI._galleryUploadFiles(FileList)
       │
       ├── filtra arquivos > 10MB
       │
       └── para cada arquivo:
            ├── FileReader.readAsDataURL()
            └── onload → LizData.saveUploadedFile() + re-render da galeria
                
            ⚠️ DIFERENÇA: não cria mensagem no chat!
            O upload da galeria salva DIRETAMENTE no LizData.uploadedFiles
            e re-renderiza o painel, sem passar pelo LizChat._handleFiles().
```

### Máquina de Estados do Chat

```
                ┌──────────────────────────────────────┐
                │                                      │
                ▼                                      │
┌──────────────────────┐     enviar msg     ┌──────────────────────┐
│    EMPTY STATE       │ ──────────────────→│   CONVERSATION       │
│  (coroa + "Liz" +   │                    │  (mensagens visíveis) │
│   sugestões + cards) │                    │                      │
│                      │←───────────────────│                      │
└──────────────────────┘   newConversation  └──────────────────────┘
                                                    │
                                                    │ openPanel()
                                                    ▼
                                           ┌──────────────────────┐
                                           │   PANEL MODAL        │
                                           │ (conversas /         │
                                           │  ferramentas /       │
                                           │  projetos / ajustes) │
                                           │                      │
                                           └──────────────────────┘
                                                    │
                                                    │ closePanel()
                                                    ▼
                                           ┌──────────────────────┐
                                           │   CONVERSATION       │
                                           │  (retorna)           │
                                           └──────────────────────┘
```

---

## 🔄 Fluxo de Dados — Login (Vanilla JS)

### Hierarquia de Componentes (Vanilla JS — SPA)

```
App (objeto único em tela-login-html/js/app.js)
  ├── state: { page, theme, isTransitioning, displayPage }
  ├── ThemeToggle (botão fixo fora do SPA)
  ├── div.page-wrapper (animação de transição)
  │   ├── renderLoginPage() | renderRegisterPage()
  │   └── renderTermsPage() | renderPrivacyPage() | renderForgotPasswordPage()
  └── renderSuccessOverlay() (pós-login/cadastro)
```

### Navegação entre Páginas

```
App (objeto em app.js) mantém estado:
  page: 'login' | 'register' | 'terms' | 'privacy' | 'forgot'
  prevPage: string | null
  isTransitioning: boolean
  displayPage: string (render atual durante transição)

Fluxo de navegação:
  Usuário clica "Cadastre-se" no Login
       │
       ▼
  App.navigate('register')
       │
       ├── guarda prevPage = 'login'
       ├── set isTransitioning = true
       ├── displayPage continua 'login' (renderiza a página atual durante saída)
       │
       ├── setTimeout 250ms:
       │      ├── displayPage = 'register'
       │      ├── page = 'register'
       │      └── requestAnimationFrame → isTransitioning = false
       │
       └── CSS anima:
              .page-wrapper.page-exit → fadeOut + slideUp (250ms)
              .page-wrapper.page-enter → fadeIn + slideDown (300ms)
```

### Ciclo de Vida do Login (Vanilla JS)

```
renderLoginPage() injeta HTML no #root
  │
  ├── Estado em variáveis de closure: email, password, showPassword, etc.
  │
  ├── Validação em tempo real via addEventListener('input'):
  │      email → regex /\S+@\S+\.\S+/
  │      password → min 8 chars + 1 number/symbol
  │
  ├── PasswordStrength (5 critérios → % → label Fraca/Média/Forte + cor)
  │
  └── Submit (handleLoginSubmit):
         ├── validate() → erros nos campos
         ├── btn.disabled = true + spinner
         ├── delay 1500ms (simula requisição)
         ├── extrai nome do email
         └── showSuccess = true → tela de boas-vindas
```

### Ciclo de Vida do Tema (Login — Vanilla JS)

```
App (objeto em app.js)
  │
  ├── getInitialTheme() → lê localStorage('liz-theme') ou prefers-color-scheme
  ├── applyTheme(theme) → setAttribute('data-theme', theme) + localStorage
  │
  ├── toggleTheme() → muda tema + anima transição
  │    (View Transitions API com fallback para morphing CSS)
  │
  └── ThemeToggle: thumb animado via requestAnimationFrame com easeOutExpo
```

---

## 💾 localStorage — Estrutura de Dados

### Chave: `liz-chat-conversations`
```json
[
  {
    "id": "conv_1234567890_abcd",
    "title": "Plano de estudos",
    "messages": [
      { "role": "user", "content": "Crie um plano", "time": "09:41" },
      { "role": "liz", "content": "Claro! Aqui vai...", "time": "09:42" }
    ],
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000,
    "preview": "Última mensagem: ..."
  }
]
```

### Chave: `liz-chat-uploads`
```json
[
  {
    "id": "file_1234567890_abcd",
    "name": "foto.jpg",
    "size": 102400,
    "type": "image/jpeg",
    "dataUrl": "data:image/jpeg;base64,...",
    "convTitle": "Projetos",
    "timestamp": 1700000000000
  }
]
```

### Chave: `liz-chat-theme`
```
"dark" | "light" | "auto"
```

### Chave: `liz-theme` (Login)
```
"dark" | "light"
```

---

## 🎨 Design System Compartilhado

Ambos os projetos compartilham a **mesma identidade visual**:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-brand` | `#8b5cf6` | Roxo primário (botões, bordas, destaques) |
| `--color-brand-light` | `#a78bfa` | Roxo claro (hover, ícones) |
| `--color-brand-dark` | `#7c3aed` | Roxo escuro (gradientes) |
| `--color-bg-page` | `#050505` | Fundo escuro principal |
| `--radius-card` | `24px` | Cantos dos cards |
| `--radius-input` | `12px` | Cantos dos inputs |
| `--radius-pill` | `999px` | Cantos de pílulas/badges |
| Fonte | `Inter` | Tipografia principal |
| Símbolo | Coroa roxa | Identidade visual (SVG #b040d0) |
| Fundo | Gradientes radiais + grid sutil | Background do body |
| Cards | Glassmorphism (backdrop-filter blur) | Todos os painéis |

---

## 📦 Possíveis Melhorias Futuras

- **Integração login → chat**: Conectar a tela de login ao chat vanilla
- **Backend real**: Substituir dados mockados por API (Supabase, Firebase)
- **Testes unitários**: Adicionar testes para os módulos JS
- **Bundler**: Adicionar bundler (Vite/Webpack) ao projeto vanilla
- **PWA**: Adicionar service worker para funcionar offline
