-- Étape 3b — L'app est faite pour des utilisateurs du monde entier.
--
-- `native_language` valait « fr » par défaut : un compte créé depuis Tokyo naissait donc
-- en français, et l'interface basculait en français dès la première lecture du profil.
--
-- Désormais `null` signifie « pas encore choisie » : l'app suit alors la langue de
-- l'appareil, et n'enregistre une valeur que lorsque l'utilisateur confirme son choix
-- (premier écran de l'onboarding, ou réglages).
--
-- Le déclencheur `handle_new_user` fait `insert into public.profiles (id)` et s'appuie
-- sur les valeurs par défaut : retirer le défaut suffit, rien à changer côté déclencheur.

alter table public.profiles alter column native_language drop default;
alter table public.profiles alter column native_language drop not null;

-- Les lignes existantes gardent « fr » : ces comptes de test sont bien francophones.
