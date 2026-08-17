# Backup do Projeto Liz → GitHub

## Repositórios

| Repositório | URL | Conteúdo | Visibilidade | Branch |
|---|---|---|---|---|
| `liz-interface` (origin) | https://github.com/br-vortex-dev/liz-interface | Projeto completo (backend/ + frontend/ + leia-me/) | Público | main |
| `liz-backend` | https://github.com/br-vortex-dev/liz-backend | Somente a pasta backend/ (usado pelo Render) | Público | main |

## Como fazer backup (a cada pedido do usuário)

Quando o usuário pedir "faz backup" ou "salva no GitHub", rodar:

```bash
cd "c:\Users\Administrator\Downloads\interface ideia 2"
git add -A
git commit -m "backup: <descrição curta do que mudou>"
git push origin main
```

Se o backup incluir mudanças na pasta `backend/`, sincronizar também o repo solo do backend:

```bash
git subtree push --prefix=backend liz-backend main
```

Se não houver mudanças, o `git commit` vai avisar "nothing to commit" — nesse caso só informar que já está atualizado.

## Se der erro de autenticação

```powershell
gh auth status
# Se não estiver logado:
gh auth login --web
```

## Histórico de backups

```bash
git log --oneline -10
```

## Notas

- O backup NÃO é automático — só roda quando o usuário pedir.
- Sempre usar mensagem de commit descritiva (o que mudou).
- Nunca commitar segredos: `backend/.env` e `*.sqlite` já estão no `.gitignore`.

