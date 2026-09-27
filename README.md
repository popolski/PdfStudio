# PdfStudio

Édition de PDF simple et ergonomique, 100% côté navigateur — aucun fichier n'est envoyé à un serveur.

## Outils disponibles

- **Organiser** — réorganiser, supprimer, pivoter des pages
- **Fusionner** — combiner plusieurs PDF en un seul
- **Diviser** — extraire des pages ou scinder un PDF
- **Images ↔ PDF** — conversion dans les deux sens
- **Filigrane** — texte avec aperçu en direct
- **Numéros de page** — numérotation automatique
- **Compresser** — compression légère ou forte
- **PDF vers HTML, Word ou Excel** — extraction du texte (mise en page approximative)
- **Image vers texte** — reconnaissance OCR dans le navigateur

Les PDF chiffrés ne sont pas pris en charge. La compression forte transforme les pages en images et supprime la sélection du texte.

L'interface regroupe les outils dans une barre de navigation. Chaque outil ouvre et traite ses propres fichiers dans le navigateur ; le bouton de téléchargement apparaît une fois le résultat prêt.

## Stack

React + TypeScript + Vite + Tailwind CSS v4, `pdf-lib` + `pdfjs-dist` pour la manipulation/rendu PDF, `@dnd-kit` pour le glisser-déposer, `jszip` pour les téléchargements groupés.

## Développement

```bash
npm install
npm run dev
npm test
npm run build
```

## Déploiement

Déployé sur Vercel, connecté au dépôt GitHub — chaque push sur `master` redéploie automatiquement.
Les routes de l'application (par exemple `/fusion`) sont redirigées vers `index.html` pour permettre l'ouverture directe et l'actualisation d'une page.
