<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Vehicle
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    /**
     * Récupère tous les véhicules disponibles.
     */
    public function findAllAvailable(): array
    {
        $sql = "
            SELECT *
            FROM vehicles
            WHERE available = 1
            ORDER BY id ASC
        ";

        $statement = $this->db->query($sql);

        return $statement->fetchAll();
    }

    /**
     * Récupère un véhicule par son identifiant.
     */
    public function findById(int $id): ?array
    {
        $sql = "
            SELECT *
            FROM vehicles
            WHERE id = :id
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'id' => $id
        ]);

        $vehicle = $statement->fetch();

        return $vehicle ?: null;
    }
}