<?php

namespace App\Controllers;

use App\Core\Response;
use App\Middleware\AdminMiddleware;
use App\Services\ReservationService;
use InvalidArgumentException;
use App\Services\VehicleService;
use App\Services\VehicleUnavailabilityService;
use App\Services\UserService;

class AdminController
{

    public function __construct(
        private AdminMiddleware $adminMiddleware,
        private ReservationService $reservationService,
        private VehicleService $vehicleService,
        private VehicleUnavailabilityService $unavailabilityService,
        private UserService $userService
    ) {}

    public function dashboard(): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        Response::json([
            'message' => 'Bienvenue dans l’administration Vortex\'Loc.',
            'access' => 'admin',
            'dashboard' => [
                'vehicles' => 'À développer',
                'reservations' => 'À développer',
                'users' => 'À développer'
            ]
        ]);
    }

    /**
     * GET /api/admin/users
     * Liste les utilisateurs de Vortex'Loc.
     */

    public function users(): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        try {
            $users = $this->userService->getAllUsers();

            Response::json([
                'users' => $users,
                'total' => $this->userService->countUsers()
            ]);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de charger les utilisateurs.'
            ], 500);
        }
    }

    /**
     * GET /api/admin/vehicles
     * Récupère tous les véhicules.
     */
    public function vehicles(): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        try {
            $vehicles = $this->vehicleService->getAllAdminVehicles();

            Response::json([
                'vehicles' => $vehicles
            ]);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de charger les véhicules.'
            ], 500);
        }
    }

    /**
     * POST /api/admin/vehicles
     * Ajoute un véhicule dans la flotte.
     */
    public function createVehicle(): void
    {
        // Vérifier les droits administrateur
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        // Vérifier l'origine de la requête
        if (
            ($_SERVER['HTTP_ORIGIN'] ?? '') !==
            'http://localhost:5173'
        ) {
            Response::json([
                'message' => 'Origine non autorisée.'
            ], 403);
            return;
        }

        // Lire les données envoyées par React
        $payload = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($payload)) {
            Response::json([
                'message' => 'Données invalides.'
            ], 400);
            return;
        }

        try {
            $vehicle = $this->vehicleService
                ->createVehicle($payload);

            Response::json([
                'message' => 'Véhicule ajouté avec succès.',
                'vehicle' => $vehicle
            ], 201);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/vehicles/{id}
     * Modifie les caractéristiques d'un véhicule.
     */
    public function updateVehicle(string $id): void
    {
        // Vérifier les droits administrateur
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        // Vérifier l'origine de la requête
        if (
            ($_SERVER['HTTP_ORIGIN'] ?? '') !==
            'http://localhost:5173'
        ) {
            Response::json([
                'message' => 'Origine non autorisée.'
            ], 403);
            return;
        }

        // Vérifier l'identifiant
        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json([
                'message' => 'Identifiant invalide.'
            ], 400);
            return;
        }

        // Lire les données envoyées par React
        $payload = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($payload)) {
            Response::json([
                'message' => 'Données invalides.'
            ], 400);
            return;
        }

        try {
            $vehicle = $this->vehicleService->updateVehicle(
                (int) $id,
                $payload
            );

            Response::json([
                'message' => 'Véhicule modifié avec succès.',
                'vehicle' => $vehicle
            ]);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (\RuntimeException $error) {
            if ($error->getMessage() === 'Véhicule introuvable.') {
                Response::json([
                    'message' => 'Véhicule introuvable.'
                ], 404);
            } else {
                error_log($error->getMessage());

                Response::json([
                    'message' => 'Impossible de modifier le véhicule.'
                ], 500);
            }
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/vehicles/{id}/status
     * Modifie l'état d'un véhicule.
     */
    public function updateVehicleStatus(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        if (
            ($_SERVER['HTTP_ORIGIN'] ?? '') !==
            'http://localhost:5173'
        ) {
            Response::json([
                'message' => 'Origine non autorisée.'
            ], 403);
            return;
        }

        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json([
                'message' => 'Identifiant invalide.'
            ], 400);
            return;
        }

        $payload = json_decode(file_get_contents('php://input'), true);

        if (
            !is_array($payload) ||
            !isset($payload['vehicle_status']) ||
            !is_string($payload['vehicle_status']) ||
            (
                isset($payload['status_reason']) &&
                !is_string($payload['status_reason'])
            )
        ) {
            Response::json([
                'message' => 'Données invalides.'
            ], 400);
            return;
        }

        try {
            $vehicle = $this->vehicleService->updateVehicleStatus(
                (int) $id,
                $payload['vehicle_status'],
                $payload['status_reason'] ?? null
            );

            Response::json([
                'message' => 'État du véhicule mis à jour.',
                'vehicle' => $vehicle
            ]);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (\RuntimeException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 404);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * GET /api/admin/vehicles/{id}/unavailability
     * Récupère l'historique des immobilisations.
     */
    public function vehicleUnavailabilityHistory(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json([
                'message' => 'Identifiant invalide.'
            ], 400);
            return;
        }

        try {
            $history = $this->unavailabilityService
                ->getVehicleHistory((int) $id);

            Response::json([
                'unavailability' => $history
            ]);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 404);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de charger les immobilisations.'
            ], 500);
        }
    }

    /**
     * POST /api/admin/vehicles/{id}/unavailability
     * Enregistre une immobilisation.
     */
    public function createVehicleUnavailability(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        if (
            ($_SERVER['HTTP_ORIGIN'] ?? '') !==
            'http://localhost:5173'
        ) {
            Response::json([
                'message' => 'Origine non autorisée.'
            ], 403);
            return;
        }

        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json([
                'message' => 'Identifiant invalide.'
            ], 400);
            return;
        }

        $payload = json_decode(file_get_contents('php://input'), true);

        if (
            !is_array($payload) ||
            !isset($payload['status'], $payload['start_date']) ||
            !is_string($payload['status']) ||
            !is_string($payload['start_date']) ||
            (
                isset($payload['reason']) &&
                !is_string($payload['reason'])
            ) ||
            (
                isset($payload['estimated_end_date']) &&
                !is_string($payload['estimated_end_date'])
            )
        ) {
            Response::json([
                'message' => 'Données invalides.'
            ], 400);
            return;
        }

        try {
            $result = $this->unavailabilityService
                ->createUnavailability(
                    (int) $id,
                    $payload['status'],
                    $payload['reason'] ?? null,
                    $payload['start_date'],
                    $payload['estimated_end_date'] ?? null
                );

            Response::json([
                'message' => 'Immobilisation enregistrée.',
                'unavailability' => $result
            ], 201);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/vehicles/{id}/restore
     * Valide la remise en service.
     */
    public function restoreVehicle(string $id): void
    {
        if (!$this->adminMiddleware->handle()) {
            return;
        }

        if (
            ($_SERVER['HTTP_ORIGIN'] ?? '') !==
            'http://localhost:5173'
        ) {
            Response::json([
                'message' => 'Origine non autorisée.'
            ], 403);
            return;
        }

        if (!ctype_digit($id) || (int) $id < 1) {
            Response::json([
                'message' => 'Identifiant invalide.'
            ], 400);
            return;
        }

        try {
            $result = $this->unavailabilityService
                ->resolveUnavailability((int) $id);

            Response::json($result);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 409);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * GET /api/admin/reservations
     * Liste de toutes les réservations.
     */
    public function reservations(): void
    {
        try {
            // Vérification des droits administrateur
            if (!$this->adminMiddleware->handle()) {
                return;
            }

            $reservations = $this->reservationService
                ->getAllReservationsForAdmin();

            Response::json([
                'reservations' => $reservations
            ]);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de charger les réservations.'
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/reservations/{id}/confirm
     * Confirmer une réservation.
     */
    public function confirmReservation(string $id): void
    {
        try {
            // Vérifier les droits administrateur
            if (!$this->adminMiddleware->handle()) {
                return;
            }

            // Vérifier l'origine de la requête
            if (
                ($_SERVER['HTTP_ORIGIN'] ?? '') !==
                'http://localhost:5173'
            ) {
                Response::json([
                    'message' => 'Origine non autorisée.'
                ], 403);
                return;
            }

            // Vérifier l'identifiant
            if (!ctype_digit($id) || (int) $id < 1) {
                Response::json([
                    'message' => 'Identifiant invalide.'
                ], 400);
                return;
            }

            $result = $this->reservationService
                ->confirmReservation((int) $id);

            Response::json($result);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 409);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/reservations/{id}/reject
     * Refuser une réservation.
     */
    public function rejectReservation(string $id): void
    {
        try {
            // Vérifier les droits administrateur
            if (!$this->adminMiddleware->handle()) {
                return;
            }

            // Vérifier l'origine de la requête
            if (
                ($_SERVER['HTTP_ORIGIN'] ?? '') !==
                'http://localhost:5173'
            ) {
                Response::json([
                    'message' => 'Origine non autorisée.'
                ], 403);
                return;
            }

            if (!ctype_digit($id) || (int) $id < 1) {
                Response::json([
                    'message' => 'Identifiant invalide.'
                ], 400);
                return;
            }

            $result = $this->reservationService
                ->rejectReservation((int) $id);

            Response::json($result);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 409);
        } catch (\Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }
}
