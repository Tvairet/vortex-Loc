<?php

namespace App\Middleware;

use App\Core\Response;
use App\Core\Session;
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
        Session::start();

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
