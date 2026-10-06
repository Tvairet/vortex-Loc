<?php

namespace App\Controllers;

use App\Core\Response;
use App\Services\VehicleService;
use Throwable;

class VehicleController
{
    public function __construct(private VehicleService $vehicleService)
    {
    }

    /**
     * GET /api/vehicles
     */
    public function index(): void
    {
        try {
            $vehicles = $this->vehicleService->getAllVehicles();

            if ($vehicles === []) {
                Response::json(['message' => 'Aucun véhicule trouvé'], 404);
                return;
            }

            Response::json($vehicles);
        } catch (Throwable $error) {
            Response::json([
                'message' => 'Erreur serveur',
                'error' => $error->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/vehicles/{id}
     */
    public function show(string $id): void
    {
        try {
            $vehicleId = (int) $id;

            if ($vehicleId < 1) {
                Response::json(['message' => 'Identifiant invalide'], 400);
                return;
            }

            $vehicle = $this->vehicleService->getVehicleById($vehicleId);

            if ($vehicle === null) {
                Response::json(['message' => 'Véhicule introuvable'], 404);
                return;
            }

            Response::json($vehicle);
        } catch (Throwable $error) {
            Response::json([
                'message' => 'Erreur serveur',
                'error' => $error->getMessage(),
            ], 500);
        }
    }
}
