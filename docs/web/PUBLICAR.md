# Publicar o DataHub na web (Vercel + Supabase, planos gratuitos)

Decisão de 23/10/2026 (`docs/agentes/DECISOES.md`). Este guia é o que **você** faz nas contas;
o código é preparado pelo agente.

## 1. Vercel (hospedagem do site)

1. Crie a conta em <https://vercel.com/signup> entrando com o GitHub.
2. **Add New → Project** e escolha o repositório `SEDUC---DataHub` (funciona também se ele for privado).
3. A Vercel lê o `vercel.json` da raiz: build `npm run build`, saída `dist`. Não mude nada e clique em **Deploy**.
4. Cada push na `main` publica de novo; cada branch ganha um endereço de prévia.

Atenção: o plano Hobby é para uso **não comercial**. Se a SEDUC adotar o sistema oficialmente,
avalie o plano Pro.

## 2. Supabase (login, perfil e logs) — será usado a partir da fase F2

1. Crie a conta em <https://supabase.com> e um **New project**:
   - **Region:** South America (São Paulo).
   - Guarde a senha do banco num lugar seguro (não envie para ninguém).
2. Em **Project Settings → API**, copie:
   - **Project URL** (ex.: `https://xxxx.supabase.co`);
   - a chave **anon / publishable** (pode ir para o front).
   - **Nunca** copie nem envie a chave `service_role` / secret.
3. Na Vercel, em **Settings → Environment Variables**, crie:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = chave anon/publishable
   Marque os três ambientes (Production, Preview, Development) e faça um **Redeploy**: o Vite
   lê as variáveis no build. Sem elas, o site abre em **modo local** (sem login).
4. **Tabelas e regras de acesso (F2):** em **SQL Editor → New query**, cole todo o conteúdo de
   `supabase/migrations/0001_perfis_e_acesso.sql` e clique em **Run**. Pode rodar de novo sem
   problema. Ele cria:
   - a recusa, no banco, de qualquer cadastro fora de `@edu.mt.gov.br`;
   - a tabela `perfis` (nome e caminho da foto), em que cada pessoa só vê e altera o próprio;
   - o bucket privado `fotos-perfil` (JPEG até 1 MB, cada pessoa só na própria pasta).
5. **Endereços de retorno dos e-mails:** em **Authentication → URL Configuration**:
   - **Site URL:** o endereço do site na Vercel (ex.: `https://seduc-datahub.vercel.app`);
   - **Redirect URLs:** o mesmo endereço e `http://localhost:5173` (para testar no computador).
   Sem isso, o link de confirmação e o de "Esqueci a senha" voltam para o lugar errado.
6. **Confirmação de e-mail:** deixe ligada (**Authentication → Sign In / Providers → Email →
   Confirm email**). Assim só entra quem tem acesso à caixa `@edu.mt.gov.br`.

O envio de e-mails do plano gratuito tem **limite baixo** (poucos por hora). Se várias pessoas se
cadastrarem ao mesmo tempo e os e-mails não chegarem, configure um SMTP próprio em
**Authentication → Emails → SMTP Settings**.

### Testar no computador (Codespaces ou local)

Crie `.env.development.local` (não vai para o git) com as duas variáveis do `.env.example` e rode
`npm run dev`. Os testes automáticos (`npm test` e Playwright) não leem esse arquivo e rodam
sempre em modo local.

O projeto gratuito do Supabase **pausa depois de 1 semana sem uso**; para reativar, abra o painel
do projeto e clique em **Restore**.

## Privacidade

As planilhas são processadas **no navegador** e nunca são enviadas ao servidor. No Supabase ficam
só o perfil (nome e foto), a conta e os logs (sem valores de células).
