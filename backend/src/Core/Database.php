<?php

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private PDO $connection;

    public function __construct(array $config)
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'] ?? '3306',
            $config['dbname'],
            $config['charset']
        );

        try {
            $this->connection = new PDO(
                $dsn,
                $config['user'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $error) {
            // Garder les détails techniques dans les journaux du serveur,
            // jamais dans le JSON envoyé au navigateur.
            error_log('Echec de connexion MySQL : ' . $error->getMessage());
            throw new RuntimeException('Base de données indisponible.', 0, $error);
        }
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }
}
