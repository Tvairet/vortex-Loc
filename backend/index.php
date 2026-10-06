<?php

declare(strict_types=1);

use App\Controllers\VehicleController;
use App\Core\Autoloader;
use App\Core\Database;
use App\Core\Router;
use App\Middlewares\CorsMiddleware;
use App\Middlewares\JsonMiddleware;
use App\Models\Vehicle;
use App\Services\VehicleService;

require_once __DIR__ . '/src/Core/Autoloader.php';

Autoloader::register();

$middlewares = [
    new CorsMiddleware(),
    new JsonMiddleware(),
];

foreach ($middlewares as $middleware) {
    if ($middleware->handle() === false) {
        exit;
    }
}

$config = require __DIR__ . '/config/Database.php';
$database = new Database($config);

$vehicleController = new VehicleController(
    new VehicleService(
        new Vehicle($database->getConnection())
    )
);

$router = new Router();
$registerRoutes = require __DIR__ . '/src/Routes/api.php';
$registerRoutes($router, $vehicleController);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/api/vehicles';

$router->dispatch($method, $uri);
