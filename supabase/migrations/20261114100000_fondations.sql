-- Étape 3 — Fondations : les 4 tables de la V1 (cahier des charges, section 6).
-- Règle : chaque table a la Row Level Security active et chaque utilisateur ne voit que ses données.

-- ─── profiles : profil et réglages, une ligne par compte ───────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  native_language text not null default 'fr',
  target_language text not null default 'en',
  partner_id text not null default 'leo' check (partner_id in ('leo', 'marcus')),
  accent text not null default 'us' check (accent in ('us', 'uk')),
  level text check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  level_source text check (level_source in ('test', 'declare')),
  goal text check (goal in ('travail', 'voyage', 'examen', 'plaisir', 'autre')),
  goal_note text not null default '' check (char_length(goal_note) <= 500),
  voice_speed text not null default 'normale' check (voice_speed in ('lente', 'normale', 'rapide')),
  default_input text not null default 'voix' check (default_input in ('voix', 'texte')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── sessions : une conversation (ou plus tard une leçon) ─────────────────────
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  mode text not null default 'conversation' check (mode in ('conversation', 'teacher', 'level_test')),
  topic text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  summary text
);
create index sessions_user_started_idx on public.sessions (user_id, started_at desc);

-- ─── messages : chaque tour de parole ─────────────────────────────────────────
-- user_id est recopié ici pour une règle RLS simple et rapide (pas de jointure).
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 2000),
  input_type text not null default 'text' check (input_type in ('voice', 'text')),
  created_at timestamptz not null default now()
);
create index messages_session_created_idx on public.messages (session_id, created_at);
create index messages_user_idx on public.messages (user_id);

-- ─── usage_daily : quotas et suivi des coûts ──────────────────────────────────
-- Écrit uniquement par le serveur (Edge Function, étape 4) : l'app peut lire, pas modifier.
create table public.usage_daily (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default current_date,
  sessions_count integer not null default 0,
  seconds_used integer not null default 0,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  primary key (user_id, day)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.usage_daily enable row level security;

create policy "Lire son profil" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Modifier son profil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Lire ses sessions" on public.sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Créer ses sessions" on public.sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Modifier ses sessions" on public.sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Lire ses messages" on public.messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Écrire ses messages" on public.messages
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  );

create policy "Lire sa consommation" on public.usage_daily
  for select to authenticated using ((select auth.uid()) = user_id);

-- Les colonnes que l'app n'a pas à toucher restent hors de portée, même sur son propre profil.
revoke update on public.profiles from authenticated, anon;
grant update (
  partner_id, accent, level, level_source, goal, goal_note, voice_speed, default_input, onboarded_at
) on public.profiles to authenticated;

-- ─── Automatismes ─────────────────────────────────────────────────────────────
-- Un profil vide est créé à l'inscription ; l'onboarding le remplit ensuite.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Suppression du compte depuis l'app (exigence RGPD) : efface l'utilisateur,
-- et par cascade son profil, ses sessions, ses messages et sa consommation.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
