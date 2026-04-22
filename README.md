# 🏛️ TaxObservatory : Data-Visualisation des Taxes d'Habitation en France

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![API Platform](https://img.shields.io/badge/API_Platform-000000?style=flat&logo=api-platform&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 📊 À propos du projet
**TaxObservatory** est une plateforme moderne de Business Intelligence (BI) dédiée à l'analyse des taxes d'habitation françaises. En exploitant les données ouvertes du gouvernement, ce projet transforme des millions de lignes de données brutes en insights visuels compréhensibles pour le grand public et les décideurs.

L'objectif est d'offrir une transparence totale sur l'évolution fiscale à travers les régions, les départements et les communes de France.

### 🌟 Points forts :
- **Analyses Temporelles** : Visualisez l'évolution des taxes sur plusieurs années pour identifier les tendances de fond.
- **Classements Régionaux** : Comparez la pression fiscale entre les différentes régions françaises grâce à des rankings dynamiques.
- **Corrélations Avancées** : Explorez les liens entre les indicateurs fiscaux et les spécificités géographiques des communes.
- **Interface Haute Performance** : Une Progressive Web App (PWA) ultra-fluide pour une consultation optimale sur mobile et desktop.

---

## 🏗️ Stack Technique & Architecture

Le projet utilise une architecture découplée (Headless) pour garantir scalabilité et maintenabilité :

1.  **Backend (API)** : Propulsé par **Laravel** et **API Platform**. Il gère l'agrégation complexe des données fiscales et expose des points de terminaison performants.
2.  **Frontend (PWA)** : Développé avec **Next.js 15** et **TailwindCSS**. Il offre une expérience utilisateur riche avec des graphiques interactifs (via Recharts/Chart.js).
3.  **Infrastructure** : Entièrement conteneurisé avec **Docker** et **FrankenPHP** pour des performances d'exécution web supérieures.
4.  **Qualité logicielle** : Tests automatisés complets avec **Vitest** (Frontend) et **PHPUnit** (Backend).

---

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Global** : Vue d'ensemble des statistiques nationales dès l'accueil.
- **Exploration par Région** : Sélecteur interactif pour filtrer les données et comparer les territoires.
- **Visualisations de Données** :
    - **Diagrammes** : Répartition des taxes par types de terrains ou d'habitations.
    - **Séries Temporelles** : Courbes d'évolution pour anticiper les futures variations.
    - **Analyse de Corrélation** : Nuages de points pour comprendre les facteurs influençant la taxe.

---

## 🛠️ Installation & Déploiement

### Prérequis
- Docker & Docker Compose

### Lancement Rapide

1.  **Démarrer l'infrastructure** :
    ```bash
    docker compose up -d
    ```

2.  **Initialiser les données** :
    ```bash
    docker compose exec api php artisan migrate --seed
    ```

### Accès
- **Application Web** : `https://localhost`
- **API (Swagger/Redoc)** : `https://localhost/api/docs`

---

## 👥 L'Équipe
Ce projet a été réalisé avec passion par une équipe de 4 développeurs dédiés à la data-visualisation : **Clément FLAMBARD, Adrien DELMASTRO, Julien FURET et Jérémy DEZETREE (moi)**.

---

## 📄 Licence
Ce projet est sous licence MIT.