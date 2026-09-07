# Roadmap

Où on en est et ce qui vient ensuite. Une étape à la fois : chaque étape doit
fonctionner de bout en bout avant de passer à la suivante.

Chaque étape a son ticket sur GitHub, avec les cases à cocher :
[#1](https://github.com/Prodigexcellence/english-conversation-app/issues/1) ·
[#2](https://github.com/Prodigexcellence/english-conversation-app/issues/2) ·
[#3](https://github.com/Prodigexcellence/english-conversation-app/issues/3) ·
[#4](https://github.com/Prodigexcellence/english-conversation-app/issues/4) ·
[#5](https://github.com/Prodigexcellence/english-conversation-app/issues/5)

## ✅ Étape actuelle — Squelette texte (fait)

- Projet Expo initialisé (SDK 57).
- Edge Function `chat` qui appelle l'API Claude avec le prompt système validé.
- Écran de chat : l'IA ouvre la conversation, on répond, elle relance.
- Clé API Claude stockée uniquement dans les secrets Supabase.

Ce qui est volontairement **figé** pour l'instant, dans `src/config.ts` :
langue maternelle `French`, niveau `A2`, sujets récents `none yet`.

## Étape suivante — Vérifier le comportement de l'IA

Avant d'ajouter quoi que ce soit : discuter 10–15 minutes avec l'app et vérifier que
le comportement voulu tient dans une vraie conversation.

- [ ] Est-ce qu'elle relance systématiquement, sans jamais rester passive ?
- [ ] Est-ce qu'elle évite de répéter la même question ?
- [ ] Est-ce que les corrections restent discrètes (reformulation, pas leçon de grammaire) ?
- [ ] Est-ce que les réponses restent courtes (1–3 phrases) ?

Si quelque chose cloche, on ajuste le prompt système dans
`supabase/functions/chat/index.ts` — pas le reste du code.

## Étape 3 — Sauvegarder les conversations

- [ ] Tables Postgres : `profiles`, `conversations`, `messages`.
- [ ] Authentification Supabase (email ou connexion anonyme pour commencer).
- [ ] Row Level Security : chacun ne lit que ses propres conversations.
- [ ] L'app recharge la conversation en cours au lancement.

## Étape 4 — Profil utilisateur dynamique

- [ ] Écran de réglages : langue maternelle, niveau CEFR.
- [ ] Les `{native_language}` / `{level}` / `{recent_topics}` du prompt viennent de la base
      au lieu des valeurs figées de `src/config.ts`.
- [ ] Sujets récents calculés à partir des dernières conversations.

## Étape 5 — La voix

- [ ] Enregistrement micro dans l'app (`expo-audio`).
- [ ] Transcription (speech-to-text) côté Edge Function.
- [ ] Lecture audio de la réponse (text-to-speech).
- [ ] Mode « mains libres » : on parle, elle répond à voix haute.

## Plus tard

- Historique et statistiques de pratique.
- Fiches des erreurs récurrentes.
- Thèmes de conversation suggérés.
