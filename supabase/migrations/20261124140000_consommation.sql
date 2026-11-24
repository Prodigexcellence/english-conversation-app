-- Étape 4a — Comptage de la consommation, écrit uniquement par la fonction serveur.
--
-- L'app n'a que le droit de LIRE `usage_daily` (voir les fondations) : seules ces
-- fonctions, appelées par la fonction serveur avec la clé de service, l'alimentent.
--
-- Le jour est explicitement celui d'UTC. « Par jour » doit vouloir dire la même chose
-- pour un utilisateur à Tokyo et un autre à São Paulo, sinon un plafond quotidien se
-- remet à zéro à des moments différents selon le fuseau du serveur.

create function public.add_usage(p_user uuid, p_tokens_in integer, p_tokens_out integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usage_daily as u (user_id, day, tokens_in, tokens_out)
  values (p_user, (now() at time zone 'utc')::date, greatest(p_tokens_in, 0), greatest(p_tokens_out, 0))
  on conflict (user_id, day) do update
    set tokens_in = u.tokens_in + excluded.tokens_in,
        tokens_out = u.tokens_out + excluded.tokens_out;
end;
$$;

create function public.add_session_count(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usage_daily as u (user_id, day, sessions_count)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update
    set sessions_count = u.sessions_count + 1;
end;
$$;

-- Personne d'autre que le serveur ne peut faire avancer les compteurs.
revoke execute on function public.add_usage(uuid, integer, integer) from public, anon, authenticated;
revoke execute on function public.add_session_count(uuid) from public, anon, authenticated;
grant execute on function public.add_usage(uuid, integer, integer) to service_role;
grant execute on function public.add_session_count(uuid) to service_role;
