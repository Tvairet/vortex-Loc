<?php

use App\Core\Database;
use App\Core\Response;
use App\Core\Router;

use App\Models\Vehicle;
use App\Models\User;
use App\Models\Reservation;
use App\Models\VehicleUnavailability;

use App\Services\VehicleService;
use App\Services\AuthService;
use App\Services\ReservationService;
use App\Services\VehicleUnavailabilityService;
use App\Services\UserService;

use App\Controllers\VehicleController;
use App\Controllers\AuthController;
use App\Controllers\ReservationController;
use App\Controllers\AdminController;

use App\Middleware\AdminMiddleware;
/*
|--------------------------------------------------------------------------
| CHARGEMENT DES CLASSES
|--------------------------------------------------------------------------
*/

// Core
require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Core/Router.php';

// Models
require_once __DIR__ . '/../src/Models/Vehicle.php';
require_once __DIR__ . '/../src/Models/User.php';
require_once __DIR__ . '/../src/Models/Reservation.php';
require_once __DIR__ . '/../src/Models/VehicleUnavailability.php';

// Services
require_once __DIR__ . '/../src/Services/VehicleService.php';
require_once __DIR__ . '/../src/Services/AuthService.php';
require_once __DIR__ . '/../src/Services/ReservationService.php';
require_once __DIR__ . '/../src/Services/VehicleUnavailabilityService.php';
require_once __DIR__ . '/../src/Services/UserService.php';

// Controllers
require_once __DIR__ . '/../src/Controllers/VehicleController.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/ReservationController.php';
require_once __DIR__ . '/../src/Controllers/AdminController.php';

// Middleware
require_once __DIR__ . '/../src/Middleware/AdminMiddleware.php';

/*
|--------------------------------------------------------------------------
| CONFIGURATION CORS
|--------------------------------------------------------------------------
*/

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

// Gestion des requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| INITIALISATION DE L'APPLICATION
|--------------------------------------------------------------------------
*/

try {

    // Connexion à MySQL
    $config = require __DIR__ . '/../config/Database.php';
    $database = new Database($config);

    /*
    |--------------------------------------------------------------------------
    | VÉHICULES
    |--------------------------------------------------------------------------
    */

    $vehicleModel = new Vehicle($database);

    $vehicleService = new VehicleService(
        $vehicleModel
    );

    $vehicleController = new VehicleController(
        $vehicleService
    );

    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    $userModel = new User($database);
    $userService = new UserService($userModel);

    $authService = new AuthService(
        $userModel
    );

    $authController = new AuthController(
        $authService
    );

    /*
    |--------------------------------------------------------------------------
    | RÉSERVATIONS
    |--------------------------------------------------------------------------
    */

    $reservationModel = new Reservation($database);
    $unavailabilityModel = new VehicleUnavailability($database);

    $reservationService = new ReservationService(
        $reservationModel,
        $vehicleModel,
        $userModel,
        $unavailabilityModel
    );

    $reservationController = new ReservationController(
        $reservationService
    );

    /*
    |--------------------------------------------------------------------------
    | ADMINISTRATION
    |--------------------------------------------------------------------------
    */

    $adminMiddleware = new AdminMiddleware($userModel);

    $unavailabilityService = new VehicleUnavailabilityService($unavailabilityModel, $vehicleModel);

    $adminController = new AdminController($adminMiddleware, $reservationService, $vehicleService, $unavailabilityService, $userService);

    /*
    |--------------------------------------------------------------------------
    | ROUTER
    |--------------------------------------------------------------------------
    */

    $router = new Router();

    /*
    |--------------------------------------------------------------------------
    | ROUTES VÉHICULES
    |--------------------------------------------------------------------------
    */

    // Récupérer tous les véhicules disponibles
    $router->get(
        '/api/vehicles',
        [$vehicleController, 'index']
    );

    // Récupérer un véhicule par son ID
    $router->get(
        '/api/vehicles/{id}',
        [$vehicleController, 'show']
    );

    $router->get(
        '/api/admin/vehicles',
        [$adminController, 'vehicles']
    );

    // Ajouter un véhicule depuis l'administration
    $router->post(
        '/api/admin/vehicles',
        [$adminController, 'createVehicle']
    );

    // Enregistrer une immobilisation
    $router->post(
        '/api/admin/vehicles/{id}/unavailability',
        [$adminController, 'createVehicleUnavailability']
    );

    // Valider la remise en service
    $router->patch(
        '/api/admin/vehicles/{id}/restore',
        [$adminController, 'restoreVehicle']
    );

    $router->get(
        '/api/admin/vehicles/{id}/unavailability',
        [$adminController, 'vehicleUnavailabilityHistory']
    );

    $router->patch(
        '/api/admin/vehicles/{id}',
        [$adminController, 'updateVehicle']
    );

    /*
    |--------------------------------------------------------------------------
    | ROUTES AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    // Inscription
    $router->post(
        '/api/auth/register',
        [$authController, 'register']
    );

    // Connexion
    $router->post(
        '/api/auth/login',
        [$authController, 'login']
    );

    // Vérifier l'utilisateur connecté
    $router->get(
        '/api/auth/me',
        [$authController, 'me']
    );

    // Déconnexion
    $router->post(
        '/api/auth/logout',
        [$authController, 'logout']
    );

    /*
    |--------------------------------------------------------------------------
    | ROUTES RÉSERVATIONS
    |--------------------------------------------------------------------------
    */

    // Créer une réservation
    $router->post(
        '/api/reservations',
        [$reservationController, 'store']
    );

    // Récupérer les réservations du client connecté
    $router->get(
        '/api/reservations/me',
        [$reservationController, 'myReservations']
    );

    // Annulation d'une réservation
    $router->patch(
        '/api/reservations/{id}/cancel',
        [$reservationController, 'cancel']
    );

    /*
    |--------------------------------------------------------------------------
    | EXÉCUTION DU ROUTER
    |--------------------------------------------------------------------------
    */

    // Tableau de bord administrateur
    $router->get(
        '/api/admin/dashboard',
        [$adminController, 'dashboard']
    );

    // Liste des réservations pour l'administration
    $router->get(
        '/api/admin/reservations',
        [$adminController, 'reservations']
    );

    // Liste des utilisateurs — accès administrateur
    $router->get(
        '/api/admin/users',
        [$adminController, 'users']
    );

    // Confirmer une réservation
    $router->patch(
        '/api/admin/reservations/{id}/confirm',
        [$adminController, 'confirmReservation']
    );

    // Refuser une réservation
    $router->patch(
        '/api/admin/reservations/{id}/reject',
        [$adminController, 'rejectReservation']
    );

    $router->dispatch(
        $_SERVER['REQUEST_METHOD'],
        $_SERVER['REQUEST_URI']
    );
} catch (\Throwable $error) {

    error_log($error->getMessage());

    Response::json([
        'message' => 'Erreur interne du serveur.'
    ], 500);
}
