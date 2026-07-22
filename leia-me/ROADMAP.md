# ROADMAP — Liz AI

## ✅ Implementado e Melhorado

### Ajustes (Configurações)
- ~~Geral (tema claro/escuro, notificações, histórico)~~ ✅
- ~~Atalho de teclado~~ ✅
- ~~Memória~~ ✅
- ~~Conta~~ ✅

### Galeria
- ~~Modal de galeria com grid~~ ✅
- ~~Preview de imagens com download~~ ✅
- ~~Upload para galeria (projetos)~~ ✅
- ~~Histórico de uploads~~ ✅
- ~~Deletar mídia da galeria~~ ✅

### Ferramentas
- ~~Painel com grid de cards~~ ✅
- ~~Ícones SVG em cada card~~ ✅
- ~~Click preenche input do chat~~ ✅

### Animações (REFINADAS 🎯)
- ~~Animação da coroa (crownFloat)~~ ✅ → **Mais orgânica** (5 keyframes)
- ~~Pulse ao clicar na coroa (crownTogglePulse)~~ ✅ → **Pico mais dramático** (1.32x)
- ~~Shimmer da coroa (crownShimmer)~~ ✅ → **Mais suave** (5 keyframes)
- ~~Animação de introdução da coroa~~ ✅ → **Multi-keyframe com overshoot + glow progressivo**
- ~~Botão X ao fechar (closeBtnSpin)~~ ✅ → **Overshoot + opacity + transform-origin**
- ~~Pílulas colapsando (toolCollapse/toolExpand)~~ ✅ → **Curvas mais suaves**
- ~~Click nas pílulas (pillClick)~~ ✅ → **Spring natural com 6 keyframes**
- ~~Painel fechando (panelOut)~~ ✅ → **Mais dramático**
- ~~Botão de tema (theme toggle)~~ ✅ → **Scale bounce no clique**

## 🔄 Pendente

### Mobile (intercell.html)
- [x] Redesign completo "Aurora Glass" — tokens unificados com desktop ✅
- [x] Background aurora com gradientes radiais + grid sutil ✅
- [x] Header glass com coroa breathing glow ✅
- [x] Dock de ferramentas flutuante com glassmorphism ✅
- [x] Composer flutuante com blur e glow ✅
- [x] Empty state com coroa breathing + anéis pulsantes ✅
- [x] Mensagens "glass river" com bolhas translúcidas ✅
- [x] Modal glass com spring animation ✅
- [x] Projetos com cards glass e filtros ✅
- [x] Tema claro completo ✅
- [x] prefers-reduced-motion ✅
- [ ] Animação de introdução da coroa (como no desktop)
- [ ] Haptic feedback (vibração) em ações
- [ ] Pull-to-refresh no chat
- [ ] Swipe gestures para navegação

### Galeria
- [ ] Unificar as duas galerias (modal + painel de projetos)
- [ ] Criar entrada/botão na UI para a galeria modal
- [ ] Melhorar transições entre imagens no preview
- [ ] Feedback visual de loading durante upload

### Ferramentas
- [ ] Dar funcionalidade real aos cards (não só preencher input)
- [ ] Adicionar descrições às ferramentas
- [ ] Feedback visual ao clicar no card
- [ ] Categorias e busca

### Geral
- [ ] Integrar tela de login React ao chat vanilla
- [ ] Substituir dados mockados por API real
- [ ] Adicionar testes
