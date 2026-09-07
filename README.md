# English Conversation App

Application mobile pour pratiquer l'anglais à l'oral… en commençant par l'écrit.
Tu discutes librement avec une IA (Claude) qui joue le rôle d'un vrai partenaire de
conversation : elle prend l'initiative, relance, et corrige en douceur.

**État actuel : squelette MVP, texte uniquement.** Pas encore de voix, pas encore de
sauvegarde des conversations. L'objectif de cette étape est de valider que la boucle
complète fonctionne : ton message → serveur → Claude → réponse affichée dans l'app.

---

## Comment c'est construit

```
    Ton téléphone                Supabase                    Anthropic
  ┌───────────────┐        ┌──────────────────┐        ┌──────────────┐
  │  App Expo     │ ─────► │  Edge Function   │ ─────► │  API Claude  │
  │  (écran chat) │ ◄───── │  "chat"          │ ◄───── │              │
  └───────────────┘        └──────────────────┘        └──────────────┘
                            🔑 la clé API vit ICI
```

L'app ne parle jamais directement à Claude. Elle passe par une petite fonction hébergée
chez Supabase (une « Edge Function »), et c'est cette fonction qui détient la clé API.
Ainsi, même si quelqu'un décompilait l'app, il ne trouverait pas la clé.

### Les fichiers importants

| Fichier | À quoi ça sert |
|---|---|
| `App.tsx` | Point d'entrée de l'app |
| `src/screens/ChatScreen.tsx` | L'écran de chat (bulles, saisie, bouton Send) |
| `src/api/chat.ts` | Envoie la conversation au serveur et récupère la réponse |
| `src/config.ts` | Lit les réglages du fichier `.env` |
| `supabase/functions/chat/index.ts` | La fonction serveur qui appelle Claude |

---

## Installation, étape par étape

### Ce qu'il te faut avant de commencer

1. **Node.js** installé sur ton ordinateur (version 20 ou plus) — https://nodejs.org
2. Un **compte Supabase** (gratuit) — https://supabase.com
3. Une **clé API Anthropic** — https://console.anthropic.com
4. L'application **Expo Go** installée sur ton téléphone (App Store ou Play Store)

Ton ordinateur et ton téléphone doivent être sur le **même réseau Wi-Fi**.

---

### Étape 1 — Récupérer le code et installer les dépendances

```bash
git clone https://github.com/Prodigexcellence/english-conversation-app.git
cd english-conversation-app
npm install
```

`npm install` télécharge toutes les bibliothèques nécessaires. C'est un peu long la
première fois, c'est normal.

---

### Étape 2 — Créer le projet Supabase

1. Va sur https://supabase.com, connecte-toi, clique sur **New project**.
2. Donne-lui un nom (par exemple `english-conversation`), choisis un mot de passe de
   base de données, et attends que le projet finisse de se créer (1 à 2 minutes).
3. Une fois créé, va dans **Project Settings → API**. Note deux valeurs :
   - **Project URL** (ressemble à `https://abcdefgh.supabase.co`)
   - **anon public key** (une longue chaîne qui commence par `eyJ...`)

Ces deux valeurs ne sont **pas secrètes** : elles sont faites pour être dans l'app.

---

### Étape 3 — Renseigner le fichier `.env`

Dans le dossier du projet :

```bash
cp .env.example .env
```

Ouvre le fichier `.env` avec un éditeur de texte et remplace les deux valeurs par
celles de l'étape 2 :

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ **Ne mets jamais ta clé API Anthropic dans ce fichier.** Elle va ailleurs (étape 4).
> Le fichier `.env` est ignoré par Git, il ne partira jamais sur GitHub.

---

### Étape 4 — Déployer la fonction serveur

Installe l'outil en ligne de commande Supabase :

```bash
npm install -g supabase
```

Puis, toujours dans le dossier du projet :

```bash
# 1. Se connecter (ouvre une page web pour t'identifier)
supabase login

# 2. Relier ce dossier à ton projet Supabase
#    (l'identifiant se trouve dans l'URL de ton tableau de bord Supabase,
#     https://supabase.com/dashboard/project/ICI)
supabase link --project-ref TON_IDENTIFIANT_DE_PROJET

# 3. Déposer la clé API Claude côté serveur — c'est ici que le secret vit
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 4. Envoyer la fonction en ligne
supabase functions deploy chat
```

Si la dernière commande affiche « Deployed Function chat », c'est bon.

---

### Étape 5 — Lancer l'app sur ton téléphone

```bash
npm start
```

Un QR code s'affiche dans le terminal.

- **iPhone** : ouvre l'appareil photo et vise le QR code.
- **Android** : ouvre Expo Go et utilise « Scan QR code ».

L'app se charge sur ton téléphone. Au bout de quelques secondes, **c'est l'IA qui
envoie le premier message** — à toi de répondre en anglais.

---

## Où est la clé API Claude ?

Uniquement dans les secrets Supabase (`supabase secrets set ANTHROPIC_API_KEY=...`).
Elle est lue par la fonction serveur au moment de l'appel :

```ts
const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
```

Elle n'est **jamais** dans le code de l'app, jamais dans `.env`, jamais sur GitHub.
Si un jour tu penses l'avoir exposée par erreur, va sur la console Anthropic, révoque-la
et crée-en une nouvelle.

---

## Problèmes courants

| Ce que tu vois | Ce qu'il faut faire |
|---|---|
| « Configuration manquante… » | Le fichier `.env` n'existe pas ou est vide. Refais l'étape 3, puis arrête `npm start` (Ctrl+C) et relance-le. |
| « Le serveur a répondu avec une erreur (500) » | Le secret `ANTHROPIC_API_KEY` n'est pas posé, ou la clé est invalide. Refais l'étape 4.3 puis redéploie (4.4). |
| « Le serveur a répondu avec une erreur (401) » | La clé `anon` dans `.env` est fausse. Recopie-la depuis Project Settings → API. |
| « Le serveur a répondu avec une erreur (404) » | La fonction n'est pas déployée. Relance `supabase functions deploy chat`. |
| « Connexion impossible » | Téléphone et ordinateur pas sur le même Wi-Fi, ou pas de réseau. |
| Le QR code ne se scanne pas | Vérifie que Expo Go est bien installé et que les deux appareils sont sur le même Wi-Fi. |

Pour voir ce qui se passe côté serveur : tableau de bord Supabase → **Edge Functions →
chat → Logs**.

---

## Commandes utiles

```bash
npm start              # lancer l'app (QR code pour Expo Go)
npx tsc --noEmit       # vérifier qu'il n'y a pas d'erreur TypeScript
supabase functions deploy chat   # redéployer la fonction après modification
```

## La suite

Voir [`docs/roadmap.md`](docs/roadmap.md) pour les prochaines étapes (sauvegarde des
conversations, profil utilisateur, puis la voix).
