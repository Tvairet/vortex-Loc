<?php

namespace App\Models;

use PDO;

class Vehicle
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findAllAvailable(): array
    {
        $statement = $this->pdo->query(
            'SELECT * FROM vehicles WHERE available = 1 ORDER BY id ASC'
        );

        return $statement->fetchAll();
    }

    public function findById(int $id): array|false
    {
        $statement = $this->pdo->prepare(
            'SELECT * FROM vehicles WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }
}
