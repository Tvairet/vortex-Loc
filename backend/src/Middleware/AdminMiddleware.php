<?php

namespace App\Middleware;

use App\Core\Response;
use App\Models\User;

class AdminMiddleware
{
    public function __construct(
        private User $userModel
    ) {}

    /**
     * Vérifie que l'utilisateur connecté
     * possède le rôle administrateur.
     */
    public function handle(): bool
    {
        // Démarrer la session si nécessaire
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'use_strict_mode' => true,
                'use_only_cookies' => true,
                'cookie_httponly' => true,
                'cookie_samesite' => 'Lax',
                'cookie_secure' =>
                !empty($_SERVER['HTTPS']) &&
                    $_SERVER['HTTPS'] !== 'off',
                'cookie_path' => '/vortex-loc/backend/public/'
            ]);
        }

        // Aucun utilisateur connecté
        if (empty($_SESSION['user_id'])) {
            Response::json([
                'message' => 'Authentification requise.'
            ], 401);

            return false;
        }

        // Vérifier le rôle actuel en base de données
        $user = $this->userModel->findById(
            (int) $_SESSION['user_id']
        );

        if ($user === null || $user['role'] !== 'admin') {
            Response::json([
                'message' => 'Accès réservé aux administrateurs.'
            ], 403);

            return false;
        }

        return true;
    }
}
