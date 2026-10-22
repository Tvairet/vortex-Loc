<?php

namespace App\Middlewares;

class JsonMiddleware
{
    /**
     * Force le format JSON pour toutes les réponses API
     * et lit le corps des requêtes POST/PUT/PATCH.
     */
    public function handle(): bool
    {
        header('Content-Type: application/json; charset=utf-8');

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            $raw = file_get_contents('php://input');
            $decoded = json_decode($raw ?: '', true);
            $GLOBALS['request_body'] = is_array($decoded) ? $decoded : [];
        }

        return true;
    }
}
