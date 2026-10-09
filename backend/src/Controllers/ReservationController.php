<?php

namespace App\Controllers;

use App\Core\Response;
use App\Services\ReservationService;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class ReservationController
{
    public function __construct(
        private ReservationService $reservationService
    ) {}

    /**
     * Démarre ou récupère la session PHP.
     */
    private function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'use_strict_mode' => true,
                'use_only_cookies' => true,
                'cookie_httponly' => true,
                'cookie_samesite' => 'Lax',
                'cookie_secure' => !empty($_SERVER['HTTPS'])
                    && $_SERVER['HTTPS'] !== 'off',
                'cookie_path' => '/vortex-loc/backend/public/'
            ]);
        }
    }

    /**
     * POST /api/reservations
     * Créer une réservation.
     */
    public function store(): void
    {
        try {
            $this->startSession();

            if (empty($_SESSION['user_id'])) {
                Response::json([
                    'message' => 'Vous devez être connecté pour réserver.'
                ], 401);
                return;
            }

            // Vérification de l'origine pour la requête POST
            $expectedOrigin = 'http://localhost:5173';
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

            if ($origin !== $expectedOrigin) {
                Response::json([
                    'message' => 'Origine de requête non autorisée.'
                ], 403);
                return;
            }

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            if (!is_array($data)) {
                Response::json([
                    'message' => 'Données JSON invalides.'
                ], 400);
                return;
            }

            $reservation = $this->reservationService
                ->createReservation(
                    (int) $_SESSION['user_id'],
                    $data
                );

            Response::json([
                'message' => 'Réservation enregistrée avec succès.',
                'reservation' => $reservation
            ], 201);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (RuntimeException $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de créer la réservation.'
            ], 500);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * GET /api/reservations/me
     * Historique de l'utilisateur connecté.
     */
    public function myReservations(): void
    {
        try {
            $this->startSession();

            if (empty($_SESSION['user_id'])) {
                Response::json([
                    'message' => 'Vous devez être connecté.'
                ], 401);
                return;
            }

            $reservations = $this->reservationService
                ->getUserReservations(
                    (int) $_SESSION['user_id']
                );

            Response::json([
                'reservations' => $reservations
            ]);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * POST /api/reservations/{id}/cancel
     * Annuler une réservation du client connecté.
     */
    public function cancel(string $id): void
    {
        try {
            $this->startSession();

            // Vérifier la connexion
            if (empty($_SESSION['user_id'])) {
                Response::json([
                    'message' => 'Vous devez être connecté.'
                ], 401);
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
                    'message' => 'Identifiant de réservation invalide.'
                ], 400);
                return;
            }

            // Demander l'annulation au Service
            $result = $this->reservationService->cancelReservation(
                (int) $id,
                (int) $_SESSION['user_id']
            );

            Response::json($result);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }
}
