# Vortex’Loc

Application de démonstration de location de véhicules réalisée pour le titre professionnel Développeur web et web mobile. Un visiteur peut parcourir la flotte, puis se connecter pour déposer une demande de réservation. Un administrateur peut traiter les demandes et gérer les immobilisations. Une réservation de démonstration ne donne lieu à aucun paiement.

[Consulter le site sur Alwaysdata](https://vortexloc.alwaysdata.net/) · [Ouvrir le catalogue](https://vortexloc.alwaysdata.net/flotte)

## Documents pour le jury

- [Dossier de projet (PDF, 45 pages)](soutenance/VortexLoc_Dossier_Projet_Vairet_Tristan.pdf)
- [Présentation orale de Vairet Tristan (PowerPoint, 25 diapositives)](soutenance/VortexLoc_Soutenance_Vairet_Tristan.pptx)

## Découvrir le projet

Depuis l’accueil, choisir **Découvrir la flotte**, ouvrir la fiche d’un véhicule, puis accéder au formulaire de réservation. L’espace compte regroupe les demandes du client. Le serveur recalcule le prix à partir du catalogue et vérifie la disponibilité avant l’enregistrement.

| Dossier | Contenu |
| --- | --- |
| `frontend/src/pages` | Pages React du catalogue, des réservations et de l’administration |
| `frontend/src/services` | Appels à l’API et gestion du jeton CSRF |
| `backend/public/index.php` | Point d’entrée et déclaration des routes HTTP |
| `backend/src` | Contrôleurs, règles métier, modèles PDO et contrôles d’accès |
| `backend/sql` | Schéma relationnel, migrations et données de démonstration |

## Démarrer en local avec XAMPP

L’exemple utilise Windows, Apache avec la réécriture d’URL activée et les fichiers .htaccess autorisés, PHP 8 avec PDO MySQL et mbstring, MySQL ou MariaDB, et Node.js 22.12 ou supérieur avec npm. Il suppose qu’Apache sert le dossier `htdocs` sur `http://localhost`.

1. Placer le dépôt dans `C:\xampp\htdocs\vortex-loc`. Démarrer Apache et le serveur de base de données dans XAMPP.
2. Sur une instance locale de développement, importer `backend/sql/schema.sql`. Ce script sélectionne la base `vortex_loc`. Dans cette base, importer `backend/sql/seed_vehicles.sql`, puis exécuter `backend/sql/verifier_seed.sql` pour contrôler le catalogue. Pour une installation neuve, utiliser le schéma complet.
3. Configurer `backend/config/local.php` avec un compte SQL local autorisé à lire et modifier les données de cette base. Remplacer les exemples ci-dessous par les valeurs locales et conserver ce fichier hors de Git.

```php
<?php
return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_NAME' => 'vortex_loc',
    'DB_USER' => 'votre_utilisateur_sql',
    'DB_PASSWORD' => 'votre_mot_de_passe_local',
    'APP_FRONTEND_ORIGIN' => 'http://localhost:5173',
];
```

4. Depuis la racine du dépôt, lancer ces commandes PowerShell. Si la configuration de développement existe déjà, vérifier que `VITE_API_URL` pointe vers `http://localhost/vortex-loc/backend/public/api`.

```powershell
cd frontend
if (!(Test-Path .env.development)) { Copy-Item .env.example .env.development }
npm ci
npm run dev -- --port 5173 --strictPort
```

5. Ouvrir [l’accueil local](http://localhost:5173/) et [le catalogue JSON de l’API](http://localhost/vortex-loc/backend/public/api/vehicles). Pour tester une réservation, créer un compte de démonstration dans l’application. Garder le même nom d’hôte pendant le parcours pour que l’origine et le cookie de session correspondent à la configuration.

## Commandes du frontend

Depuis `frontend`, utiliser `npm run lint` pour l’analyse statique et `npm run build` pour produire les fichiers dans `dist`. La commande `npm run preview` permet de consulter ce build. Pour y tester des opérations authentifiées, ajuster l’origine autorisée au port de prévisualisation.

## API et documentation

[Consulter Swagger UI](https://vortexloc.alwaysdata.net/docs/) ou télécharger le [contrat OpenAPI](https://vortexloc.alwaysdata.net/docs/VortexLoc_OpenAPI.json). Les fichiers hors ligne se trouvent dans `frontend/public/docs/`.

| Opération | Usage |
| --- | --- |
| `GET /api/vehicles` | Consulter la flotte |
| `GET /api/vehicles/{id}` | Lire la fiche d’un véhicule |
| `GET /api/auth/csrf` | Obtenir le jeton associé à la session |
| `POST /api/auth/login` | Ouvrir une session client |
| `POST /api/reservations` | Déposer une demande |
| `GET /api/reservations/me` | Consulter ses demandes |
| `PATCH /api/reservations/{id}/cancel` | Annuler une demande éligible |

## Validation documentée

Le dossier de projet présente six cas sur le chevauchement des dates, quatre cas sur l’admissibilité du pack Évasion et une réservation complète exécutée dans un environnement local isolé. Pour trois jours à 499 € sans option, l’API a répondu HTTP 201 et la base a enregistré 1 497 €, 300 km inclus et le statut `pending`. Les captures de l’accueil et du catalogue de production proviennent du site Alwaysdata.

## Dossier et prototype

[Dossier PDF](https://vortexloc.alwaysdata.net/docs/dossier.pdf) · [Version Word](https://vortexloc.alwaysdata.net/docs/dossier.docx) · [Prototype interactif](https://vortexloc.alwaysdata.net/docs/prototype.html)

