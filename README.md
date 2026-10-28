# English Conversation

Application mobile pour pratiquer l'anglais à l'oral avec une IA qui prend l'initiative,
relance et corrige en douceur.

Le document de référence est le cahier des charges :
https://claude.ai/artifact/9xJQNBdQTj44qMyuFnav5Y

**État actuel : étape 0.** Le projet vient d'être recréé à partir de zéro (Expo SDK 58,
Expo Router). L'écran d'accueil affiche seulement le nom de l'app.

L'ancien squelette de septembre 2026 reste disponible sur la branche
`claude/mobile-app-github-project-fj79b2`.

## Lancer l'app

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
