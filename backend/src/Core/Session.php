<?php

namespace App\Core;

class Session
{
    /** Démarrer une session avec un cookie adapté à l'environnement. */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        if (session_status() !== PHP_SESSION_NONE) {
            throw new \RuntimeException('Impossible de démarrer la session.');
        }

        $cookiePath = AppConfig::get(
            'APP_SESSION_COOKIE_PATH', '/vortex-loc/backend/public/'
        );
        if (!is_string($cookiePath) || !str_starts_with($cookiePath, '/')) {
            throw new \RuntimeException('Chemin de cookie invalide.');
        }

        $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        $secure = $https || AppConfig::get('APP_SESSION_COOKIE_SECURE', '0') === '1';

        if (!session_start([
            'use_strict_mode' => true,
            'use_only_cookies' => true,
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'cookie_secure' => $secure,
            'cookie_path' => $cookiePath,
        ])) {
            throw new \RuntimeException('Impossible de démarrer la session.');
        }
    }

    public static function csrfToken(): string
    {
        self::start();

        if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }
}
