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
}
