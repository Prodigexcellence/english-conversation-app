# Décisions et feuille de route

Mémoire du projet. À lire en premier au début de chaque séance, et à mettre à jour dès
qu'une décision est prise. Le but : ne jamais reposer deux fois la même question.

Le cahier des charges reste le document de référence :
https://claude.ai/artifact/9xJQNBdQTj44qMyuFnav5Y

---

## 0. Principe fondateur

**L'app est faite pour des utilisateurs du monde entier**, pas seulement francophones.
Toute réponse, tout choix de conception et tout bout de code doit tenir pour quelqu'un
n'importe où sur Terre, sur un appareil configuré dans n'importe quelle langue.

Conséquences permanentes :

- **Aucun texte visible écrit en dur** dans une seule langue. L'interface doit être
  traduisible.
- **La langue maternelle de l'utilisateur** (`profiles.native_language`) décide à la fois de
  la langue de l'interface **et** de la langue dans laquelle l'IA explique les fautes.
- **Les fautes typiques dépendent de la langue maternelle** : un francophone et un
  japonophone ne se trompent pas sur les mêmes choses. La consigne donnée à l'IA doit en
  tenir compte.
- **Les messages d'erreur du serveur sont des codes**, jamais des phrases : c'est l'app
  qui les traduit (`ai_not_configured`, `daily_limit`, `refused`…).
- **Ne jamais supposer qu'une voix est installée** sur l'appareil : demander la liste des
  voix disponibles et prévoir un repli.
- **Protection des données dans plusieurs juridictions** : RGPD (UE), CCPA (Californie) et
  autres. Donc : aucun fournisseur qui s'entraîne sur les données des utilisateurs.
- **Les plafonds journaliers** doivent se référer à un fuseau horaire explicite, sinon
  « par jour » ne veut rien dire à l'échelle mondiale.
- **Les prix doivent pouvoir varier par pays** : 10 $/mois n'a pas le même poids en Inde,
  au Brésil ou en Suisse.

---

## 1. Décisions prises

### Technique

| Sujet | Décision | Depuis |
|---|---|---|
| Application | Expo / React Native, SDK 58, Expo Router | étape 1 |
| Test | iPad, dans Expo Go, via EAS Update (branche `refonte`) | étape 1 |
| Serveur | Supabase, projet `ryeluvtovfpujuzihywk` (eu-west-1) | étape 3 |
| Branches | travail sur une branche `claude/…`, référence `refonte`. **Ne jamais fusionner dans `refonte` sans accord explicite.** | étape 3 |
| Clés secrètes | uniquement dans les secrets Supabase. Jamais dans l'app, jamais dans la conversation. | étape 3 |
| Traductions | `src/i18n/`. `fr.ts` est la référence et exporte le type `Translations` ; toute autre langue doit le satisfaire, donc `npx tsc --noEmit` refuse une traduction incomplète. **Ajouter une langue = traduire une copie de `fr.ts` + deux lignes dans `languages.ts`.** Aucun écran à modifier. | étape 3b |
| Langue de l'interface | profil (`native_language`), sinon langue de l'appareil (`expo-localization`), sinon **anglais** — pas français : repli mondial. | étape 3b |

### Partenaires de conversation

| Partenaire | Accent |
|---|---|
| **Leo** | britannique (`uk`) |
| **Marcus** | américain (`us`) |

Défini dans `src/data/partners.ts`. L'accent détermine la voix et l'anglais de l'IA
(orthographe, vocabulaire).

### Comptes et e-mails

- La **confirmation d'e-mail est désactivée** pendant le développement : pas de service
  d'envoi d'e-mails pour l'instant. Une inscription donne directement une session.
- « Mot de passe oublié » n'est donc **pas testable** pour le moment.
- Avant la sortie de l'app, il faudra : acheter un **nom de domaine** (pas encore fait),
  brancher un **service d'envoi d'e-mails** (Resend, ou Brevo si l'on préfère le français),
  remplacer le lien de confirmation par un **code à 6 chiffres** (c'est ce que l'app attend),
  puis réactiver la confirmation.

### Intelligence artificielle

- **Conversation et estimation du niveau : Claude** (Anthropic), via `supabase/functions/conversation`
  — la seule pièce qui détient la clé. Jamais de mélange avec un autre fournisseur pour la
  conversation : Claude Haiku 5.5 et le moins cher des Gemini coûtent le même prix au
  centime près, donc un deuxième fournisseur n'économiserait rien et doublerait la
  maintenance, la facturation et les endroits où vivent les données des utilisateurs.
- **Modèle** : `claude-sonnet-5-5` pour le test de niveau (il n'a lieu qu'une fois par
  utilisateur et doit être juste). Pour les conversations de tous les jours,
  `claude-haiku-5-5` (20 fois moins cher), à confirmer sur de vraies conversations.
  **Piège vérifié : une version plus ancienne coûte plus cher, pas moins** (Opus 5 et
  Opus 4.8 sont à 5 $/25 $, Opus 5.5, plus récent et meilleur, à 4 $/20 $). Baisser le
  coût = changer de **gamme** (Opus → Sonnet → Haiku), jamais reculer dans le temps.
- **Le niveau est écrit par le serveur**, jamais par l'app : à la fin du test, l'app ne
  fait qu'afficher ce que le serveur a déjà enregistré dans `profiles.level`.
- **Test de niveau : à l'écrit d'abord (fait), à l'oral ensuite (étape 4b).** Décision du
  24 nov. 2026 : le micro demande un compte OpenAI de plus ; mieux valait d'abord valider
  que Claude juge bien, sur le même écran, avant d'ajouter une pièce.
- **Voix** : **les voix de l'iPad**, via `expo-speech` (inclus dans Expo Go, donc gratuit et
  sans version de développement). Vérifié dans la doc du SDK 58 : le module accepte un code
  de langue (`en-GB` pour Leo, `en-US` pour Marcus), un choix de voix parmi celles de
  l'appareil, et une vitesse — ce qui fait enfin marcher le réglage « Vitesse de la voix ».
  **ElevenLabs est écarté** : trois fois plus cher qu'OpenAI, et jamais indispensable. À
  reconsidérer seulement comme avantage pour abonnés payants. Le code garde malgré tout la
  voix **interchangeable** (iPad / OpenAI / ElevenLabs), pour décider à l'écoute.
- **Transcription** (voix → texte) : **OpenAI**, à l'étape 4b. Expo n'a **aucun** module de
  reconnaissance vocale en SDK 58, il faut donc un service en ligne. OpenAI (~1,5 centime
  les 10 min) et ElevenLabs Scribe (~1,7 centime) coûtent pareil ; OpenAI est retenu car
  c'est un simple compte à l'usage et sa documentation est accessible depuis l'environnement
  de travail, contrairement à elevenlabs.io qui y est bloqué.
  La reconnaissance intégrée à iOS est écartée : elle exige une version de développement
  **et** elle corrige la grammaire toute seule, ce qui masquerait les fautes à corriger.
- La clé de l'IA ne vit que dans les secrets Supabase ; l'app ne parle qu'à une fonction
  serveur Supabase, jamais directement à Anthropic.
- **Les « paliers » Anthropic (ex. 500 $) sont des limites de DÉBIT (requêtes/minute),
  pas un plafond de dépense.** On monte de palier automatiquement en payant ses factures,
  sans démarche à faire. À ne reconsidérer qu'avec un trafic vraiment important — le
  plafond quotidien par utilisateur dans `supabase/functions/conversation` protège déjà
  contre qu'un seul compte sature la limite.

---

## 2. Questions en attente

- [ ] Compte Claude créé (platform.claude.com) + téléphone vérifié. **Regarder s'il y a du
      crédit gratuit offert** (des sources tierces parlent de ~5 $, expirant 14 jours après
      l'avoir réclamé ; la page officielle dit seulement « une petite quantité »). Sinon,
      acheter 5 $ et fixer une limite de dépense. Puis ranger la clé dans les secrets
      Supabase sous `ANTHROPIC_API_KEY`.
- [x] ~~Confirmation d'e-mail désactivée dans Supabase~~ — **vérifié le 24 nov. 2026** :
      une inscription renvoie directement une session, donc aucun code n'est demandé.
- [ ] Compte OpenAI à l'usage, **seulement à l'étape 4b**, pour la transcription (~5 $ de
      crédit suffisent), clé rangée sous `OPENAI_API_KEY`.
- [ ] Nom de domaine (pour les e-mails, avant la sortie).

**Repli si l'on ne veut rien dépenser du tout** : Google Gemini a un niveau gratuit
permanent (limites de débit, pas de carte bancaire). Deux réserves : les données du niveau
gratuit pourraient servir à l'entraînement hors UE / Suisse / Royaume-Uni (à vérifier dans
leurs conditions avant de faire passer de vraies conversations), et le jugement du niveau
serait un peu moins fin. Un abonnement claude.ai ou ChatGPT **ne donne pas** accès à l'API.

---

## 3. Coûts, et comment dépenser le moins

### Prix de référence

Deux colonnes : l'estimation initiale (avant d'avoir écrit les consignes), et le calcul
refait le 27 nov. 2026 à partir des vraies consignes de `supabase/functions/conversation`
(~14 000 jetons envoyés, ~1 000 reçus, pour 10 minutes). **Le calcul est plus fiable, mais
reste un calcul : la vraie facture viendra de `usage_daily` une fois la clé Claude posée.**

| Poste | Estimation initiale | Calculé sur les vraies consignes |
|---|---|---|
| Claude Opus 5 / Opus 4.8 | — | 9,5 centimes (plus cher qu'Opus 5.5 : versions anciennes) |
| Claude Opus 5.5 | — | 7,6 centimes |
| Claude Sonnet 5.5 | ~15 à 25 centimes | **3,8 centimes** |
| Claude Haiku 5.5 | ~1 à 2 centimes | **0,2 centime** |
| Gemini 2.5 Flash-Lite (le moins cher de Gemini) | — | 0,2 centime — identique à Haiku 5.5 |
| Voix de l'iPad (`expo-speech`) | gratuit | **gratuit** |
| Voix OpenAI | ~7 centimes | (à recalculer à l'étape 4b) |
| Voix ElevenLabs | ~20 à 45 centimes | (à recalculer si reconsidéré) |
| Transcription (OpenAI, ou ElevenLabs Scribe) | ~1,5 à 2 centimes | (à recalculer à l'étape 4b) |

**Conclusion du recalcul : c'est la voix qui coûte, pas l'IA.** Avec les voix de l'iPad,
l'IA (Haiku 5.5) revient à grosso modo **0,2 centime les 10 minutes, soit ~11 centimes par
mois** pour un utilisateur qui pratique 20 min/jour. Les 10 à 20 $/mois évoqués au départ
venaient d'une estimation faite avant d'avoir le texte des consignes : à jeter, pas à
retenir comme chiffre de référence.

### Mesure réelle (27 nov. 2026, premier test avec une vraie clé)

Un test de niveau complet (8 échanges, jusqu'à l'estimation B2) a coûté **~2,5 centimes**
en vrai — cohérent avec le calcul ci-dessus. Deux leçons tirées de ce premier essai :

- **Un bug empêchait toute mise en cache** : le nombre de réponses déjà données était
  écrit dans le texte même des consignes, qui changeait donc à chaque tour — alors que
  Claude met en cache un PRÉFIXE identique octet pour octet. Corrigé en sortant cette
  seule ligne dynamique dans un second bloc système, non mis en cache, à la suite du
  premier. Depuis, la mise en cache s'active bien dès le deuxième appel
  (~1719 jetons/appel sur ce test).
- **Le premier appel ne profite jamais du cache** (il l'écrit, il ne le lit pas encore) :
  seule la DEUXIÈME réplique d'une conversation et les suivantes en bénéficient. Normal,
  pas un bug — juste à ne pas s'attendre à un cache dès le premier message.

### Les leviers, du meilleur au moins bon

Les trois premiers sont **gratuits et sans perte de qualité** :

1. **Le modèle.** Haiku 5.5 coûte **20 fois moins** que Sonnet 5.5. Réserver Sonnet aux
   deux moments de jugement : le test de niveau (une fois par utilisateur) et le bilan de
   fin de conversation.
2. **La mise en cache.** Les consignes de l'IA sont identiques à chaque réplique : Claude
   les refacture **~10 fois moins cher** si on le programme. 80 à 90 % de l'entrée économisée.
3. **Des réponses courtes** (1 à 3 phrases). Réduit le coût de Claude *et* de la voix, et
   c'est meilleur pédagogiquement : l'apprenant doit parler plus que la machine.

Puis, avec de petits compromis :

4. **Les voix de l'iPad** plutôt que premium : gratuit. Pour apprendre, la clarté compte
   plus que la beauté.
5. **Une mémoire bornée** : dernières répliques + résumé, au lieu de toute la conversation.
6. **Un plafond d'usage quotidien**, via la table `usage_daily`.

### Les deux configurations

| Configuration | 10 minutes | Un utilisateur assidu (20 min/jour) |
|---|---|---|
| Sans réfléchir (Sonnet + voix ElevenLabs) | ~40 à 70 centimes | **10 à 20 $/mois** — non viable |
| **Optimisée** (Haiku + cache + réponses courtes + voix iPad) | **~2 à 3 centimes** | **~1,50 €/mois** — viable |

Un abonnement du marché se vend autour de 10 $ par mois (Praktika). Seule la configuration
optimisée laisse une marge.

### Règle de méthode

**Mesurer, pas deviner.** Chaque conversation doit enregistrer sa consommation réelle dans
`usage_daily`. Le modèle et la voix doivent rester des réglages modifiables en une ligne,
pour comparer Haiku et Sonnet sur la *même* conversation et trancher à l'oreille.

---

## 4. Feuille de route

| Étape | Contenu | État |
|---|---|---|
| 1 | Squelette de l'app | terminée |
| 2 | Maquette cliquable des 7 écrans, logo, avatars | terminée |
| 3 | Comptes, base Supabase (4 tables + RLS), profil qui survit au redémarrage | **terminée** (21 nov. 2026) |
| 3b | Interface traduisible (i18n) : 266 textes extraits, français + anglais, `native_language` lue et écrite, choix de la langue dans les Réglages | **terminée** (24 nov. 2026) |
| 4a | Vrai test de niveau avec Claude : réponses écrites, partenaire qui parle à voix haute (iPad) | **terminée, testée et validée sur l'iPad** (27 nov. 2026) |
| 4b | Micro : réponses à l'oral (le même écran, pour le test comme pour la pratique), transcription OpenAI | à faire — demande un compte OpenAI |
| 5+ | Conversation quotidienne, bilans, abonnement | à définir |

### Critères de validation de l'étape 3 (tous vérifiés)

1. Création de compte, puis onboarding complet.
2. Profil retrouvé après redémarrage de l'app.
3. Un réglage modifié reste après redémarrage.
4. Déconnexion, puis reconnexion sans refaire l'onboarding.

---

## 5. Leçons des séances passées

- **Les fautes de frappe dans l'adresse e-mail** ressemblent à des bugs. Un « identifiant
  incorrect » après une inscription réussie : vérifier d'abord l'adresse exacte dans
  `auth.users`, puis les journaux Supabase (`auth_logs`), avant de toucher au code.
- **Le service d'envoi d'e-mails de Supabase est très limité** : il refuse les inscriptions
  rapprochées avec « trop de tentatives ». Raison de plus pour garder la confirmation
  désactivée en développement.
- **La nouvelle version n'apparaît qu'au deuxième lancement** d'Expo Go : fermer
  complètement l'app, puis rouvrir.
- **`profiles` restreint l'écriture colonne par colonne** (`revoke update` puis
  `grant update (liste)` dans la migration des fondations). Une nouvelle colonne que l'app
  doit écrire **doit être ajoutée à cette liste**, sinon l'écran change mais rien n'est
  enregistré. C'est exactement le bug trouvé juste après l'étape 3b, sur `native_language`.
  À vérifier systématiquement en ajoutant une colonne.
- **Toujours relire son propre test avant de le déclarer réussi.** Le bug des corrections
  répétées (étape 4a) était visible dans ma première sortie de test, mais je ne l'avais
  pas signalé sur le moment — c'est l'utilisateur qui l'a trouvé en testant sur l'iPad.
- **Le clavier d'iPad est haut : un élément de taille fixe au-dessus d'une zone en
  `flex: 1` peut l'écraser complètement une fois le clavier ouvert**, sans que ça se voie
  en lisant le code. `src/lib/useKeyboardVisible.ts` sert à alléger l'écran pendant la
  saisie — par défaut, réduire plutôt que faire disparaître (l'utilisateur veut souvent
  encore voir la pièce qu'on allège).
- **Une mise à jour EAS exige de fermer complètement l'app et de la rouvrir deux fois** —
  recroisé plusieurs fois, y compris là où un vrai bug semblait pourtant certain.
