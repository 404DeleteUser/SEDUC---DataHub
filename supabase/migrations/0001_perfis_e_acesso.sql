-- DataHub SEDUC-MT · F2: acesso só @edu.mt.gov.br, perfis e fotos.
-- Rode uma vez no Supabase: SQL Editor → New query → cole este arquivo → Run.
-- É idempotente: pode rodar de novo sem duplicar nada.

-- 1. Só e-mails institucionais podem criar conta (vale também para convites e para a API).
create or replace function public.exigir_email_institucional()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or lower(new.email) not like '%@edu.mt.gov.br' then
    raise exception 'Use seu e-mail institucional (@edu.mt.gov.br).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists exigir_email_institucional on auth.users;
create trigger exigir_email_institucional
  before insert or update of email on auth.users
  for each row execute function public.exigir_email_institucional();

-- 2. Perfil: nome e caminho da foto. Uma linha por conta, criada no cadastro.
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '' check (char_length(nome) <= 80),
  foto_caminho text check (foto_caminho is null or foto_caminho like id::text || '/%'),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "perfil: ler o próprio" on public.perfis;
create policy "perfil: ler o próprio" on public.perfis
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "perfil: alterar o próprio" on public.perfis;
create policy "perfil: alterar o próprio" on public.perfis
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists criar_perfil on auth.users;
create trigger criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- 3. Fotos: bucket privado; cada conta só mexe na própria pasta (<id>/...).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-perfil', 'fotos-perfil', false, 1048576, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

drop policy if exists "foto: ler a própria" on storage.objects;
create policy "foto: ler a própria" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto: enviar a própria" on storage.objects;
create policy "foto: enviar a própria" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto: trocar a própria" on storage.objects;
create policy "foto: trocar a própria" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "foto: apagar a própria" on storage.objects;
create policy "foto: apagar a própria" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);
