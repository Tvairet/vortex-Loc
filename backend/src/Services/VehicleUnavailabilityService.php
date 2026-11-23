<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\VehicleUnavailability;
use DateTimeImmutable;
use InvalidArgumentException;
use App\Models\Reservation;

class VehicleUnavailabilityService
{
    private const ALLOWED_STATUSES = [
        'breakdown',
        'cleaning',
        'maintenance',
        'repair',
        'preparation',
        'out_of_service'
    ];

    public function __construct(
        private VehicleUnavailability $unavailabilityModel,
        private Vehicle $vehicleModel,
        private Reservation $reservationModel
    ) {}

    /**
     * Récupère l'historique des immobilisations
     * d'un véhicule.
     */
    public function getVehicleHistory(int $vehicleId): array
    {
        if ($vehicleId < 1 || !$this->vehicleModel->findById($vehicleId)) {
            throw new InvalidArgumentException(
                'Véhicule introuvable.'
            );
        }

        return $this->unavailabilityModel
            ->findByVehicleId($vehicleId);
    }

    /**
     * Enregistre une nouvelle immobilisation.
     */
    public function createUnavailability(
        int $vehicleId,
        string $status,
        ?string $reason,
        string $startDate,
        ?string $estimatedEndDate
    ): array {
        // Vérifier l'identifiant et le véhicule
        if ($vehicleId < 1 || !$this->vehicleModel->findById($vehicleId)) {
            throw new InvalidArgumentException(
                'Véhicule introuvable.'
            );
        }

        // Vérifier l'état demandé
        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            throw new InvalidArgumentException(
                'État du véhicule invalide.'
            );
        }

        // Vérifier les dates
        $this->validateDate($startDate);

        if ($estimatedEndDate !== null) {
            $this->validateDate($estimatedEndDate);

            if ($estimatedEndDate < $startDate) {
                throw new InvalidArgumentException(
                    'La fin prévisionnelle doit être après le début.'
                );
            }
        }

        // Nettoyer et vérifier le motif
        $reason = $reason !== null ? trim($reason) : null;

        if ($reason === '') {
            $reason = null;
        }

        if ($reason !== null && mb_strlen($reason) > 500) {
            throw new InvalidArgumentException(
                'Le motif ne doit pas dépasser 500 caractères.'
            );
        }


        // Verrouiller le véhicule pendant l'opération
        $result = $this->unavailabilityModel->withVehicleLock(
            $vehicleId,
            function () use (
                $vehicleId,
                $status,
                $reason,
                $startDate,
                $estimatedEndDate
            ) {
                // Vérifier qu'aucune immobilisation n'est active
                $active = $this->unavailabilityModel
                    ->findActiveByVehicleId($vehicleId);

                if ($active !== null) {
                    throw new InvalidArgumentException(
                        'Ce véhicule possède déjà une immobilisation non clôturée.'
                    );
                }

                // Enregistrer l'immobilisation
                $id = $this->unavailabilityModel->create(
                    $vehicleId,
                    $status,
                    $reason,
                    $startDate,
                    $estimatedEndDate
                );

                // Synchroniser l'état du véhicule
                $updated = $this->vehicleModel->updateStatus(
                    $vehicleId,
                    $status,
                    $reason
                );

                if (!$updated) {
                    throw new \RuntimeException(
                        "Impossible de mettre à jour l'état du véhicule."
                    );
                }

                return [
                    'id' => $id,
                    'affected_reservations' => $this->reservationModel
                        ->findAffectedByUnavailability(
                            $vehicleId,
                            $startDate,
                            $estimatedEndDate
                        )
                ];
            }
        );

        return [
            'id' => $result['id'],
            'vehicle_id' => $vehicleId,
            'status' => $status,
            'reason' => $reason,
            'start_date' => $startDate,
            'estimated_end_date' => $estimatedEndDate,
            'resolved_at' => null,
            'affected_reservations' => $result['affected_reservations']
        ];
    }

    /**
     * Valide la remise en service d'un véhicule.
     */
    public function resolveUnavailability(int $vehicleId): array
    {
        if ($vehicleId < 1) {
            throw new InvalidArgumentException(
                'Identifiant du véhicule invalide.'
            );
        }

        $result = $this->unavailabilityModel->withVehicleLock(
            $vehicleId,
            function () use ($vehicleId) {

                $active = $this->unavailabilityModel
                    ->findActiveByVehicleId($vehicleId);

                if ($active === null) {
                    throw new InvalidArgumentException(
                        'Aucune immobilisation à clôturer.'
                    );
                }

                $resolved = $this->unavailabilityModel->resolve(
                    (int) $active['id']
                );

                if (!$resolved) {
                    throw new \RuntimeException(
                        'Impossible de clôturer cette immobilisation.'
                    );
                }

                $restored = $this->vehicleModel->restoreAvailability(
                    $vehicleId
                );

                if (!$restored) {
                    throw new \RuntimeException(
                        'Impossible de remettre le véhicule en service.'
                    );
                }

                return [
                    'vehicle_id' => $vehicleId,
                    'unavailability_id' => (int) $active['id'],
                    'status' => 'available',
                    'message' => 'Remise en service validée.'
                ];
            }
        );

        return $result;
    }

    /**
     * Vérifie une date au format YYYY-MM-DD.
     */
    private function validateDate(string $value): void
    {
        $date = DateTimeImmutable::createFromFormat(
            '!Y-m-d',
            $value
        );

        if (
            !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ||
            $date === false ||
            $date->format('Y-m-d') !== $value
        ) {
            throw new InvalidArgumentException(
                'Date invalide. Format attendu : YYYY-MM-DD.'
            );
        }
    }
}
