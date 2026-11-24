-- Correctif de l'étape 3b.
--
-- `profiles` restreint l'écriture colonne par colonne (voir la migration des fondations :
-- `revoke update ... grant update (liste) ...`). `native_language` ne figurait pas dans
-- cette liste : l'app changeait bien la langue à l'écran, mais l'enregistrement était
-- refusé par la base. La langue serait donc revenue en arrière au redémarrage.
--
-- Leçon : toute nouvelle colonne que l'app doit écrire doit être ajoutée ici.
-- `target_language` reste volontairement en lecture seule : une seule langue est
-- proposée à l'apprentissage pour l'instant.

grant update (native_language) on public.profiles to authenticated;
