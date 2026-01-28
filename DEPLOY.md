# 🚀 Como Fazer o Deploy do ANTIGRAVITY

O deploy mais simples e recomendado é via **Vercel** (criadores do Next.js).

## 1. Pré-requisitos
- Conta no [GitHub](https://github.com) (onde seu código já está).
- Conta na [Vercel](https://vercel.com) (gratuita).
- Projeto criado no [Supabase](https://supabase.com) (que já fizemos).

## 2. Passo a Passo na Vercel

1. **Acesse a Vercel:**
   Faça login e clique em **"Add New..."** > **"Project"**.

2. **Importe o Repositório:**
   Encontre o projeto `ferramenta-antigravity` na lista e clique em **Import**.

3. **Configure o Projeto:**
   - **Framework Preset:** Next.js (já deve vir selecionado).
   - **Root Directory:** Deixe vazio (ou `./` se aparecer).

4. **Variáveis de Ambiente (CRÍTICO):**
   Vá na seção **"Environment Variables"** e adicione as duas chaves que estão no seu arquivo local `.env.local`:

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | *Sua URL do Supabase* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Sua Anon Key do Supabase* |

   > ⚠️ Sem isso, o login e o banco de dados NÃO funcionarão na produção.

5. **Deploy:**
   Clique em **Deploy**. A Vercel vai baixar o código, instarlar dependências, rodar o build (que já testamos e passou ✅) e publicar.

## 3. URLs do Supabase (Redirecionamento)

Depois que o site estiver no ar (ex: `https://antigravity-xyz.vercel.app`), você precisa avisar o Supabase que essa URL é segura para login.

1. Vá no seu Painel do Supabase.
2. Acesse **Authentication > URL Configuration**.
3. Em **Site URL**, coloque a URL final da Vercel (ex: `https://antigravity-xyz.vercel.app`).
4. Em **Redirect URLs**, adicione:
   - `https://antigravity-xyz.vercel.app/auth/callback`
   - `https://antigravity-xyz.vercel.app/**`

## 4. Teste Final
Acesse seu site na URL pública.
- O login deve funcionar.
- Seus dados devem carregar (pois estão na nuvem Supabase).
- A velocidade deve ser instantânea.

---
*Se tiver problemas, verifique os Logs na Vercel.*
