<?php

namespace App\Middlewares;

use App\Core\AppConfig;

/** Compatibilité : aucune origine générique avec des cookies de session. */
class CorsMiddleware
{
    public function handle(): bool
    {
        $allowed = rtrim(AppConfig::get('APP_FRONTEND_ORIGIN', 'http://localhost:5173'), '/');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        header('Vary: Origin');

        if ($origin === $allowed) {
            header('Access-Control-Allow-Origin: ' . $allowed);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        }

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code($origin === $allowed ? 204 : 403);
            return false;
        }
        return true;
    }
}
