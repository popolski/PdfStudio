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
