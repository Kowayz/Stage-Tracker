# 🎯 Stage Tracker

Dashboard personnel pour suivre et gérer ses candidatures de stage — conçu pour les étudiants

---

## Aperçu

Une SPA (Single Page Application) légère, sans framework ni backend, qui tourne entièrement dans le navigateur.

## Fonctionnalités

- **Vue liste** — tableau trié et filtrable (statut, secteur, priorité, recherche)
- **Vue Kanban** — colonnes drag & drop par statut
- **Formulaire** — ajout/édition avec calendrier personnalisé (Flatpickr)
- **KPIs** — compteurs animés (total, actives, entretiens, offres, refus)
- **Thème clair / sombre** — palette café chaud ☕
- **Export** — JSON et Excel (.xls)
- **Import** — restauration depuis JSON
- **Persistance** — sauvegarde automatique en `localStorage`

## Stack

| Technologie             | Rôle                      |
| ----------------------- | ------------------------- |
| HTML / CSS / JS vanilla | Interface et logique      |
| Flatpickr               | Sélecteur de date stylisé |
| localStorage            | Persistance des données   |

## Lancement

Aucune installation requise. Ouvrir `index.html` dans un navigateur.

## Structure

```
├── index.html   # Structure HTML
├── app.js       # Logique applicative
├── styles.css   # Thème & composants
└── favicon.svg
```

---
