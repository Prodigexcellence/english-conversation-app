# Logo New Language

Mosaïque de drapeaux penchés vers la gauche, en rangées droites, coins arrondis, sur fond bleu maya clair `#8FB0FA`.
Validé le 11 novembre 2026. Drapeaux visibles : Royaume-Uni, Japon, Brésil, France, Allemagne, États-Unis,
Angola, Chine, Espagne, Italie, Arabie saoudite, Inde.

- `logo.svg` : logo arrondi ; `icon.svg` : carré plein pour l'icône d'app.
- `gen/` : scripts qui produisent tous les formats (iPhone, Android, écran de démarrage, favicon).

Pour régénérer, depuis ce dossier `design/logo` :

```bash
python3 gen/export.py   # écrit gen/*.svg
node gen/render.js      # écrit gen/*.png (demande Playwright)
```

Les PNG sont ensuite copiés dans `assets/images/` (`icon.png` sans transparence, `logo.png`, `splash-icon.png`,
`android-icon-foreground.png`, `android-icon-monochrome.png`, `favicon.png`).
Pour changer un pays : modifier la liste `ORDER` dans `gen/flags6.py` (les dessins des drapeaux sont dans `gen/flags.py`).
