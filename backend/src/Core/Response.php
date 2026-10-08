<?php

namespace App\Core;

class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Vary: Origin');

        echo json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}