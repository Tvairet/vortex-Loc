<?php

namespace App\Controllers;

use App\Core\Response;
use App\Services\AuthService;
use App\Core\Session;
use InvalidArgumentException;
use PDOException;
use Throwable;

class AuthController
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * POST /api/auth/register
     */
    public function register(): void
    {
        try {
            // Récupération du JSON envoyé par React
            $body = file_get_contents('php://input');

            $data = json_decode($body, true);

            if (!is_array($data)) {
                Response::json([
                    'message' => 'Données JSON invalides.'
                ], 400);
                return;
            }

            // Inscription via le Service
            $user = $this->authService->register($data);

            Response::json([
                'message' => 'Compte créé avec succès.',
                'user' => $user
            ], 201);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 400);
        } catch (PDOException $error) {
            // Email déjà utilisé : contrainte UNIQUE MySQL
            if ($error->getCode() === '23000') {
                Response::json([
                    'message' => 'Cette adresse email est déjà utilisée.'
                ], 409);
                return;
            }

            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur lors de la création du compte.'
            ], 500);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * POST /api/auth/login
     */
    public function login(): void
    {
        try {
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

            // Vérification des identifiants
            $user = $this->authService->login($data);

            // Configuration de la session PHP
            Session::start();

            // Nouvel identifiant de session après connexion
            session_regenerate_id(true);

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];

            Response::json([
                'message' => 'Connexion réussie.',
                'user' => $user
            ]);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'message' => $error->getMessage()
            ], 401);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * GET /api/auth/me
     * Vérifie si un utilisateur est connecté.
     */
    public function me(): void
    {
        try {
            Session::start();

            if (empty($_SESSION['user_id'])) {
                Response::json([
                    'message' => 'Utilisateur non connecté.'
                ], 401);
                return;
            }

            $user = $this->authService->getUserById(
                (int) $_SESSION['user_id']
            );

            if ($user === null) {
                Response::json([
                    'message' => 'Session invalide.'
                ], 401);
                return;
            }

            Response::json([
                'authenticated' => true,
                'user' => $user
            ]);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur interne du serveur.'
            ], 500);
        }
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): void
    {
        try {
            Session::start();

            // Supprimer les données de session
            $_SESSION = [];

            // Supprimer le cookie de session
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();

                setcookie(session_name(), '', [
                    'expires' => time() - 3600,
                    'path' => $params['path'],
                    'domain' => $params['domain'],
                    'secure' => $params['secure'],
                    'httponly' => $params['httponly'],
                    'samesite' => $params['samesite'] ?? 'Lax'
                ]);
            }

            session_destroy();

            Response::json([
                'message' => 'Déconnexion réussie.'
            ]);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Erreur lors de la déconnexion.'
            ], 500);
        }
    }

    /**
     * GET /api/auth/csrf
     * Fournit le jeton CSRF associé à la session.
     */
    public function csrf(): void
    {
        try {
            Response::json([
                'csrf_token' => Session::csrfToken()
            ]);
        } catch (Throwable $error) {
            error_log($error->getMessage());

            Response::json([
                'message' => 'Impossible de générer le jeton CSRF.'
            ], 500);
        }
    }
}
