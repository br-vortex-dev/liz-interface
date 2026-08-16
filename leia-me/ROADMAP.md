# ROADMAP — Liz AI

## Implementado

### Frontend (desktop)
- Interface de chat (vanilla JS, sem framework)
- Tema dark/light/auto com toggle animado (view transitions)
- Modos de conversa (Codigo, Design, Erros, Ideias) com starters contextuais
- Seletor de modelos (Nable 3.5, Nable 3.5 Mini, Liz 3 Flash, Liz 3)
- Menu flutuante lateral com acoes (Novo, Conversas, Mural, Ajustes)
- Painel de conversas com busca, fixar, renomear, excluir (por id, sem colisao de titulo)
- Mural de arquivos: filtros, ordenacao, visualizador de imagem com zoom, leitor de texto/PDF
- Menu de contexto do mural funcional (abrir, renomear, baixar, compartilhar, copiar, excluir)
- Upload com progresso e botao de cancelar
- Galeria de imagens com preview modal
- Modo foco
- Animacao de intro com coroa
- API layer com fallback offline (js/api.js)
- Anexos no chat com preview e drag & drop
- Acessibilidade: navegacao por teclado, ARIA, contraste
- Respostas do backend renderizadas no chat
- Lock de geracao (uma resposta por vez) + botao Parar geracao
- Regenerar resposta (botao Refazer) e Continuar resposta
- Copiar resposta, editar mensagem enviada, excluir mensagem
- Exportar conversa como Markdown
- Atalhos de teclado (Ctrl+N, Ctrl+E, Ctrl+F, /)
- PWA (manifest.json + service worker com cache offline)
- Reacoes com icones SVG (sem emoji)
- Ajustes: sugestoes, timestamp, animacoes e brilho aplicados em tempo real
- Ajustes: nome do usuario e email persistidos (sem dados hardcoded)
- Ajustes: contadores reais de historico/arquivos e medidor real de uso do localStorage

### Mobile (mobile/index.html)
- Versao mobile paralela com tema, chat e mural
- Anexos no chat mobile (botao de anexo + fluxo completo)
- Modais proprios (substituem prompt/confirm nativos)
- Botao Parar geracao no composer

### Backend (pasta backend/)
- Servidor Express em localhost:3000 (estrutura em camadas)
  - server.js — ponto de entrada, middlewares de seguranca, boot gracioso
  - config/database.js — Sequelize (Postgres em producao, SQLite em dev via DB_DIALECT)
  - models/conversation.js, models/message.js
  - services/chatService.js — valida entrada, garante conversa, chama IA, persiste
  - services/historyService.js — listagem e historico com paginacao
  - routes/chatRoutes.js — endpoints HTTP
- Rotas: /api/health, /api/conversations (CRUD + pin), /api/conversations/:id/messages, /api/chat/send
- Persistencia real (Sequelize) de conversas e mensagens
- Integracao com IA real: Liz 3 via nuvem-liz-proxy.fly.dev (OpenAI-compatível, sem chave)
  - modelo de raciocínio: orçamento de tokens dobrado + timeout de 120s quando a resposta vem vazia
- Modo demo honesto (demo: true no payload) apenas quando nao ha provedor configurado
- Seguranca: helmet, CORS por origem, rate limit global e por rota de chat, validacao rigorosa (UUID, tamanhos, enums), erros sem vazamento interno
- Testes: backend/test/api.test.js (23 testes de integracao — normal, borda, erro) via node:test
- Testes: test/frontend.test.js (8 testes de logica pura) via node:test
- E2E validado: mensagem -> /api/chat/send -> resposta persistida no banco e no localStorage

## Pendente

### Produto
- [ ] Autenticacao de usuario (integrar tela de login ao chat)
- [ ] Planos de uso (cotas por modelo, upgrade)
- [ ] Upload de arquivos via API (/api/chat/upload)
- [ ] Streaming real de respostas (SSE) em vez de resposta unica
- [ ] Compartilhar conversa por link

### Mobile
- [ ] Animacao de introducao da coroa (como no desktop)
- [ ] Haptic feedback (vibracao) em acoes
- [ ] Pull-to-refresh no chat
- [ ] Swipe gestures para navegacao

### Ferramentas
- [ ] Dar funcionalidade real aos cards (nao so preencher input)
- [ ] Adicionar descricoes as ferramentas
- [ ] Feedback visual ao clicar no card
- [ ] Categorias e busca

### Prompts salvos do usuario
- [ ] Permitir criar atalhos de prompt personalizados
- [ ] Salvar em localStorage
- [ ] UI pra gerenciar (criar, editar, excluir)

### Divida tecnica
- [ ] Dividir chat.js (40KB+) em modulos menores quando for editado
- [ ] Dividir mural.css (33KB) em partes menores quando for editado
- [ ] Trocar prompt/confirm restantes no desktop por modais proprios

## Como rodar

```bash
# Backend (terminal 1)
cd backend
npm install
npm start          # sobe em http://localhost:3000

# Frontend (terminal 2) — qualquer servidor estatico na raiz
npx http-server -p 5173 .

# Testes
cd backend && npm test     # 23 testes de integracao
node --test test/frontend.test.js
```

## Decisoes de arquitetura

- **Mobile separado**: versao mobile em pasta propria (mobile/) com redirect automatico. Nao e responsivo — e uma versao paralela. Motivo: alteracoes no desktop quebravam a responsividade, separar isola a manutencao.
- **Sem bundler no frontend**: projeto vanilla JS puro, scripts carregados em ordem no HTML. Sem package.json na raiz. Decisao valida para prototipo; reavaliar se crescer.
- **Backend em camadas**: routes -> services -> models, sem regra de negocio em rota. Estrutura fixa: server.js, config/, models/, services/, routes/.
- **Dialeto duplo**: Postgres e o alvo de producao; SQLite (DB_DIALECT=sqlite) permite dev local sem banco instalado. Models e services sao identicos nos dois.
- **Modo demo explicito**: sem AI_API_URL o backend responde localmente e marca demo: true — o frontend nunca finge que houve IA de verdade.
- **Persistencia dupla por enquanto**: conversas vao para o backend E para o localStorage (historico local). Unificar quando houver autenticacao.
