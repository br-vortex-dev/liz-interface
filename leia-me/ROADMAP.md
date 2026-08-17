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
- API layer com fallback offline (frontend/js/api.js)
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

### Mobile (frontend/mobile/index.html)
- Versao mobile paralela com tema, chat e mural
- Anexos no chat mobile (botao de anexo + fluxo completo)
- Modais proprios (substituem prompt/confirm nativos)
- Botao Parar geracao no composer

### Backend (pasta backend/)
- Servidor Express (estrutura em camadas) — porta padrão 3000, dev usa 3001 (scripts/dev-all.js)
  - server.js — ponto de entrada, middlewares de seguranca, boot gracioso
  - config/database.js — Sequelize (Postgres via DATABASE_URL em producao, SQLite em dev)
  - models/conversation.js, models/message.js
  - services/chatService.js — valida entrada, garante conversa, chama IA, persiste
  - services/historyService.js — listagem e historico com paginacao
  - routes/chatRoutes.js — endpoints HTTP (inclui /api/firebase-config servido do .env)
- Rotas: /api/health, /api/conversations (CRUD + pin), /api/conversations/:id/messages, /api/chat/send
- Persistencia real (Sequelize) de conversas e mensagens
- Integracao com IA real: Liz 3 via nuvem-liz-proxy.fly.dev (OpenAI-compatível, sem chave)
  - modelo de raciocínio: orçamento de tokens dobrado + timeout de 120s quando a resposta vem vazia
- Modo demo honesto (demo: true no payload) apenas quando nao ha provedor configurado
- Seguranca: helmet, CORS por origem, rate limit global e por rota de chat, validacao rigorosa (UUID, tamanhos, enums), erros sem vazamento interno
- Testes: backend/tests/backend-api.test.js (23 testes de integracao — normal, borda, erro) via node:test
- Testes: frontend/test/frontend.test.js (8 testes de logica pura) + frontend/tests/p0.test.js
- E2E validado: mensagem -> /api/chat/send -> resposta persistida no banco e no localStorage

### Autenticacao (frontend/tela-login-html/)
- Tela de login/cadastro separada do chat, com identidade visual propria (coroa, frases rotativas)
- Firebase Auth: e-mail/senha (login e criacao de conta separados) e Google
- Login Google via fluxo OAuth direto (sem popup) — compatível com Brave e mobile
- Perfil salvo no Firestore (users/{uid}); config do Firebase vem do backend (/api/firebase-config), nada hardcoded
- XSS prevenido: nomes e conteudo escapados antes de innerHTML

### Deploy (nuvem)
- Frontend: Cloudflare Pages — dominio oficial https://lizia.qzz.io (login na raiz, chat em /chat/)
- Backend: Render — https://liz-api.onrender.com (repo liz-backend)
- Banco: Neon Postgres (regiao Sao Paulo) via DATABASE_URL
- Build de publicacao: frontend/scripts/build-frontend.js (cache-bust automatico + bump do service worker)

## Pendente

### Produto
- [ ] Integrar sessao do login ao chat (mostrar usuario logado, proteger /chat/, logout)
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
# Tudo junto (dev): frontend na 8321 + backend na 3001
node scripts/dev-all.js

# Backend (terminal 1) — API na porta 3001 (o frontend local espera essa porta)
cd backend
npm install
set PORT=3001 && npm start    # cmd; no PowerShell: $env:PORT=3001; npm start

# Frontend (terminal 2) — servidor estatico proprio na porta 8321
cd frontend
node scripts/serve.js          # http://localhost:8321 (login em /tela-login-html/)

# Testes
cd backend && npm test         # 23 testes de integracao
cd frontend && npm test        # logica pura + p0

# Publicar frontend na nuvem (Cloudflare Pages)
cd frontend
node scripts/build-frontend.js
npx wrangler pages deploy public --project-name liz --branch main
```

## Decisoes de arquitetura

- **Projeto separado em backend/ e frontend/**: o backend (API Express) e o frontend (site estatico) vivem em pastas independentes, com package.json proprios. O repo `liz-backend` publica so o backend no GitHub (usado pelo Render); o frontend e publicado no Cloudflare Pages.
- **Mobile separado**: versao mobile em pasta propria (frontend/mobile/) com redirect automatico. Nao e responsivo — e uma versao paralela. Motivo: alteracoes no desktop quebravam a responsividade, separar isola a manutencao.
- **Sem bundler no frontend**: projeto vanilla JS puro, scripts carregados em ordem no HTML. Decisao valida para prototipo; reavaliar se crescer.
- **Backend em camadas**: routes -> services -> models, sem regra de negocio em rota. Estrutura fixa: server.js, config/, models/, services/, routes/.
- **Dialeto duplo**: Postgres (DATABASE_URL) e o alvo de producao (Neon); SQLite permite dev local sem banco instalado. Models e services sao identicos nos dois.
- **Config do Firebase nunca hardcoded**: o frontend busca em /api/firebase-config (backend serve do .env).
- **Modo demo explicito**: sem AI_API_URL o backend responde localmente e marca demo: true — o frontend nunca finge que houve IA de verdade.
- **Persistencia dupla por enquanto**: conversas vao para o backend E para o localStorage (historico local). Unificar quando a sessao do login for integrada ao chat.
