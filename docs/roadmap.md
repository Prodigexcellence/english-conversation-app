# Roadmap

## ⏸️ Projet en pause depuis le 14 septembre 2026

Mis en pause au profit d'un prototype de la même app démarré sur un outil no-code, à
finir et faire tester en premier. Rien n'est perdu — état exact ci-dessous.

**Ce qui tourne déjà, sans rien à refaire :**
- Le code est poussé sur la branche `claude/mobile-app-github-project-fj79b2`.
- L'Edge Function `chat` est **déployée et active** sur le projet Supabase
  « Prodigexcellence's Project » (eu-west-1). Elle y reste, le plan gratuit ne
  l'expire pas tant que le projet est actif.

**Le seul point resté ouvert :** le secret `ANTHROPIC_API_KEY` n'est pas posé.
Sans lui, la fonction répond `500 Server not configured` — c'est le comportement
attendu, pas une panne.

**Pour reprendre, dans l'ordre :**
1. Créer une clé sur console.anthropic.com et la poser dans
   Supabase → Edge Functions → Secrets, sous le nom `ANTHROPIC_API_KEY`.
2. Créer un fichier `.env` à la racine (voir `.env.example`) avec l'URL du projet
   Supabase et la clé publique — les deux se trouvent dans
   Supabase → Project Settings → API.
3. `npm install` puis `npm start`, scanner le QR code avec Expo Go.
4. Reprendre à l'étape 4 ci-dessous : valider le comportement de l'IA.

Un enseignement du prototype no-code vaudra mieux que n'importe quelle décision prise
ici dans le vide : ce qui en ressortira devra remonter dans le plan de conception avant
de reprendre le code.

---

Suit la roadmap du [plan de conception](plan-conception.md) (section 10). Une étape à la
fois : chaque étape doit fonctionner de bout en bout avant de passer à la suivante.

Tickets GitHub :
[#1](https://github.com/Prodigexcellence/english-conversation-app/issues/1) ·
[#2](https://github.com/Prodigexcellence/english-conversation-app/issues/2) ·
[#3](https://github.com/Prodigexcellence/english-conversation-app/issues/3) ·
[#4](https://github.com/Prodigexcellence/english-conversation-app/issues/4) ·
[#5](https://github.com/Prodigexcellence/english-conversation-app/issues/5)

## ✅ 1. Conception

Document de cadrage validé : [`plan-conception.md`](plan-conception.md).

## ✅ 2. Prototype UX

Écran d'accueil à deux boutons (`src/screens/HomeScreen.tsx`) — *Converser* actif,
*Apprendre* grisé (V2) — et écran de conversation (`src/screens/ChatScreen.tsx`).

Pas encore d'onboarding : langue native, langue étudiée et niveau sont figés dans
`src/config.ts` (`French` / anglais / `A2`). Ils deviendront un vrai écran à l'étape 5.

## ✅ 3. Squelette MVP, texte uniquement

- Edge Function `chat` : prompt système du mode Conversation + appel Claude.
- Modèle principal : `claude-sonnet-5` (plan, section 6 : milieu de gamme pour la
  conversation en direct). Le réglage est une ligne dans
  `supabase/functions/chat/index.ts`.
- Clé API uniquement dans les secrets Supabase.

## 👉 4. Valider le cœur du concept — l'étape en cours

C'est le point le plus risqué du projet (plan, section 13) : *est-ce qu'un bon prompt
suffit à produire une conversation où l'IA prend vraiment l'initiative ?*

- [ ] Discuter 10 à 15 minutes avec l'app, plusieurs fois
- [ ] Elle relance systématiquement, sans jamais rester passive
- [ ] Elle ne repose pas la même question
- [ ] Les corrections restent des reformulations naturelles
- [ ] Les réponses tiennent en 1 à 3 phrases

Si ça ne convainc pas, on itère sur le prompt — et **seulement** sur le prompt. Aucune
quantité de travail sur l'audio ou la base ne rattraperait un cœur décevant.

## 5. Couche vocale

Stratégie du plan (section 7) : **STT et TTS natifs du téléphone d'abord**, donc gratuits
et sans latence réseau. C'est ce qui rend le vocal abordable — le coût reste celui des
seuls tokens Claude.

- [ ] Vérifier quels modules audio/voix sont disponibles sur Expo SDK 57 et lesquels
      fonctionnent dans Expo Go (certains modules natifs imposent un build EAS)
- [ ] Mode « appuyer pour parler » : enregistrer → transcrire → Claude → lire à voix haute
- [ ] Mesurer la latence bout en bout (risque n°1 du plan, section 11)
- [ ] Garder le mode texte disponible

Voix cloud premium (ElevenLabs, Azure) et streaming audio : seulement si l'usage réel le
justifie. Pas au MVP.

## 6. Mémoire de session

- [ ] Tables `users`, `sessions`, `messages` (plan, section 8)
- [ ] Supabase Auth + Row Level Security
- [ ] Onboarding : langue native, langue étudiée, niveau — à la place des valeurs figées
- [ ] Résumé compact injecté dans le prompt (sujets récents) pour l'anti-répétition

## 7. Réglage du moteur de conversation

Affiner initiative et corrections sur la base de l'usage réel, pas d'intuitions.

## 8. (V2) Mode Professeur

Deuxième prompt système, sessions structurées, mémoire pédagogique
(`vocabulary`, `notions`, `errors`, `objectives`).

## 9. (V2) Tests utilisateurs

## 10. Optimisation puis lancement

Coûts, latence, éventuel streaming audio. Puis publication en store.

---

## À ne pas faire (plan, section 9)

- Orchestrateur multi-agents — deux prompts système suffisent
- STT/TTS cloud payant au démarrage
- Système de score sans méthode de calcul définie
- Dashboard analytics élaboré
