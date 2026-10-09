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
     * Liste tous les véhicules.
     */
    public function findAll(): array
    {
        return $this->db
            ->query("SELECT * FROM vehicles ORDER BY id DESC")
            ->fetchAll();
    }

    /**
     * Catalogue public.
     *
     * Les véhicules immobilisés restent visibles
     * pour permettre des réservations futures.
     */
    public function findAllAvailable(): array
    {
        return $this->db
            ->query("SELECT * FROM vehicles ORDER BY id ASC")
            ->fetchAll();
    }

    /**
     * Recherche un véhicule par son identifiant.
     */
    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare(
            "SELECT * FROM vehicles WHERE id = :id LIMIT 1"
        );

        $statement->execute(['id' => $id]);

        return $statement->fetch() ?: null;
    }

    /**
     * Ajoute un véhicule.
     * Les données sont validées par VehicleService.
     */
    public function create(array $data): int
    {
        $statement = $this->db->prepare("
            INSERT INTO vehicles (
                brand, model, category, price_per_day,
                seats, transmission, power, range_km,
                image, description,
                available, vehicle_status, status_reason
            ) VALUES (
                :brand, :model, :category, :price_per_day,
                :seats, :transmission, :power, :range_km,
                :image, :description,
                1, 'available', NULL
            )
        ");

        $statement->execute($this->vehicleFields($data));

        return (int) $this->db->lastInsertId();
    }

    /**
     * Modifie les caractéristiques d'un véhicule.
     *
     * Ne touche jamais aux informations
     * d'immobilisation ou de disponibilité.
     */
    public function update(int $id, array $data): bool
    {
        $statement = $this->db->prepare("
            UPDATE vehicles
            SET
                brand = :brand,
                model = :model,
                category = :category,
                price_per_day = :price_per_day,
                seats = :seats,
                transmission = :transmission,
                power = :power,
                range_km = :range_km,
                image = :image,
                description = :description
            WHERE id = :id
        ");

        return $statement->execute([
            ...$this->vehicleFields($data),
            'id' => $id
        ]);
    }

    /**
     * Change le statut opérationnel d'un véhicule.
     */
    public function updateStatus(
        int $id,
        string $status,
        ?string $reason
    ): bool {
        $statement = $this->db->prepare("
            UPDATE vehicles
            SET
                vehicle_status = :status,
                status_reason = :reason,
                available = :available
            WHERE id = :id
        ");

        return $statement->execute([
            'id' => $id,
            'status' => $status,
            'reason' => $reason,
            'available' => $status === 'available' ? 1 : 0
        ]);
    }

    /**
     * Remet le véhicule en service après validation
     * de la fin de son immobilisation.
     */
    public function restoreAvailability(int $id): bool
    {
        $statement = $this->db->prepare("
            UPDATE vehicles
            SET
                available = 1,
                vehicle_status = 'available',
                status_reason = NULL
            WHERE id = :id
        ");

        return $statement->execute(['id' => $id]);
    }

    /**
     * Centralise les paramètres communs
     * à la création et à la modification.
     */
    private function vehicleFields(array $data): array
    {
        return [
            'brand' => $data['brand'],
            'model' => $data['model'],
            'category' => $data['category'],
            'price_per_day' => $data['price_per_day'],
            'seats' => $data['seats'],
            'transmission' => $data['transmission'],
            'power' => $data['power'] ?? null,
            'range_km' => $data['range_km'] ?? null,
            'image' => $data['image'] ?? null,
            'description' => $data['description'] ?? null
        ];
    }
}
