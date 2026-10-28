# English Conversation

Application mobile pour pratiquer l'anglais à l'oral avec une IA qui prend l'initiative,
relance et corrige en douceur.

Le document de référence est le cahier des charges :
https://claude.ai/artifact/9xJQNBdQTj44qMyuFnav5Y

**État actuel : étape 0.** Le projet vient d'être recréé à partir de zéro (Expo SDK 58,
Expo Router). L'écran d'accueil affiche seulement le nom de l'app.

L'ancien squelette de septembre 2026 reste disponible sur la branche
`claude/mobile-app-github-project-fj79b2`.

## Ouvrir l'app sur l'iPad

L'app est publiée avec EAS Update sur le projet Expo
[`@prodigexcellences-team/english-conversation-app`](https://expo.dev/accounts/prodigexcellences-team/projects/english-conversation-app),
branche de mise à jour `refonte`. Avec Expo Go installé, ouvrir ce lien sur l'iPad :

```
exp://u.expo.dev/ea881a42-d033-4081-b16f-9bd946d08525?channel-name=refonte
```

Après chaque changement, republier :

```bash
npx eas-cli@latest update --branch refonte --platform ios --environment preview --message "…"
```

`runtimeVersion` utilise la politique `sdkVersion` (`exposdk:58.0.0`) : c'est la seule
qu'Expo Go accepte. À changer le jour où l'app passera à un build EAS.

## Lancer l'app en local

```bash
npm install
npx expo start
```

Puis ouvrir l'app dans Expo Go sur l'iPad (QR code ou lien affiché par la commande).

## Vérifications avant chaque enregistrement

```bash
npx tsc --noEmit   # types
npx expo lint      # style du code
npx expo-doctor    # compatibilité des dépendances
```
