<?php

namespace App\Controllers;

use App\Core\Response;
use App\Middleware\AdminMiddleware;
use App\Services\ReservationService;
use App\Services\StatisticsService;
use App\Services\UserService;
use App\Services\VehicleService;
use App\Services\VehicleUnavailabilityService;
use InvalidArgumentException;
use RuntimeException;

class AdminController
{
    public function __construct(
        private AdminMiddleware $adminMiddleware,
        private ReservationService $reservationService,
        private VehicleService $vehicleService,
        private VehicleUnavailabilityService $unavailabilityService,
        private UserService $userService,
        private StatisticsService $statisticsService
    ) {}

    /** Vérifie la forme d'un identifiant issu d'une route. */
    private function validId(string $id): bool
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json(['message' => 'Identifiant invalide.'], 400);
            return false;
        }

        return true;
    }

    /** Lit un objet JSON envoyé par le frontend. */
    private function readPayload(): ?array
    {
        $payload = json_decode(file_get_contents('php://input'), true);

        if (!is_array($payload) || array_is_list($payload)) {
            Response::json(['message' => 'Données invalides.'], 400);
            return null;
        }

        return $payload;
    }

    private function internalError(\Throwable $error, string $message = 'Erreur interne du serveur.'): void
    {
        error_log($error->getMessage());
        Response::json(['message' => $message], 500);
    }

    /** GET /api/admin/dashboard */
    public function dashboard(): void
    {
        if (!$this->adminMiddleware->handle()) return;

        Response::json([
            'message' => "Bienvenue dans l’administration Vortex'Loc.",
            'access' => 'admin',
            'dashboard' => [
                'vehicles' => 'Disponible',
                'reservations' => 'Disponible',
                'users' => 'Disponible',
                'statistics' => 'Disponible'
            ]
        ]);
    }

    /** GET /api/admin/users */
    public function users(): void
    {
        if (!$this->adminMiddleware->handle()) return;

        try {
            Response::json([
                'users' => $this->userService->getAllUsers(),
                'total' => $this->userService->countUsers()
            ]);
        } catch (\Throwable $error) {
            $this->internalError($error, 'Impossible de charger les utilisateurs.');
        }
    }

    /** GET /api/admin/stats */
    public function statistics(): void
    {
        if (!$this->adminMiddleware->handle()) return;

        try {
            Response::json($this->statisticsService->getDashboardStatistics());
        } catch (\Throwable $error) {
            $this->internalError($error, 'Impossible de charger les statistiques.');
        }
    }

    /** GET /api/admin/vehicles */
    public function vehicles(): void
    {
        if (!$this->adminMiddleware->handle()) return;

        try {
            Response::json(['vehicles' => $this->vehicleService->getAllAdminVehicles()]);
        } catch (\Throwable $error) {
            $this->internalError($error, 'Impossible de charger les véhicules.');
        }
    }

    /** POST /api/admin/vehicles */
    public function createVehicle(): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        $payload = $this->readPayload();
        if ($payload === null) return;

        try {
            $vehicle = $this->vehicleService->createVehicle($payload);
            Response::json(['message' => 'Véhicule ajouté avec succès.', 'vehicle' => $vehicle], 201);
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 400);
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }

    /** PATCH /api/admin/vehicles/{id} */
    public function updateVehicle(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        $payload = $this->readPayload();
        if ($payload === null) return;

        try {
            $vehicle = $this->vehicleService->updateVehicle((int) $id, $payload);
            Response::json(['message' => 'Véhicule modifié avec succès.', 'vehicle' => $vehicle]);
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 400);
        } catch (RuntimeException $error) {
            if ($error->getMessage() === 'Véhicule introuvable.') {
                Response::json(['message' => $error->getMessage()], 404);
            } else {
                $this->internalError($error, 'Impossible de modifier le véhicule.');
            }
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }

    /** GET /api/admin/vehicles/{id}/unavailability */
    public function vehicleUnavailabilityHistory(string $id): void
    {
        if (!$this->adminMiddleware->handle() || !$this->validId($id)) return;

        try {
            $history = $this->unavailabilityService->getVehicleHistory((int) $id);
            Response::json(['unavailability' => $history]);
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 404);
        } catch (\Throwable $error) {
            $this->internalError($error, 'Impossible de charger les immobilisations.');
        }
    }

    /** POST /api/admin/vehicles/{id}/unavailability */
    public function createVehicleUnavailability(string $id): void
    {

        if (!$this->adminMiddleware->handle() || !$this->validId($id)) {
            return;
        }

        $payload = $this->readPayload();
        if ($payload === null) return;

        if (
            !isset($payload['status'], $payload['start_date']) ||
            !is_string($payload['status']) ||
            !is_string($payload['start_date']) ||
            (isset($payload['reason']) && !is_string($payload['reason'])) ||
            (isset($payload['estimated_end_date']) && !is_string($payload['estimated_end_date']))
        ) {
            Response::json(['message' => 'Données invalides.'], 400);
            return;
        }

        try {
            $result = $this->unavailabilityService->createUnavailability(
                (int) $id,
                $payload['status'],
                $payload['reason'] ?? null,
                $payload['start_date'],
                $payload['estimated_end_date'] ?? null
            );

            Response::json(['message' => 'Immobilisation enregistrée.', 'unavailability' => $result], 201);
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 400);
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }

    /** PATCH /api/admin/vehicles/{id}/restore */
    public function restoreVehicle(string $id): void
    {
        if (!$this->adminMiddleware->handle() || !$this->validId($id)) {
            return;
        }

        try {
            Response::json(
                $this->unavailabilityService->resolveUnavailability((int) $id)
            );
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 409);
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }

    /** GET /api/admin/reservations */
    public function reservations(): void
    {
        if (!$this->adminMiddleware->handle()) return;

        try {
            Response::json(['reservations' => $this->reservationService->getAllReservationsForAdmin()]);
        } catch (\Throwable $error) {
            $this->internalError($error, 'Impossible de charger les réservations.');
        }
    }

    /** PATCH /api/admin/reservations/{id}/confirm */
    public function confirmReservation(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        try {
            Response::json($this->reservationService->confirmReservation((int) $id));
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 409);
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }

    /** PATCH /api/admin/reservations/{id}/reject */
    public function rejectReservation(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }
        try {
            Response::json($this->reservationService->rejectReservation((int) $id));
        } catch (InvalidArgumentException $error) {
            Response::json(['message' => $error->getMessage()], 409);
        } catch (\Throwable $error) {
            $this->internalError($error);
        }
    }
}
