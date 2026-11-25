<?php

namespace App\Core;

/**
 * Réglages de l'application : variables d'environnement prioritaires,
 * puis config/local.php (non versionné), puis valeur par défaut.
 */
final class AppConfig
{
    private static ?array $local = null;

    public static function get(string $name, ?string $default = null): ?string
    {
        $environment = getenv($name);
        if ($environment !== false) {
            return (string) $environment;
        }

        if (self::$local === null) {
            $path = dirname(__DIR__, 2) . '/config/local.php';
            if (is_file($path)) {
                $values = require $path;
                if (!is_array($values)) {
                    throw new \RuntimeException('Configuration locale invalide.');
                }
                self::$local = $values;
            } else {
                self::$local = [];
            }
        }

        $value = self::$local[$name] ?? null;
        return is_string($value) || is_numeric($value)
            ? (string) $value
            : $default;
    }
}
