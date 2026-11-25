<?php

use App\Core\AppConfig;

// Ce fichier ne contient plus d'identifiants MySQL directement dans le code.
// Les valeurs viennent des variables d'environnement ou de config/local.php.
$user = AppConfig::get('DB_USER');
if ($user === null || $user === '') {
    throw new RuntimeException('DB_USER non configuré.');
}

return [
    'host' => AppConfig::get('DB_HOST', 'localhost'),
    'port' => AppConfig::get('DB_PORT', '3306'),
    'dbname' => AppConfig::get('DB_NAME', 'vortex_loc'),
    'user' => $user,
    'password' => AppConfig::get('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
];
