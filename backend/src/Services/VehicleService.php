<?php

namespace App\Services;

use App\Models\Vehicle;

class VehicleService
{
    public function __construct(private Vehicle $vehicleModel)
    {
    }

    /**
     * Liste les véhicules disponibles à la location.
     */
    public function getAllVehicles(): array
    {
        $vehicles = $this->vehicleModel->findAllAvailable();

        return array_map([$this, 'format'], $vehicles);
    }

    /**
     * Récupère un véhicule par son identifiant.
     */
    public function getVehicleById(int $id): ?array
    {
        $vehicle = $this->vehicleModel->findById($id);

        return $vehicle ? $this->format($vehicle) : null;
    }

    /**
     * Met le véhicule au format attendu par le frontend.
     */
    private function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'brand' => $row['brand'],
            'model' => $row['model'],
            'category' => $row['category'],
            'price_per_day' => (float) $row['price_per_day'],
            'seats' => (int) $row['seats'],
            'transmission' => $row['transmission'],
            'power' => $row['power'],
            'range_km' => $row['range_km'] !== null ? (int) $row['range_km'] : null,
            'image' => $row['image'],
            'description' => $row['description'],
            'available' => (bool) $row['available'],
        ];
    }
}
