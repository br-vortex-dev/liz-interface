# Backup do Projeto Liz → GitHub

## Repositório

- **URL:** https://github.com/br-vortex-dev/liz-interface
- **Visibilidade:** Privado
- **Branch:** master

## Como fazer backup (a cada pedido do usuário)

Quando o usuário pedir "faz backup" ou "salva no GitHub", rodar:

```bash
cd "C:/Users/User/Downloads/importante/interface ideia 2"
git add -A
git commit -m "backup: <descrição curta do que mudou>"
git push
```

Se não houver mudanças, o `git commit` vai avisar "nothing to commit" — nesse caso só informar que já está atualizado.

## Se der erro de autenticação

```bash
export PATH="$PATH:/c/Program Files/GitHub CLI"
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
- O repo é privado — só o dono (br-vortex-dev) tem acesso.
