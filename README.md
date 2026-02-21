<div align="center">

# 📋 Job Tracker

**Dashboard personnel pour suivre et piloter ses candidatures — stage, alternance, emploi**

*Gardez le contrôle sur toute votre recherche d'emploi, quel que soit le type de contrat*

<img width="1919" height="893" alt="Dashboard Stage Tracker" src="https://github.com/user-attachments/assets/47c5e355-b96f-4bd9-88e4-34474d16b37b" />

</div>

---

## Vue d'ensemble

Job Tracker est une **SPA légère, sans framework ni backend**, qui tourne entièrement dans le navigateur. Toutes les données sont sauvegardées en `localStorage` — aucune inscription, aucun serveur, aucune dépendance externe critique.

---

## Fonctionnalités

### Vues
| Vue | Description |
|-----|-------------|
| **Liste** | Tableau trié et filtrable — statut, secteur, priorité, recherche textuelle |
| **Kanban** | Colonnes drag & drop par statut, vue visuelle de l'avancement |
| **Timeline** | Historique chronologique des candidatures groupées par mois |

### Suivi & analyse
- **KPIs animés** — Total, En cours, Entretiens, Offres reçues, Refus
- **Objectif de candidatures** — barre de progression, confettis 🎉 à l'atteinte de l'objectif
- **Badge relance** — alerte automatique ⏰ si aucune réponse depuis 7 jours (statuts *Postulé* / *Relance*)
- **Notes par entreprise** — mini-modal dédié pour annoter chaque candidature

### Données
- **Export PDF** — rapport mis en page avec KPIs et tableau (jsPDF + AutoTable)
- **Export Excel** — fichier `.xls` exploitable
- **Export JSON** — sauvegarde brute complète
- **Import JSON** — restauration instantanée depuis un fichier de sauvegarde

### Interface
- **Type de contrat** — Stage · Alternance · CDI · CDD · Freelance · Autre, filtrable et affiché sur chaque candidature
- **10 thèmes** — Clair · Sombre · Café · Café ☾ · Pistache · Pistache ☾ · Océan · Océan ☾ · Pastel · Pastel ☾
- **Mode présentation** — vue lecture seule, idéale pour montrer son avancement sans risque d'édition
- **État vide soigné** — deux états distincts (aucune donnée vs. aucun résultat de filtre)
- **Raccourcis clavier** — navigation rapide au clavier
- **Responsive** — adapté mobile et tablette

---

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| `N` | Ouvrir le formulaire d'ajout |
| `/` | Mettre le focus sur la recherche |
| `Échap` | Fermer la modal ouverte |

---

## Thèmes

Le sélecteur de thème permet de basculer entre 10 palettes, chacune déclinée en version claire et sombre. Le choix est mémorisé automatiquement.

```
Clair  ·  Sombre  ·  Café  ·  Café ☾  ·  Pistache  ·  Pistache ☾
Océan  ·  Océan ☾  ·  Pastel  ·  Pastel ☾
```

---

## Stack

| Technologie | Rôle |
|-------------|------|
| HTML / CSS / JS vanilla | Interface et logique applicative |
| [Flatpickr](https://flatpickr.js.org/) | Sélecteur de date stylisé |
| [jsPDF](https://github.com/parallax/jsPDF) + [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Export PDF |
| `localStorage` | Persistance des données côté client |

---

## Lancement

**Aucune installation requise.** L'application est disponible en ligne via GitHub Pages :

> 🔗 **[Ouvrir Job Tracker](https://kowayz.github.io/Stage-Tracker/)**

Ou en local, en ouvrant simplement `index.html` dans un navigateur.

---

## Structure

```
├── index.html      # Structure HTML & modals
├── app.js          # Logique applicative (état, vues, exports…)
├── styles.css      # Thèmes & composants
└── favicon.svg     # Icône de l'onglet
```

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=18&pause=3000&color=C084FC&center=true&vCenter=true&width=400&lines=%E2%9C%A6+Enti%C3%A8rement+vibe+cod%C3%A9+%E2%9C%A6" alt="Entièrement vibe codé" />

</div>
