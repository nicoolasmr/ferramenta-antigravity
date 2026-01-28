# Configuração do Supabase (ANTIGRAVITY)

Para ativar a autenticação e sincronização, siga os passos abaixo:

## 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a senha do banco de dados (não será usada diretamente no app, mas é bom ter).

## 2. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto (`ferramenta-antigravity/`) e adicione:

```bash
NEXT_PUBLIC_SUPABASE_URL= sua_url_do_projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY= sua_chave_anon_publica
```

*Você encontra esses dados em Project Settings > API.*

## 3. Banco de Dados (SQL)
1. Vá até o **SQL Editor** no painel do Supabase.
2. Crie uma "New Query".
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql` (que criei no projeto).
4. Clique em **Run**.

Isso criará as tabelas:
- `profiles`
- `preferences`
- `daily_checks`
- `weekly_plans`
- `impact_logs`
- `dismissed_alerts`

E configurará as políticas de segurança (RLS - Row Level Security) para que cada usuário veja apenas seus dados.

## 4. Autenticação
1. Vá até **Authentication > Providers**.
2. Garanta que **Email** está habilitado.
3. (Opcional) Desabilite "Confirm email" em *Authentication > Providers > Email* se quiser login imediato sem verificar email (bom para testes).

## 5. Rodar o App
```bash
npm run dev
```
Acesse `http://localhost:3000`.
- Se não estiver logado, você será redirecionado para `/login`.
- Crie uma conta ou faça login.
- Seus dados serão sincronizados automaticamente ao salvar.
