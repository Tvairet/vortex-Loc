<?php

use App\Core\Database;
use App\Core\AppConfig;
use App\Core\Response;
use App\Core\Router;

use App\Models\Vehicle;
use App\Models\User;
use App\Models\Reservation;
use App\Models\VehicleUnavailability;
use App\Models\RentalOption;

use App\Services\VehicleService;
use App\Services\AuthService;
use App\Services\ReservationService;
use App\Services\RentalOptionService;
use App\Services\VehicleUnavailabilityService;
use App\Services\UserService;
use App\Services\StatisticsService;

use App\Controllers\VehicleController;
use App\Controllers\AuthController;
use App\Controllers\ReservationController;
use App\Controllers\RentalOptionController;
use App\Controllers\AdminController;

use App\Middleware\AdminMiddleware;
use App\Middleware\CsrfMiddleware;
/*
|--------------------------------------------------------------------------
| CHARGEMENT DES CLASSES
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../autoload.php';

/*
|--------------------------------------------------------------------------
| CONFIGURATION CORS
|--------------------------------------------------------------------------
*/

$allowedOrigin = rtrim(
    AppConfig::get('APP_FRONTEND_ORIGIN', 'http://localhost:5173'),
    '/'
);
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Vary: Origin');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if ($requestOrigin === $allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code($requestOrigin === $allowedOrigin ? 204 : 403);
    exit;
}

/*
|--------------------------------------------------------------------------
| PROTECTION DES REQUÊTES DE MODIFICATION
|--------------------------------------------------------------------------
*/

$csrfMiddleware = new CsrfMiddleware();

if (!$csrfMiddleware->handle()) {
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
    $rentalOptionModel = new RentalOption($database);
    $rentalOptionService = new RentalOptionService($rentalOptionModel);
    $rentalOptionController = new RentalOptionController($rentalOptionService);

    $reservationService = new ReservationService(
        $reservationModel,
        $vehicleModel,
        $userModel,
        $unavailabilityModel,
        $rentalOptionModel,
        $rentalOptionService
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

    $unavailabilityService = new VehicleUnavailabilityService($unavailabilityModel, $vehicleModel, $reservationModel);

    $statisticsService = new StatisticsService($reservationModel, $vehicleModel, $userModel);

    $adminController = new AdminController($adminMiddleware, $reservationService, $vehicleService, $unavailabilityService, $userService, $statisticsService);

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
    $router->post('/api/auth/register', [$authController, 'register']);

    // Connexion
    $router->post('/api/auth/login', [$authController, 'login']);

    // Vérifier l'utilisateur connecté
    $router->get('/api/auth/me', [$authController, 'me']);

    // Déconnexion
    $router->post('/api/auth/logout', [$authController, 'logout']);

    $router->get('/api/auth/csrf', [$authController, 'csrf']);

    /*
    |--------------------------------------------------------------------------
    | ROUTES RÉSERVATIONS
    |--------------------------------------------------------------------------
    */

    // Catalogue public des options de location
    $router->get('/api/rental-options', [$rentalOptionController, 'index']);

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
    // Statistiques générales — accès administrateur
    $router->get(
        '/api/admin/stats',
        [$adminController, 'statistics']
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
