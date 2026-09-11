# CollabHub
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-blue)
![License](https://img.shields.io/badge/statut-projet%20de%20stage-lightgrey)
**CollabHub** est une plateforme web de gestion collaborative de projets, développée dans le cadre d'un stage. Elle permet à une organisation de structurer ses équipes en pôles, de piloter des projets et des tâches en mode Kanban, et de collaborer en temps réel (commentaires, mentions, notifications, pièces jointes).
## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Modèle organisationnel & rôles](#modèle-organisationnel--rôles)
- [Architecture](#architecture)
- [Modèle de données (simplifié)](#modèle-de-données-simplifié)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Limitations connues](#limitations-connues)
- [Structure du dépôt](#structure-du-dépôt)

---
## Aperçu

CollabHub couvre le cycle de vie complet d'un projet :

- Création et suivi de **projets** et de **tâches** (vue Kanban avec glisser-déposer)
- Organisation matricielle en **pôles** (équipes fixes) et en **équipes projet** (dynamiques)
- **Collaboration en temps réel** : commentaires filetés avec mentions, notifications instantanées, indicateur de statut d'activité (disponible / en réunion / en pause / hors ligne)
- **Pièces jointes** par tâche
- **Tableau de bord** avec statistiques (avancement, répartition par statut, activité mensuelle)
- Gestion sécurisée des comptes (création par un administrateur, mot de passe temporaire envoyé par email, réinitialisation de mot de passe)

---
## Fonctionnalités

### Gestion de projets & tâches
- Création, modification, suivi d'avancement des projets (statut, priorité, échéance)
- Tâches organisées en Kanban (À faire / En cours / Bloquée / Terminée) avec glisser-déposer
- Affectation de plusieurs collaborateurs par tâche
- Historique d'activité par projet (création, modification, ajout/retrait de membres)
- Alertes automatiques d'échéance (approchante / dépassée) pour les tâches et les projets

### Organisation & équipes
- **Pôles** : structure organisationnelle fixe (ex. Pôle Dev, Pôle QA), un utilisateur pouvant appartenir à plusieurs pôles
- **Équipe projet** : composition dynamique et indépendante des pôles, propre à chaque projet
- Ajout / retrait de membres avec traçabilité (soft delete, historique conservé)

### Collaboration
- Espace de discussion par projet et par tâche : commentaires filetés (réponses imbriquées), mentions (`@utilisateur` ou `@tous`)
- Notifications en temps réel (WebSocket/STOMP) et notifications persistées, avec toasts et centre de notifications
- Statut de présence en direct (disponible, en réunion, en pause, hors ligne), mis à jour automatiquement à la connexion/déconnexion

### Fichiers
- Upload, téléchargement, renommage et suppression de pièces jointes par tâche
- Contrôle d'accès basé sur le rôle et l'affectation à la tâche

### Comptes & sécurité
- Création de compte réservée à l'administrateur : mot de passe temporaire généré aléatoirement et envoyé par email
- Authentification par JWT, autorisations fines par endpoint (`@PreAuthorize`)
- Suspension de compte : blocage HTTP immédiat et déconnexion forcée des sessions WebSocket actives
- Réinitialisation de mot de passe par email (lien à usage unique, expirant)

### Tableau de bord
- Statistiques globales (membres actifs, projets, tâches, taux de complétion)
- Répartition des projets/tâches par statut, activité mensuelle (créées vs terminées)
