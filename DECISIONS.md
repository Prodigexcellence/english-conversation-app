# Décisions et feuille de route

Mémoire du projet. À lire en premier au début de chaque séance, et à mettre à jour dès
qu'une décision est prise. Le but : ne jamais reposer deux fois la même question.

Le cahier des charges reste le document de référence :
https://claude.ai/artifact/9xJQNBdQTj44qMyuFnav5Y

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

- **Conversation et estimation du niveau : Claude** (Anthropic).
- **Modèle** : `claude-sonnet-5-5` pour le test de niveau (il n'a lieu qu'une fois par
  utilisateur et doit être juste). Pour les conversations de tous les jours, comparer avec
  `claude-haiku-5-5`, bien moins cher, et juger sur de vraies conversations.
- **Voix** : non tranché. Le code doit rendre la voix **interchangeable** (voix de l'iPad,
  OpenAI, ElevenLabs) pour décider à l'écoute, sans réécriture.
- **Transcription** (voix → texte) : ElevenLabs Scribe si l'on reste chez ElevenLabs,
  sinon OpenAI. Pas avant l'étape 4b.
- La clé de l'IA ne vit que dans les secrets Supabase ; l'app ne parle qu'à une fonction
  serveur Supabase, jamais directement à Anthropic.

---

## 2. Questions en attente

- [ ] Compte Claude créé (platform.claude.com), ~10 $ de crédit, limite de dépense, clé API
      rangée dans les secrets Supabase sous `ANTHROPIC_API_KEY`.
- [ ] Confirmation d'e-mail bien désactivée dans Supabase
      (Authentication → Sign In / Providers → Email → décocher *Confirm email*).
- [ ] Voix : démarrer avec les voix gratuites de l'iPad, ou recharger 5 $ chez ElevenLabs
      (paiement à l'usage, sans abonnement) et fournir deux *Voice ID* (un britannique pour
      Leo, un américain pour Marcus).
- [ ] Si ElevenLabs : vérifier sur leur site que l'usage **commercial** est permis avec le
      paiement à l'usage.
- [ ] Nom de domaine (pour les e-mails, avant la sortie).

---

## 3. Prix de référence

Estimations pour **une conversation de 10 minutes**, à confirmer sur les factures réelles.
Les tarifs des fournisseurs changent : à revérifier avant toute décision importante.

| Poste | Coût |
|---|---|
| Claude Sonnet 5.5 | ~15 à 25 centimes |
| Claude Haiku 5.5 | ~1 à 2 centimes |
| Voix de l'iPad | gratuit |
| Voix OpenAI | ~7 centimes |
| Voix ElevenLabs | ~20 à 45 centimes |
| Transcription (OpenAI ou ElevenLabs Scribe) | ~2 centimes |

**Point de vigilance** : un utilisateur qui pratiquerait 20 minutes par jour coûterait
environ 10 à 20 $ par mois avec Sonnet et des voix premium — soit autant qu'un abonnement
du marché (Praktika se vend autour de 10 $ par mois). Les leviers pour réduire : Haiku pour
le quotidien, le modèle *Flash* d'ElevenLabs, la mise en cache des invites, et un plafond
d'usage quotidien via la table `usage_daily`.

---

## 4. Feuille de route

| Étape | Contenu | État |
|---|---|---|
| 1 | Squelette de l'app | terminée |
| 2 | Maquette cliquable des 7 écrans, logo, avatars | terminée |
| 3 | Comptes, base Supabase (4 tables + RLS), profil qui survit au redémarrage | **terminée** (21 nov. 2026) |
| 4a | Vrai test de niveau avec Claude : réponses écrites, partenaire qui parle à voix haute | à faire |
| 4b | Micro : réponses à l'oral, transcription | à faire |
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
