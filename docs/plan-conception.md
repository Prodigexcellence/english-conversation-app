# Plan de conception — Application de conversation linguistique avec IA

*Document de cadrage, avant tout code. À valider et ajuster ensemble avant de démarrer le développement.*

---

## 1. Compréhension du produit

Tu veux construire une application mobile qui ne ressemble pas à un chatbot ni à un exerciseur de grammaire, mais à un **véritable partenaire de conversation** pour pratiquer l'oral dans une langue étrangère. Deux modes bien distincts :

- **Conversation libre** : l'IA discute comme une vraie personne — elle prend l'initiative, rebondit, se souvient, corrige avec doigté.
- **Professeur** : l'IA devient un enseignant particulier, avec des sessions structurées et chronométrées, un programme qui progresse dans le temps, et une vraie mémoire pédagogique de l'élève.

Le tout doit fonctionner à l'oral (micro → IA → voix), s'adapter aux niveaux A1 à C2, et séparer clairement la langue native de la langue étudiée. C'est un projet distinct de ton application de flashcards HSK1 — ici la V1 cible l'anglais, en mode conversation.

---

## 2. Proposition de valeur

Ce qui différencie ça d'un chatbot classique :

- **L'initiative change tout.** La plupart des apps de langue (et des chatbots) attendent que l'utilisateur écrive quelque chose. C'est justement ce qui les tue : face à une page blanche, on ne sait pas quoi dire, et on abandonne. Une IA qui relance activement supprime cette friction — c'est proche de ce qui fait qu'une vraie conversation "marche".
- **La mémoire pédagogique persistante.** Un chatbot classique repart de zéro à chaque session. Ici, l'app retient ce qui a été vu, maîtrisé, ou raté — donc une vraie progression se construit dans la durée, pas juste des sessions isolées.
- **Deux modes qui répondent à deux besoins réels.** La pratique libre construit la confiance et l'aisance ; le mode professeur construit des bases solides (grammaire, structure). Peu d'apps combinent bien les deux — la plupart ne font que l'un ou l'autre.
- **Voix par défaut, pas texte.** L'oral s'apprend en parlant, pas en tapant. C'est un pari plus ambitieux techniquement, mais c'est la vraie valeur pour quelqu'un qui veut progresser à l'oral.

---

## 3. Expérience utilisateur

**Accueil** : deux boutons, rien d'autre. 🗣️ *Converser* / 👨‍🏫 *Apprendre*.

**Onboarding** (une fois) : langue native, langue étudiée, niveau auto-déclaré (un vrai test de niveau peut venir plus tard).

**Parcours Converser** : l'utilisateur appuie, l'IA lance la conversation à l'oral, l'utilisateur répond en parlant (probablement en mode "appuyer pour parler" au départ — plus simple à fiabiliser qu'une écoute continue). À la fin, un court résumé : ce qui a été abordé, une ou deux corrections notables.

**Parcours Apprendre** (v2) : reprise ou nouvelle session, minuteur visible, progression dans la leçon affichée simplement.

---

## 4. Mode Conversation

Le moteur repose sur trois piliers :

- **Prise d'initiative** : après chaque réponse de l'utilisateur, l'IA a le choix entre approfondir, relancer, ou changer de sujet — piloté par un prompt système bien conçu, pas par une logique conditionnelle complexe.
- **Correction adaptative** : trois comportements (naturel / reformulation légère / correction explicite), avec une fréquence réglable. Au départ, un seul réglage par défaut (reformulation légère) suffit ; le rendre configurable est une amélioration V2, pas un prérequis.
- **Anti-répétition** : en injectant dans le contexte un résumé compact (sujets déjà abordés récemment, infos utiles sur l'utilisateur), l'IA évite de reposer les mêmes questions sans qu'il faille un système de mémoire complexe.

Ce mode n'a besoin ni de plusieurs agents ni d'une logique métier lourde : un bon prompt système + un peu de contexte injecté à chaque appel suffit à produire ce comportement.

---

## 5. Mode Professeur

Une session type suit une structure en phases (échauffement, révision, nouvelle notion, exercices, pratique, conversation appliquée, bilan), mais adaptable selon le niveau — pas figée.

Le professeur garde en mémoire : niveau, objectifs, difficultés récurrentes, notions vues/maîtrisées/à revoir, vocabulaire. Il construit une **progression réelle** (programme par semaine, avancée ou ralentie selon les résultats) plutôt que de répéter le même contenu.

Recommandation : ce mode est riche et ajoute beaucoup de complexité (planification pédagogique, structure de session, évaluation). Je propose de le mettre en V2, une fois que le moteur de conversation fonctionne bien — voir section 9.

---

## 6. Architecture IA

Tu proposais une architecture à 5 agents spécialisés (Conversation, Professeur, Évaluation, Mémoire, Planification) avec un orchestrateur. **Je ne recommande pas cette approche pour démarrer** — voici pourquoi, et ce que je propose à la place.

Un vrai système multi-agents (agents autonomes qui se coordonnent entre eux) a du sens quand des tâches doivent tourner en parallèle et négocier entre elles. Ici, ce n'est pas le cas : à un instant donné, on est soit en conversation, soit en leçon — jamais les deux. Faire tourner un orchestrateur pour ça ajoute de la complexité (plus de code, plus de coûts API, plus de points de panne) sans bénéfice réel, et c'est nettement plus dur à déboguer pour un premier projet.

**Ce que je propose à la place :**

- **Conversation" et "Professeur"** = deux prompts système différents (deux "personas"), envoyés au même modèle selon le mode actif. Pas deux agents séparés — juste deux configurations.
- **"Mémoire"** n'est pas un agent : c'est une couche de récupération de données. Avant chaque appel, on va chercher dans la base les infos utiles (profil, dernières erreurs, sujets récents) et on les insère dans le prompt. C'est de la plomberie, pas de l'intelligence artificielle.
- **"Évaluation"** devient une tâche de fond asynchrone : après la fin d'une session, un appel (avec un modèle rapide et bon marché) analyse les échanges, extrait vocabulaire et erreurs, met à jour la base. Pas besoin que ce soit "vivant" pendant la conversation.
- **"Planification"** : un job périodique (ex. hebdomadaire) qui regarde la progression et ajuste le programme. Même logique — traitement de fond, pas agent temps réel.

Ça couvre la quasi-totalité de ce que tu veux, avec beaucoup moins de pièces mobiles. Si un jour l'usage réel justifie une vraie architecture multi-agents (par exemple si le mode professeur devient très complexe), ce sera le bon moment d'y revenir — pas maintenant.

**Choix de modèle** : le modèle principal (conversation et leçon en direct) doit privilégier la qualité et la latence — un modèle de milieu de gamme comme Claude Sonnet est un bon point de départ. Les tâches de fond (évaluation, extraction de vocabulaire) peuvent utiliser un modèle plus rapide et moins cher comme Claude Haiku, sans perte de qualité perceptible pour l'utilisateur. Les tarifs Claude évoluent régulièrement — à vérifier sur la page de tarification officielle au moment de budgétiser.

---

## 7. Architecture technique

| Composant | Choix recommandé | Pourquoi |
|---|---|---|
| **Frontend** | Expo / React Native | Tu connais déjà ce workflow (app HSK1), l'écosystème audio est mature (enregistrement, lecture, synthèse vocale), et ça fonctionne bien avec Claude Code. Repartir sur Flutter ou du natif ajouterait une courbe d'apprentissage sans bénéfice pour ce projet. |
| **Backend** | Supabase (Postgres managé + Auth + Edge Functions + Storage) | Minimise le code d'infrastructure à écrire et maintenir seul — Postgres correspond bien au modèle de données relationnel (utilisateurs, sessions, vocabulaire). Alternative écartée : un backend Node/Express classique, qui demanderait de gérer serveur, déploiement et auth soi-même. |
| **IA** | Claude API, appelée depuis une Edge Function Supabase (jamais depuis l'app) | La clé API ne doit jamais être exposée côté client — l'app appelle ta fonction serverless, qui appelle Claude. |
| **Speech-to-Text** | Reconnaissance vocale native du téléphone au départ (via Expo) | Gratuite, latence réseau nulle, suffisante pour valider le concept. Un fournisseur cloud (type Deepgram) pourra remplacer si la précision est insuffisante face aux erreurs de prononciation des apprenants. |
| **Text-to-Speech** | Voix natives de l'OS au départ (via Expo) | Gratuites, simples à intégrer. Des voix plus naturelles (ElevenLabs, Azure) sont un vrai levier de qualité perçue, mais coûtent — à envisager une fois l'usage validé. |
| **Authentification** | Supabase Auth | Email/mot de passe pour commencer, Google/Apple ensuite. Intégré, pas de service à part. |
| **Stockage** | Supabase Storage, seulement si besoin | Pas nécessaire si l'audio est jeté après transcription — à activer seulement si tu veux conserver des enregistrements. |
| **Déploiement** | Expo EAS Build (app) + Supabase (backend déjà hébergé) | Cohérent avec ce que tu utilises déjà pour l'app HSK1. |
| **Monitoring** | Sentry (gratuit) + logs Supabase | Volontairement minimal au départ — pas besoin d'une stack d'observabilité complète pour un MVP solo. |

---

## 8. Modèle de données

Entités principales et leurs relations (pas de schéma technique à ce stade, juste la structure logique) :

- **users** — profil, langue native, langue étudiée, niveau CECRL déclaré.
- **sessions** — une conversation ou une leçon : type (conversation/professeur), début, fin. Reliée à un user.
- **messages** — chaque tour de parole d'une session : rôle (utilisateur/IA), contenu, horodatage, type de correction appliqué. Reliée à une session.
- **vocabulary** + **user_vocabulary** — le mot en lui-même, puis une table de liaison qui garde le statut par utilisateur (en apprentissage / maîtrisé, dernière révision).
- **notions** + **user_notions** — points de grammaire/structure, niveau associé, puis statut par utilisateur (vu / maîtrisé / à revoir).
- **errors** — texte original, correction, notion liée, fréquence. Reliée à un user.
- **objectives** — objectif de l'utilisateur, description, échéance.
- **progression** — agrégats calculés (temps de conversation, sessions réalisées, etc.) — à construire à partir des tables ci-dessus, pas stockés comme un "score" indépendant tant que la méthode de calcul n'est pas définie.

---

## 9. MVP

**Indispensable pour le MVP :**
- Mode Conversation uniquement (pas le mode Professeur) — ça correspond à ce que tu visais déjà pour la V1.
- Une seule langue étudiée : anglais.
- Boucle vocale simple : appuyer pour parler, STT/TTS natifs (gratuits).
- Mémoire légère : résumé de profil + quelques derniers échanges, pas de suivi fin du vocabulaire/erreurs.
- Un seul comportement de correction par défaut (pas encore configurable).

**Important, mais V2 :**
- Mode Professeur complet.
- Fréquence de correction configurable.
- Suivi structuré du vocabulaire et des erreurs.
- Programme d'apprentissage dynamique.

**Fonctionnalité avancée :**
- Multilingue au-delà de l'anglais.
- Streaming audio pour réduire la latence.
- Plusieurs personnalités IA sélectionnables.
- Tableau de progression détaillé (fluidité, prononciation…).

**À éviter au début :**
- Orchestrateur multi-agents.
- STT/TTS cloud premium payant.
- Tout système de score sans méthode de calcul définie.
- Dashboard analytics élaboré.

---

## 10. Roadmap

1. **Conception** — ce document, ajusté avec toi.
2. **Prototype UX** — écran d'accueil à 2 boutons + maquette de l'écran de conversation.
3. **Squelette MVP (texte d'abord)** — app Expo + Edge Function Supabase + appel Claude, en mode **texte, pas encore vocal**. Objectif : valider que le prompt produit une conversation naturelle avec initiative, avant d'ajouter la complexité audio.
4. **Couche vocale** — brancher STT/TTS natifs sur le squelette texte validé.
5. **Mémoire de session** — persister profil utilisateur et historique en base, pour que l'IA se souvienne d'une session à l'autre.
6. **Réglage du moteur de conversation** — affiner le comportement (initiative, corrections) sur la base d'usage réel.
7. **(V2) Mode Professeur** — structure de session, programme, mémoire pédagogique.
8. **(V2) Tests utilisateurs** et itération.
9. **Optimisation** — coûts, latence, éventuel streaming audio.
10. **Lancement.**

---

## 11. Risques

- **Latence de la boucle vocale.** STT → IA → TTS enchaînés peuvent casser l'illusion de naturel si c'est trop lent. À mesurer tôt, optimiser (streaming) seulement si nécessaire.
- **Coût par minute de conversation.** STT, tokens IA et TTS sont tous facturés à l'usage — ça peut grimper vite avec des sessions longues. La stratégie "natif d'abord" (section 7) limite ce risque au départ.
- **Difficulté du prompt engineering.** Obtenir une IA qui prend vraiment l'initiative sans être répétitive ni artificielle est un vrai problème d'ingénierie de prompt, pas un détail — à itérer sérieusement.
- **Ampleur du projet face au temps disponible.** Le cahier des charges complet est large (13 domaines). Le vrai risque n'est pas technique, c'est de trop construire avant d'avoir validé que le concept de base (parler avec une IA qui relance bien) est agréable à utiliser.
- **Publication en store.** Tu as déjà une première expérience avec l'app HSK1 — les mêmes questions de distribution se reposeront.

---

## 12. Coûts

Les postes de coût principaux, une fois en production : appels au modèle IA (le poste dominant), et éventuellement STT/TTS cloud si tu passes sur des fournisseurs payants plus tard.

Avec la stratégie "STT/TTS natifs + Supabase" pour le MVP, les coûts d'infrastructure sont proches de zéro (paliers gratuits) — il ne reste que le coût des appels Claude, de l'ordre de quelques centimes par session de conversation selon sa longueur. Les tarifs par modèle changent régulièrement (nouvelles versions, tarifs promotionnels temporaires) — mieux vaut vérifier les tarifs actuels sur la console Anthropic au moment de faire un vrai budget plutôt que de se fier à un chiffre figé ici.

Pour limiter le coût par utilisateur à terme : router les tâches de fond vers un modèle moins cher (section 6), mettre en cache les parties fixes du prompt système, et limiter la durée par défaut d'une session de conversation.

---

## 13. Prochaine étape

La tâche la plus utile à faire en premier n'est **pas** la voix, ni la base de données — c'est de valider le cœur du concept : *est-ce qu'un prompt bien conçu suffit à produire une conversation où l'IA prend vraiment l'initiative et relance naturellement ?*

Concrètement : un prototype **texte uniquement**, une seule fonction serverless qui appelle Claude avec le prompt système du mode Conversation, testé à la main pendant plusieurs échanges. Si ce cœur ne convainc pas, aucune quantité de travail sur l'audio ou la base de données ne sauvera le produit — donc c'est le point le plus risqué à dérisquer en premier, avant d'investir dans le reste.
