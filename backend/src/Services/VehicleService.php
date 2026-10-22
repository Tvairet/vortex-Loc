<?php

namespace App\Services;

use App\Models\Vehicle;
use InvalidArgumentException;
use RuntimeException;

class VehicleService
{
    private const ALLOWED_STATUSES = [
        'available',
        'breakdown',
        'cleaning',
        'maintenance',
        'repair',
        'preparation',
        'out_of_service'
    ];

    private const REQUIRED_FIELDS = [
        'brand' => 'La marque',
        'model' => 'Le modèle',
        'category' => 'La catégorie',
        'transmission' => 'La transmission'
    ];

    private const OPTIONAL_FIELDS = [
        'power' => 50,
        'image' => 255,
        'description' => 2000
    ];

    public function __construct(private Vehicle $vehicleModel) {}

    /**
     * Catalogue public.
     * Les véhicules immobilisés restent visibles.
     */
    public function getAllVehicles(): array
    {
        return array_map(
            [$this, 'format'],
            $this->vehicleModel->findAllAvailable()
        );
    }

    /**
     * Tous les véhicules de l'administration.
     */
    public function getAllAdminVehicles(): array
    {
        return array_map(
            [$this, 'format'],
            $this->vehicleModel->findAll()
        );
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
     * Crée un véhicule.
     */
    public function createVehicle(array $data): array
    {
        $validatedData = $this->validateVehicleData($data);

        $id = $this->vehicleModel->create($validatedData);

        return $this->findVehicleOrFail($id);
    }

    /**
     * Modifie les caractéristiques d'un véhicule.
     *
     * Ne modifie pas son état opérationnel.
     */
    public function updateVehicle(int $id, array $data): array
    {
        if ($id <= 0) {
            throw new InvalidArgumentException(
                'Identifiant du véhicule invalide.'
            );
        }

        // Vérifier que le véhicule existe
        $this->findVehicleOrFail($id);

        // Réutiliser les validations de la création
        $validatedData = $this->validateVehicleData($data);

        $updated = $this->vehicleModel->update(
            $id,
            $validatedData
        );

        if (!$updated) {
            throw new RuntimeException(
                'Impossible de modifier le véhicule.'
            );
        }

        return $this->findVehicleOrFail($id);
    }

    /**
     * Ancienne gestion directe des statuts.
     *
     * À conserver temporairement pour compatibilité,
     * puis à retirer avec sa route API.
     * Les immobilisations doivent passer par
     * VehicleUnavailabilityService.
     */
    public function updateVehicleStatus(
        int $id,
        string $status,
        ?string $reason
    ): array {
        if ($id <= 0) {
            throw new InvalidArgumentException(
                'Identifiant du véhicule invalide.'
            );
        }

        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            throw new InvalidArgumentException(
                'État du véhicule invalide.'
            );
        }

        $reason = $reason !== null ? trim($reason) : null;

        if ($reason === '') {
            $reason = null;
        }

        if ($reason !== null && mb_strlen($reason) > 500) {
            throw new InvalidArgumentException(
                'Le commentaire ne doit pas dépasser 500 caractères.'
            );
        }

        if ($status === 'available') {
            $reason = null;
        }

        $this->findVehicleOrFail($id);

        if (!$this->vehicleModel->updateStatus(
            $id,
            $status,
            $reason
        )) {
            throw new RuntimeException(
                'Impossible de modifier l’état du véhicule.'
            );
        }

        return $this->findVehicleOrFail($id);
    }

    /**
     * Valide les données communes à la création
     * et à la modification.
     */
    private function validateVehicleData(array $data): array
    {
        $validated = [];

        // Champs texte obligatoires
        foreach (self::REQUIRED_FIELDS as $field => $label) {
            $value = $data[$field] ?? null;

            if (
                !is_string($value) ||
                trim($value) === '' ||
                mb_strlen(trim($value)) > 100
            ) {
                throw new InvalidArgumentException(
                    $label . ' est obligatoire (100 caractères maximum).'
                );
            }

            $validated[$field] = trim($value);
        }

        // Prix journalier
        $price = $data['price_per_day'] ?? null;

        if (
            !is_scalar($price) ||
            !is_numeric($price) ||
            !is_finite((float) $price) ||
            (float) $price <= 0 ||
            (float) $price > 99999999.99
        ) {
            throw new InvalidArgumentException(
                'Le prix journalier doit être un nombre positif valide.'
            );
        }

        $validated['price_per_day'] = round(
            (float) $price,
            2
        );

        if ($validated['price_per_day'] <= 0) {
            throw new InvalidArgumentException(
                'Le prix journalier doit être au moins de 0,01 €.'
            );
        }

        // Nombre de places
        $seats = filter_var(
            $data['seats'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (
            $seats === false ||
            $seats === null ||
            $seats < 1 ||
            $seats > 20
        ) {
            throw new InvalidArgumentException(
                'Le nombre de places doit être compris entre 1 et 20.'
            );
        }

        $validated['seats'] = $seats;

        // Champs facultatifs
        foreach (self::OPTIONAL_FIELDS as $field => $maxLength) {
            $value = $data[$field] ?? null;

            if ($value !== null && !is_string($value)) {
                throw new InvalidArgumentException(
                    'Le champ ' . $field . ' est invalide.'
                );
            }

            $value = $value !== null ? trim($value) : null;

            if ($value === '') {
                $value = null;
            }

            if (
                $value !== null &&
                mb_strlen($value) > $maxLength
            ) {
                throw new InvalidArgumentException(
                    'Le champ ' . $field . ' est trop long.'
                );
            }

            $validated[$field] = $value;
        }

        // Autonomie facultative
        $range = $data['range_km'] ?? null;

        if ($range === null || $range === '') {
            $validated['range_km'] = null;
        } else {
            $range = filter_var(
                $range,
                FILTER_VALIDATE_INT
            );

            if ($range === false || $range < 0) {
                throw new InvalidArgumentException(
                    'L’autonomie doit être un entier positif ou nul.'
                );
            }

            $validated['range_km'] = $range;
        }

        return $validated;
    }

    /**
     * Récupère un véhicule ou signale son absence.
     */
    private function findVehicleOrFail(int $id): array
    {
        $vehicle = $this->getVehicleById($id);

        if ($vehicle === null) {
            throw new RuntimeException(
                'Véhicule introuvable.'
            );
        }

        return $vehicle;
    }

    /**
     * Formate les données pour React.
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
            'range_km' => $row['range_km'] !== null
                ? (int) $row['range_km']
                : null,
            'image' => $row['image'],
            'description' => $row['description'],
            'available' => (bool) $row['available'],
            'vehicle_status' => $row['vehicle_status'] ?? 'available',
            'status_reason' => $row['status_reason'] ?? null
        ];
    }
}
