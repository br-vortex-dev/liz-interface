# 🎨 Liz — Diretrizes de Interface (UI Guidelines)

Este documento define o sistema de design do projeto **Liz**, compartilhado entre o Chat (Vanilla JS) e a Tela de Login (Vanilla JS). Todas as cores, medidas e componentes derivam dos tokens CSS definidos nas duas interfaces.

---

## 🎭 1. Paleta de Cores

### Cores de Marca (Roxo)

| Token | Valor | Uso | Preview |
|-------|-------|-----|---------|
| `--color-brand` | `#8b5cf6` | Roxo primário — botões, bordas, destaques | 🟣 |
| `--color-brand-light` | `#a78bfa` | Roxo claro — hover, ícones, tags | 🟣 |
| `--color-brand-dark` | `#7c3aed` | Roxo escuro — gradientes, sombras | 🟣 |
| `--color-brand-glow` | `rgba(139, 92, 246, 0.5)` | Brilho — drop-shadow, box-shadow | ✨ |
| `--color-brand-accent` | `#c084fc` | Roxo claro — texto destacado, labels | 🟣 |
| Coroa SVG | `#b040d0` | Preenchimento da coroa oficial | 👑 |

### Tema Escuro (Padrão)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg-page` | `#050505` | Fundo principal da página |
| `--color-bg-card` | `rgba(255, 255, 255, 0.035)` | Fundo de cards e elementos |
| `--color-bg-card-hover` | `rgba(255, 255, 255, 0.06)` | Card hover |
| `--color-bg-elevated` | `rgba(20, 14, 30, 0.6)` | Fundo elevado (painéis, search) |
| `--color-text-primary` | `#ffffff` | Texto principal |
| `--color-text-secondary` | `rgba(255, 255, 255, 0.6)` | Texto secundário |
| `--color-text-muted` | `rgba(255, 255, 255, 0.5)` | Texto muted |
| `--color-text-subtle` | `rgba(255, 255, 255, 0.42)` | Texto sutil (placeholders) |
| `--color-border` | `rgba(255, 255, 255, 0.07)` | Borda padrão |
| `--color-border-brand` | `rgba(139, 92, 246, 0.18)` | Borda roxa |

### Tema Claro

| Token | Escuro | Claro |
|-------|--------|-------|
| `--color-bg-page` | `#050505` | `#f5f5f7` |
| `--color-bg-card` | `rgba(255,255,255,0.035)` | `rgba(255,255,255,0.7)` |
| `--color-bg-card-hover` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.9)` |
| `--color-bg-elevated` | `rgba(20,14,30,0.6)` | `rgba(255,255,255,0.85)` |
| `--color-text-primary` | `#ffffff` | `#1a1a2e` |
| `--color-text-secondary` | `rgba(255,255,255,0.6)` | `rgba(0,0,0,0.65)` |
| `--color-text-muted` | `rgba(255,255,255,0.5)` | `rgba(0,0,0,0.55)` |
| `--color-text-subtle` | `rgba(255,255,255,0.42)` | `rgba(0,0,0,0.5)` |
| `--color-border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.1)` |
| `--color-border-brand` | `rgba(139,92,246,0.18)` | `rgba(139,92,246,0.2)` |

### Cores Funcionais

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-error` | `#ef4444` | Vermelho — mensagens de erro |
| `--color-success` | `#10b981` | Verde — feedback positivo |

### Background Decorativo

O fundo do body usa **múltiplos gradientes radiais** sobrepostos para criar profundidade:

```css
body {
  background:
    radial-gradient(ellipse at 10% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
    radial-gradient(ellipse at 30% 80%, rgba(124, 58, 237, 0.08) 0%, transparent 35%),
    radial-gradient(ellipse at 80% 30%, rgba(168, 85, 247, 0.06) 0%, transparent 35%),
    radial-gradient(ellipse at 90% 80%, rgba(88, 28, 135, 0.1) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 60%),
    #050505;
}
```

Uma **grid sutil** é adicionada via pseudo-elemento `::before`:

```css
.chat-app::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 75%);
}
```

---

## 🔤 2. Tipografia

### Família de Fontes

| Uso | Fonte | Fallback |
|-----|-------|----------|
| Corpo e UI | `'Inter'` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Código | `'JetBrains Mono'` | `'Fira Code', 'Courier New', monospace` |

### Escala Tipográfica

| Elemento | Tamanho | Peso | Altura da Linha |
|----------|---------|------|-----------------|
| Título página (h1) | `2.2rem` | `700` | `1.3` |
| Título header | `1.1rem` | `700` | `1.2` |
| Título de painel | `1.05rem` | `600` | `1.3` |
| Subtítulo empty | `0.98rem` | `400` | `1.5` |
| Texto de mensagem | `0.9rem` | `400` | `1.6` |
| Texto de input | `0.92rem` | `400` | `1.5` |
| Card de conversa | `0.9rem` | `600` | `1.4` |
| Card tool | `0.86rem` | `600` | `1.4` |
| Chip sugestão | `0.84rem` | `500` | `1.3` |
| Status header | `0.84rem` | `400` | `1.3` |
| Toast / ações | `0.82rem` | `500` | `1.3` |
| Código inline | `0.82em` | `400` | `1.6` |
| Código block | `0.8rem` | `400` | `1.6` |
| Metadados | `0.68rem` | `600` (uppercase) | `1.3` |
| Timestamp | `0.62rem` | `400` | `1.3` |

### Gradiente do Nome "Liz"

O nome "Liz" no header e na tela inicial usa **gradiente animado**:

```css
.header-title, .empty-name {
  background: linear-gradient(135deg, #c084fc 0%, #a78bfa 25%, #8b5cf6 50%, #a78bfa 75%, #c084fc 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 6s ease-in-out infinite;
}
```

No tema claro, o gradiente é substituído por cor sólida `#1a1a2e`.

### Letter-spacing

| Elemento | Letter-spacing |
|----------|---------------|
| Nome "Liz" | `0.1em` |
| Título header | `0.02em` |
| Nome da IA no header | `0.02em` |
| Subtítulo | `0.01em` |
| Labels de seção (uppercase) | `0.1em` |
| Labels de código | `0.06em` |

---

## 📐 3. Espaçamentos

### Tokens de Espaçamento

O projeto não usa um sistema de spacing fixo (como 4px/8px), mas segue um padrão consistente:

| Contexto | Valor |
|----------|-------|
| Padding de painéis | `20px 22px` (head), `18px 22px` (body) |
| Padding de cards | `12px 14px` (conv), `16px 14px` (tool) |
| Padding de botões | `10px 18px` (chip), `8px 16px` (upload) |
| Padding de inputs | `11px 14px` |
| Padding do composer | `6px 6px 6px 8px` |
| Gap entre pílulas | `10px` |
| Gap entre mensagens | `20px` |
| Gap grid de ferramentas | `12px` |
| Gap grid de imagens | `10px` |
| Padding do header | `0 24px` |
| Padding do menu flutuante | `18px 0` |
| Padding do empty state | `80px 24px 20px` (desktop), `24px 24px 20px` (mobile) |
| Margin bottom da coroa | `6px` |
| Margin bottom do nome | `6px` |
| Margin bottom do subtítulo | `26px` |
| Margin bottom dos starters | `14px` (top) |

### Layout

| Variável | Valor | Uso |
|----------|-------|-----|
| `--float-menu-width` | `76px` (desktop), `68px` (1100px), `62px` (860px) | Largura do menu lateral |
| `--header-height` | `64px` | Altura do header |
| `--composer-max` | `720px` | Largura máxima do input + mensagens |

---

## 🔲 4. Bordas

### Raio de Bordas

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-card` | `24px` | Cards grandes, painéis, modais |
| `--radius-input` | `12px` | Inputs, conv-cards, search |
| `--radius-button` | `12px` | Botões padrão |
| `--radius-pill` | `999px` | Pílulas, chips, badges, toggle |

### Aplicações

| Elemento | Borda | Raio |
|----------|-------|------|
| Painel modal | `1px solid var(--color-border-brand)` | `24px` |
| Pílula do menu | `1px solid var(--color-border-brand)` | `18px` |
| Card de ferramenta | `1px solid var(--color-border)` | `12px` |
| Input de busca | `1.5px solid var(--color-border)` | `12px` |
| Bolha de mensagem | `1px solid rgba(139,92,246,0.2)` | `18px` |
| Composer | `1.5px solid var(--color-border-brand)` | `999px` |
| Chip de sugestão | `1px solid var(--color-border)` | `999px` |
| Botão de ação | `1px solid transparent` | `999px` |
| Imagem na galeria | `1px solid var(--color-border)` | `12px` |
| Card de conversa | `1px solid transparent` (hover: brand) | `12px` |

---

## 🔘 5. Botões

### Botão Primário (Enviar / Login)

```css
.btn-login, .send-btn {
  background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
  transition: transform var(--transition-fast) var(--ease-spring),
              box-shadow var(--transition-normal),
              opacity var(--transition-normal);
}
```

| Estado | Estilo |
|--------|--------|
| Normal | Gradiente roxo, shadow roxo |
| Hover | `transform: scale(1.06)`, shadow mais forte |
| Active | `transform: scale(0.96)` |
| Disabled | `opacity: 0.35`, cursor not-allowed, sem shadow |

**Send**: circular `40px × 40px`
**Login**: pill, `padding: 14px 28px`, `width: 100%`

### Pílulas do Menu (Float Pill)

```css
.float-pill {
  width: 52px; height: 52px;
  border-radius: 18px;
  border: 1px solid var(--color-border-brand);
  background: rgba(20, 14, 30, 0.55);
  backdrop-filter: blur(18px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  animation: pillEntrance 0.5s var(--ease-out-expo) both;
}
```

| Estado | Estilo |
|--------|--------|
| Normal | Glass escuro, borda roxa discreta |
| Hover | `translateY(-2px)`, cor brand-light, shadow roxo |
| Active | BG roxo `rgba(139,92,246,0.14)`, glow + barra lateral `::before` |
| Label | Tooltip que aparece no hover (`left: calc(100% + 12px)`) |

### Chips de Sugestão (Modos)

```css
.suggestion {
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  backdrop-filter: blur(14px);
  font-size: 0.84rem;
  font-weight: 500;
}
```

| Estado | Estilo |
|--------|--------|
| Normal | Glass, borda sutil |
| Hover | `translateY(-2px)`, border brand, shadow |
| Active (is-active) | Gradiente roxo `linear-gradient(135deg, rgba(139,92,246,0.32), rgba(124,58,237,0.24))`, glow |

### Botão Social (Google/GitHub)

```css
.btn-social {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-card);
  backdrop-filter: blur(14px);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
```

### Botão de Tema (Theme Toggle)

Toggle físico com track e thumb:

```css
.theme-toggle-track {
  width: 52px; height: 28px;
  border-radius: var(--radius-pill);
  background: var(--color-border);
  padding: 3px;
}

.theme-toggle-thumb {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: none; /* animado via JS/RAF */
}
```

### Botão de Fechar (Panels)

```css
.panel-close {
  width: 34px; height: 34px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
}

.panel-close:hover {
  color: #fff;
  background: rgba(139,92,246,0.18);
  border-color: rgba(139,92,246,0.5);
  transform: rotate(90deg);
}
```

---

## ✏️ 6. Inputs

### Input de Texto

```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"] {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-text-primary);
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-normal),
              box-shadow var(--transition-normal),
              background var(--transition-normal);
}
```

| Estado | Estilo |
|--------|--------|
| Normal | BG escuro translúcido, borda sutil |
| Focus | `border-color: var(--color-brand)`, `box-shadow: 0 0 0 3px rgba(139,92,246,0.15)`, BG mais claro |
| Has-error | `border-color: var(--color-error)` |
| Is-valid | Checkmark verde via pseudo-elemento |
| Placeholder | `color: var(--color-text-subtle)` |

### Input com Ícone

```css
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-icon-muted);
  pointer-events: none;
}

.input-wrapper input {
  padding-left: 42px; /* espaço para o ícone */
}
```

### Textarea (Composer)

```css
.composer-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.92rem;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  outline: none;
  padding: 10px 8px;
  max-height: 140px;
  min-height: 22px;
}
```

### Input de Busca

```css
.panel-search input {
  padding: 11px 14px 11px 40px;
  border-radius: var(--radius-input);
}

.panel-search-ico {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px; height: 17px;
}
```

### Toggle (Switch)

```css
.settings-toggle input { display: none; }

.toggle-track {
  width: 40px; height: 22px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border);
  position: relative;
}

.toggle-thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--color-text-muted);
  transition: transform var(--transition-normal) var(--ease-spring);
}

input:checked + .toggle-track {
  background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dark));
}

input:checked + .toggle-track .toggle-thumb {
  transform: translateX(18px);
  background: #fff;
}
```

### Medidor de Força de Senha

```css
.strength-meter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.strength-bar-track {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}
```

5 critérios de força: `≥6 chars` + `≥8 chars` + `maiúscula` + `número` + `símbolo` = 5/5 (100%)

---

## 🃏 7. Cards

### Card de Conversa

```css
.conv-card {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: var(--radius-input);
  border: 1px solid transparent;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  text-align: left;
  transition: background var(--transition-normal),
              border-color var(--transition-normal),
              transform var(--transition-fast);
}

.conv-card:hover {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-brand);
  transform: translateX(2px);
}

.conv-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 3px;
}

.conv-card-preview {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Card de Ferramenta

```css
.tool-card {
  padding: 16px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.tool-card:hover {
  transform: translateY(-3px);
  border-color: rgba(139, 92, 246, 0.45);
  box-shadow: 0 10px 26px rgba(139, 92, 246, 0.2);
}
```

Ícone do card: `32×32px`, `border-radius: 9px`, BG roxo translúcido.

### Starter (Card de Ação Rápida)

```css
.starter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  backdrop-filter: blur(14px);
  color: var(--color-text-secondary);
  text-align: left;
  animation: fadeInUp 0.5s var(--ease-out-expo) both;
}

.starter:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 8px 22px rgba(139, 92, 246, 0.16);
}
```

---

## 💬 8. Modais

### Painel Modal

```css
.panel {
  position: fixed;
  z-index: 50;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -46%) scale(0.985);
  width: min(640px, calc(100vw - 48px));
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: rgba(16, 11, 26, 0.78);
  backdrop-filter: blur(28px);
  border: 1px solid var(--color-border-brand);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal),
              transform var(--transition-normal) var(--ease-out-expo);
}

.panel.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}
```

### Estrutura do Painel

```
.panel
├── .panel-head
│   ├── .panel-title (h3)
│   └── .panel-close (botão X)
└── .panel-body (scrollável)
```

### Header do Painel

```css
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid var(--color-border);
}
```

### Overlay

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
  z-index: 40;
}

.overlay.is-visible {
  opacity: 1;
  pointer-events: auto;
}
```

### Preview de Imagem

```css
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

.preview-overlay.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.preview-modal {
  max-width: 90vw;
  max-height: 85vh;
}

.preview-content img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 12px 60px rgba(0, 0, 0, 0.6);
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}
```

### Galeria de Imagens

```css
.gallery-modal {
  width: min(900px, calc(100vw - 48px));
  max-height: calc(100vh - 80px);
  background: rgba(16, 11, 26, 0.7);
  border: 1px solid var(--color-border-brand);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.gallery-grid {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}
```

---

## ✨ 9. Animações

### Animações CSS

| Nome | Duração | Easing | Descrição |
|------|---------|--------|-----------|
| `fadeInUp` | `0.5s` | `var(--ease-out-expo)` | Elemento aparece subindo |
| `crownFloat` | `5s` | `ease-in-out` | Coroa flutua suavemente |
| `gradientShift` | `4-6s` | `ease-in-out` | Gradiente do nome "Liz" se move |
| `dotPulse` | `1.3s` | `ease-in-out` | Bolinha de digitação |
| `messageIn` | `0.35s` | `var(--ease-out-expo)` | Mensagem aparece |
| `msgInRight` | `0.35s` | `var(--ease-out-expo)` | Bolha do usuário (da direita) |
| `msgInLeft` | `0.35s` | `var(--ease-out-expo)` | Bolha da Liz (da esquerda) |
| `typingBounce` | `1.3s` | `ease-in-out` | Bolinhas de typing |
| `overlayIn` | `0.25s` | `ease` | Overlay aparece |
| `panelIn` | `0.3s` | `var(--ease-out-expo)` | Painel modal abre |
| `crownTogglePulse` | `0.6s` | `var(--ease-out-expo)` | Coroa "pulsa" ao clique |
| `crownShimmer` | `4s` | `ease-in-out` | Brilho suave na coroa |
| `crownEntrance` | `700ms` | `cubic-bezier(0.22,1,0.36,1)` | Coroa da intro aparece (scale + blur) |
| `lizCrownFloat` | `2.2s` | `ease-in-out` | Coroa flutua na intro |
| `toolCollapse` | `0.4s` | `var(--ease-out-expo)` | Pílulas recolhem |
| `toolExpand` | `0.45s` | `var(--ease-out-expo)` | Pílulas expandem |
| `brandHaloPulse` | `6s` | `ease-in-out` | Halo atrás da coroa pulsa |
| `decoPulse` | `10-15s` | `ease-in-out` | Formas geométricas decorativas |
| `pillEntrance` | `0.5s` | `var(--ease-out-expo)` | Pílulas do menu aparecem (stagger) |

### Easing Curves

| Token | Curva | Sensação |
|-------|-------|----------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Rápido no início, desacelera suavemente |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Efeito mola (overshoot) |

### Staggered Entrance (Menu)

```css
.float-pill:nth-child(1) { animation-delay: 0.05s; }
.float-pill:nth-child(2) { animation-delay: 0.10s; }
.float-pill:nth-child(3) { animation-delay: 0.15s; }
.float-pill:nth-child(4) { animation-delay: 0.20s; }
.float-pill:nth-child(5) { animation-delay: 0.25s; }
```

### Staggered Entrance (Sugestões)

```css
.suggestion:nth-child(1) { animation-delay: 0.10s; }
.suggestion:nth-child(2) { animation-delay: 0.16s; }
.suggestion:nth-child(3) { animation-delay: 0.22s; }
.suggestion:nth-child(4) { animation-delay: 0.28s; }
```

### Animação de Introdução (Coroa)

Um fluxo completo de 750ms com 3 fases:

1. **Entrance** (0-700ms): coroa aparece com scale + blur → nítida
2. **Float** (após 480ms): flutuação suave no centro
3. **Move** (120ms → 750ms): coroa voa para o slot `.hero-crown-slot` via Web Animations API
4. **Reveal** (aos 570ms): interface aparece (180ms antes do fim)
5. **Cleanup** (aos 750ms): elemento da intro é removido do DOM

### Animação do ThemeToggle (Vanilla JS)

Física, via `requestAnimationFrame` (mesma lógica do app.js da tela de login):

```js
const duration = 420  // ms
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
```

### Transição entre Páginas (Login - Vanilla JS)

```css
.page-wrapper.page-exit {
  animation: pageExit 250ms ease-out forwards;
}

.page-wrapper.page-enter {
  animation: pageEnter 300ms ease-out forwards;
}

@keyframes pageExit {
  to { opacity: 0; transform: translateY(-20px); }
}

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Transição de Tema (View Transitions API + fallback)

```js
document.startViewTransition(() => {
  flushSync(() => applyTheme(nextTheme))
})
```

Com fallback para navegadores sem suporte:

```js
if (!document.startViewTransition) {
  // Adiciona classe de morphing + timeout
  root.classList.add('theme-morphing')
  setTimeout(() => root.classList.remove('theme-morphing'), 850)
  applyTheme(nextTheme)
  return
}
```

---

## 🌙 10. Tema Escuro (Padrão)

O tema escuro é o **padrão** e **único renderizado inicialmente** (`data-theme="dark"` no `<html>`).

### Mecanismo de Alternância

1. **localStorage** guarda a preferência: `'liz-chat-theme'` (chat) ou `'liz-theme'` (login)
2. O valor pode ser `'dark'`, `'light'` ou `'auto'` (apenas no chat)
3. No modo `'auto'`, a detecção é via `matchMedia('(prefers-color-scheme: light)')`
4. A troca é feita alterando `data-theme` no `<html>`

### Tokens de Tema Claro

```css
[data-theme="light"] {
  --color-bg-page: #f5f5f7;
  --color-bg-card: rgba(255, 255, 255, 0.7);
  --color-text-primary: #1a1a2e;
  --color-text-secondary: rgba(0, 0, 0, 0.6);
  --color-text-muted: rgba(0, 0, 0, 0.5);
  --color-text-subtle: rgba(0, 0, 0, 0.45);
  --color-border: rgba(0, 0, 0, 0.1);
  --color-border-brand: rgba(139, 92, 246, 0.2);
}
```

### Transition entre temas

```css
html { transition: background 0.35s ease; }

.chat-header,
.floating-menu,
.composer-inner,
.float-pill,
.panel,
.empty-state,
.suggestion,
.starter,
.liz-toast,
.overlay {
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.header-title,
.header-status,
.empty-name,
.empty-subtitle,
.suggestion,
.starter,
.msg-text,
.composer-input,
.panel-title,
.conv-card-title {
  transition: color 0.35s ease;
}
```

---

## 📱 11. Responsividade

### Breakpoints

| Nome | Largura | Alvo |
|------|---------|------|
| Desktop largo | `≥ 1101px` | Layout padrão completo |
| Notebook | `≤ 1100px` | Menu e pílulas menores |
| Tablet | `≤ 860px` | Redução adicional |
| Mobile | `≤ 700px` | Menu vira barra inferior |
| Phone pequeno | `≤ 380px` | Ajustes extremos |

### Comportamento por Breakpoint

#### `≤ 1100px` — Notebook

```css
:root { --float-menu-width: 68px; }
.float-pill { width: 48px; height: 48px; }
```

#### `≤ 860px` — Tablet

```css
:root { --float-menu-width: 62px; }
.float-pill { width: 44px; height: 44px; border-radius: 15px; }
.float-pill-ico { width: 20px; height: 20px; }
.empty-crown { width: 84px; }
.hero-crown-slot { width: 84px; height: 84px; }
.empty-name { font-size: 1.7rem; }
.panel-grid { grid-template-columns: repeat(2, 1fr); }
```

#### `≤ 700px` — Mobile (Principal)

**Menu lateral → barra inferior:**

```css
.floating-menu {
  position: fixed;
  top: auto;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
  flex-direction: row;
  justify-content: space-around;
  gap: 4px;
  padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
  background: rgba(10, 8, 16, 0.8);
  backdrop-filter: blur(24px);
  border-top: 1px solid var(--color-border-brand);
  z-index: 30;
}
```

**Pílulas na horizontal:**

```css
.float-pill {
  width: auto;
  height: auto;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  border-radius: 12px;
  padding: 6px 2px;
  background: transparent;
  border-color: transparent;
  animation: none;
}

.float-pill-label {
  position: static;
  transform: none;
  opacity: 1;
  background: transparent;
  border: none;
  font-size: 0.6rem;
}

.float-pill.is-active::before { display: none; }
```

**Header:**

```css
.header-mobile-btn { display: flex; }
.header-btn { display: none; }
.chat-header { padding: 0 16px; gap: 10px; }
.header-brand-crown { margin-left: 0; margin-right: 8px; width: 24px; height: 24px; }
.header-title { font-size: 0.95rem; }
.header-status-text { max-width: 130px; }
```

**Empty state:**

```css
.empty-crown { width: 72px; margin-bottom: 14px; }
.hero-crown-slot { width: 72px; height: 72px; margin-bottom: 14px; }
.empty-name { font-size: 1.5rem; }
.empty-subtitle { font-size: 0.86rem; }
.empty-state { justify-content: flex-start; padding-top: 24px; min-height: 0; }
```

**Sugestões em scroll horizontal:**

```css
.suggestions { flex-wrap: nowrap; overflow-x: auto; max-width: 100%; }
.suggestion { flex-shrink: 0; }
```

**Starters em coluna única:**

```css
.starters { grid-template-columns: 1fr; max-width: 100%; }
.starter-arrow { display: none; }
```

**Painéis em tela cheia:**

```css
.panel {
  width: 100vw;
  max-height: 100dvh;
  height: 100dvh;
  border-radius: 0;
  top: 0;
  left: 0;
  transform: translateY(100%);
}

.panel.is-open { transform: translateY(0); }
```

**Composer com espaço extra para barra inferior:**

```css
.composer { padding: 8px 12px calc(70px + env(safe-area-inset-bottom)); }
```

**Grid de ferramentas:**

```css
.panel-grid { grid-template-columns: repeat(2, 1fr); }
```

#### `≤ 380px` — Phone Pequeno

```css
.msg-avatar { width: 26px; height: 26px; }
.msg-bubble { padding: 9px 12px; }
.msg-text { font-size: 0.84rem; }
.msg-user { padding-left: 4%; }
.msg-liz { padding-right: 2%; }
.panel-grid { grid-template-columns: 1fr; }
.header-status-text { max-width: 90px; }
```

### Acessibilidade — prefers-reduced-motion

```css
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

Também tratado em **JavaScript** (pula animação de introdução) e **CSS** (tela de login).

---

## 📋 Checklist de UI

| Item | Critério |
|------|----------|
| Cor primária | `#8b5cf6` — roxo padrão |
| Cor secundária | `rgba(255,255,255,0.6)` — texto secundário |
| Glassmorphism | `backdrop-filter: blur(14-28px)`, `background: rgba(...,0.55-0.78)` |
| Botão primário | Gradiente roxo `#8b5cf6 → #7c3aed`, `border-radius: 999px` |
| Botão flat | `border: 1px solid var(--color-border)`, `bg: var(--color-bg-card)` |
| Input | `border-radius: 12px`, padding 11px 14px, foco com `box-shadow` roxo |
| Card | `border-radius: 12px`, `border: 1px solid var(--color-border)` |
| Painel | `border-radius: 24px`, glass blur 28px, `box-shadow: 0 24px 80px` |
| Tema claro | `[data-theme="light"]` com bg `#f5f5f7`, texto `#1a1a2e` |
| Mobile | Menu vira barra inferior, painéis em tela cheia |
| Animação reduzida | `@media (prefers-reduced-motion: reduce)` |
