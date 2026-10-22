<?php

namespace App\Core;

class Session
{
    /**
     * Démarre une session PHP sécurisée
     * si aucune session n'est déjà active.
     */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        if (session_status() !== PHP_SESSION_NONE) {
            throw new \RuntimeException(
                'Impossible de démarrer la session.'
            );
        }

        if (!session_start([
            'use_strict_mode' => true,
            'use_only_cookies' => true,
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'cookie_secure' => !empty($_SERVER['HTTPS'])
                && $_SERVER['HTTPS'] !== 'off',
            'cookie_path' => '/vortex-loc/backend/public/'
        ])) {
            throw new \RuntimeException(
                'Impossible de démarrer la session.'
            );
        }
    }

    /**
     * Retourne le jeton CSRF associé à la session.
     * Le génère s'il n'existe pas encore.
     */
    public static function csrfToken(): string
    {
        self::start();

        if (
            !isset($_SESSION['csrf_token']) ||
            !is_string($_SESSION['csrf_token'])
        ) {
            $_SESSION['csrf_token'] = bin2hex(
                random_bytes(32)
            );
        }

        return $_SESSION['csrf_token'];
    }
}
