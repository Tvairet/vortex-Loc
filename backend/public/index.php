<?php

use App\Core\Database;
use App\Core\Response;
use App\Core\Router;
use App\Controllers\VehicleController;
use App\Controllers\AuthController;
use App\Models\Vehicle;
use App\Models\User;
use App\Services\VehicleService;
use App\Services\AuthService;

// Chargement des classes
require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Core/Router.php';

require_once __DIR__ . '/../src/Models/Vehicle.php';
require_once __DIR__ . '/../src/Models/User.php';

require_once __DIR__ . '/../src/Services/VehicleService.php';
require_once __DIR__ . '/../src/Services/AuthService.php';

require_once __DIR__ . '/../src/Controllers/VehicleController.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';

// Configuration CORS pour React
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

// Réponse à la requête préalable du navigateur
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    // Connexion MySQL
    $config = require __DIR__ . '/../config/Database.php';
    $database = new Database($config);

    // Gestion des véhicules
    $vehicleModel = new Vehicle($database);
    $vehicleService = new VehicleService($vehicleModel);
    $vehicleController = new VehicleController($vehicleService);

    // Gestion des utilisateurs
    $userModel = new User($database);
    $authService = new AuthService($userModel);
    $authController = new AuthController($authService);

    // Router
    $router = new Router();

    // Routes véhicules
    $router->get(
        '/api/vehicles',
        [$vehicleController, 'index']
    );

    $router->get(
        '/api/vehicles/{id}',
        [$vehicleController, 'show']
    );

    // Route d'inscription
    $router->post(
        '/api/auth/register',
        [$authController, 'register']
    );

    $router->post(
        '/api/auth/login',
        [$authController, 'login']
    );
    $router->get(
        '/api/auth/me',
        [$authController, 'me']
    );
    $router->post(
        '/api/auth/logout',
        [$authController, 'logout']
    );

    // Exécution de la route
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
