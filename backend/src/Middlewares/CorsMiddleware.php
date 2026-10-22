<?php

namespace App\Middlewares;

class CorsMiddleware
{
    /**
     * Autorise le frontend React (Vite) à appeler l'API,
     * et répond aux pré-requêtes OPTIONS.
     */
    public function handle(): bool
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            return false;
        }

        return true;
    }
}
