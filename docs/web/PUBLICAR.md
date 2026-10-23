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
4. Quando o agente preparar as tabelas, rode o arquivo SQL indicado em **SQL Editor** do Supabase.

O projeto gratuito do Supabase **pausa depois de 1 semana sem uso**; para reativar, abra o painel
do projeto e clique em **Restore**.

## Privacidade

As planilhas são processadas **no navegador** e nunca são enviadas ao servidor. No Supabase ficam
só o perfil (nome e foto), a conta e os logs (sem valores de células).
