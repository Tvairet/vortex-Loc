<?php

use App\Controllers\VehicleController;
use App\Core\Router;

/**
 * Déclare les routes HTTP de l'API véhicules.
 */
return static function (Router $router, VehicleController $vehicleController): void {
    $router->get('/api/vehicles', [$vehicleController, 'index']);
    $router->get('/api/vehicles/{id}', [$vehicleController, 'show']);
};
