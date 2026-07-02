# PdfStudio

Édition de PDF simple et ergonomique, 100% côté navigateur — aucun fichier n'est envoyé à un serveur.

## Outils disponibles

- **Organiser** — réorganiser, supprimer, pivoter des pages
- **Fusionner** — combiner plusieurs PDF en un seul
- **Diviser** — extraire des pages ou scinder un PDF
- **Images ↔ PDF** — conversion dans les deux sens
- **Filigrane** — texte avec aperçu en direct
- **Numéros de page** — numérotation automatique
- **Compresser** — compression basique

## Stack

React + TypeScript + Vite + Tailwind CSS v4, `pdf-lib` + `pdfjs-dist` pour la manipulation/rendu PDF, `@dnd-kit` pour le glisser-déposer, `jszip` pour les téléchargements groupés.

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Déployé sur Vercel, connecté au dépôt GitHub — chaque push sur `master` redéploie automatiquement.
