<?php

namespace App\Middleware;

use App\Core\AppConfig;
use App\Core\Response;
use App\Core\Session;

class CsrfMiddleware
{
    /** Vérification de l'origine et du jeton pour toute modification. */
    public function handle(): bool
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return true;
        }

        $expected = rtrim(AppConfig::get('APP_FRONTEND_ORIGIN', 'http://localhost:5173'), '/');
        if (($_SERVER['HTTP_ORIGIN'] ?? '') !== $expected) {
            Response::json(['message' => 'Origine de la requête non autorisée.'], 403);
            return false;
        }

        Session::start();
        $expectedToken = $_SESSION['csrf_token'] ?? null;
        $receivedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        if (!is_string($expectedToken) || $expectedToken === '' ||
            !is_string($receivedToken) ||
            !hash_equals($expectedToken, $receivedToken)) {
            Response::json(['message' => 'Jeton CSRF invalide ou manquant.'], 403);
            return false;
        }

        return true;
    }
}
