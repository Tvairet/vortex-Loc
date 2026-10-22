<?php

namespace App\Middleware;

use App\Core\Response;
use App\Core\Session;

class CsrfMiddleware
{
    private const ALLOWED_ORIGIN = 'http://localhost:5173';

    /**
     * Vérifie l'origine des requêtes qui modifient des données.
     */
    public function handle(): bool
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Aucune modification pour les requêtes de lecture
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return true;
        }

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin !== self::ALLOWED_ORIGIN) {
            Response::json([
                'message' => 'Origine de la requête non autorisée.'
            ], 403);

            return false;
        }

        if (!$this->hasValidToken()) {
            Response::json([
                'message' => 'Jeton CSRF invalide ou manquant.'
            ], 403);

            return false;
        }

        return true;
    }

    /**
     * Vérifie le jeton CSRF associé à la session.
     */
    private function hasValidToken(): bool
    {
        Session::start();

        $expectedToken = $_SESSION['csrf_token'] ?? null;
        $receivedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        return is_string($expectedToken)
            && is_string($receivedToken)
            && $expectedToken !== ''
            && hash_equals($expectedToken, $receivedToken);
    }
}
