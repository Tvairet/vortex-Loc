<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\User;
use DateTimeImmutable;
use InvalidArgumentException;
use RuntimeException;
use App\Models\VehicleUnavailability;

class ReservationService
{

    public function __construct(
        private Reservation $reservationModel,
        private Vehicle $vehicleModel,
        private User $userModel,
        private VehicleUnavailability $unavailabilityModel
    ) {}

    /**
     * Prépare et crée une réservation.
     */
    public function createReservation(
        int $userId,
        array $data
    ): array {
        // Vérifier l'utilisateur connecté
        $user = $this->userModel->findById($userId);

        if ($user === null) {
            throw new RuntimeException(
                'Utilisateur introuvable.'
            );
        }

        // Vérifier le véhicule
        $vehicleId = filter_var(
            $data['vehicle_id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($vehicleId === false || $vehicleId === null || $vehicleId < 1) {
            throw new InvalidArgumentException(
                'Véhicule invalide.'
            );
        }

        $vehicle = $this->vehicleModel->findById($vehicleId);

        if ($vehicle === null) {
            throw new InvalidArgumentException(
                'Véhicule introuvable.'
            );
        }

        // Vérifier les dates au format YYYY-MM-DD
        $startDate = $this->parseDate($data['start_date'] ?? '');
        $endDate = $this->parseDate($data['end_date'] ?? '');

        $today = new DateTimeImmutable('today');

        if ($startDate < $today) {
            throw new InvalidArgumentException(
                'La date de départ ne peut pas être passée.'
            );
        }

        if ($endDate <= $startDate) {
            throw new InvalidArgumentException(
                'La date de retour doit être après la date de départ.'
            );
        }

        $numberOfDays = (int) $startDate->diff($endDate)->days;

        // Vérifier le lieu de retrait
        $pickupLocation = trim(
            (string) ($data['pickup_location'] ?? '')
        );

        if (
            $pickupLocation === '' ||
            mb_strlen($pickupLocation) > 150
        ) {
            throw new InvalidArgumentException(
                'Veuillez indiquer un lieu de retrait valide.'
            );
        }

        // Le prix est calculé depuis MySQL, pas depuis React
        $totalPrice = round(
            $numberOfDays * (float) $vehicle['price_per_day'],
            2
        );

        // Construire les informations de réservation
        $reservationData = [
            'user_id' => $userId,
            'vehicle_id' => $vehicleId,
            'customer_name' => trim(
                $user['first_name'] . ' ' . $user['last_name']
            ),
            'customer_email' => $user['email'],
            'customer_phone' => $user['phone'],
            'pickup_location' => $pickupLocation,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'total_price' => number_format($totalPrice, 2, '.', '')
        ];

        $reservationId = $this->reservationModel->withVehicleLock(
            $vehicleId,
            function () use (
                $vehicleId,
                $startDate,
                $endDate,
                $reservationData
            ) {

                // Vérifier l'état actuel du véhicule sous verrou
                $lockedVehicle = $this->vehicleModel->findById($vehicleId);

                if ($lockedVehicle === null) {
                    throw new InvalidArgumentException(
                        'Véhicule introuvable.'
                    );
                }

                $isAvailable = (bool) $lockedVehicle['available']
                    && $lockedVehicle['vehicle_status'] === 'available';

                $activeUnavailability = $this->unavailabilityModel
                    ->findActiveByVehicleId($vehicleId);

                // Si le véhicule est bloqué sans immobilisation enregistrée,
                // aucune réservation ne doit être acceptée.
                if (!$isAvailable && $activeUnavailability === null) {
                    throw new InvalidArgumentException(
                        'Ce véhicule est indisponible sans date de remise en service prévue.'
                    );
                }

                /**
                 * Vérifier si une immobilisation chevauche
                 * les dates de location demandées.
                 */
                $hasBlockingPeriod = $this->unavailabilityModel
                    ->hasBlockingPeriod(
                        $vehicleId,
                        $startDate->format('Y-m-d'),
                        $endDate->format('Y-m-d')
                    );

                if ($hasBlockingPeriod) {
                    throw new InvalidArgumentException(
                        'Ce véhicule est immobilisé pendant les dates demandées.'
                    );
                }

                // Vérifier les conflits de dates dans la transaction
                $hasConflict = $this->reservationModel->hasDateConflict(
                    $vehicleId,
                    $startDate->format('Y-m-d'),
                    $endDate->format('Y-m-d')
                );

                if ($hasConflict) {
                    throw new InvalidArgumentException(
                        'Ce véhicule est déjà réservé sur cette période.'
                    );
                }

                // Enregistrer la réservation
                return $this->reservationModel->create($reservationData);
            }
        );

        return [
            'id' => $reservationId,
            'vehicle_id' => $vehicleId,
            'start_date' => $reservationData['start_date'],
            'end_date' => $reservationData['end_date'],
            'number_of_days' => $numberOfDays,
            'total_price' => $totalPrice,
            'status' => 'pending'
        ];
    }

    /**
     * Historique des réservations d'un utilisateur.
     */
    public function getUserReservations(int $userId): array
    {
        if ($userId < 1) {
            throw new InvalidArgumentException(
                'Utilisateur invalide.'
            );
        }

        return $this->reservationModel->findByUserId($userId);
    }

    /**
     * Convertit une date YYYY-MM-DD en objet DateTime.
     */
    private function parseDate(mixed $value): DateTimeImmutable
    {
        if (
            !is_string($value) ||
            !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)
        ) {
            throw new InvalidArgumentException(
                'Format de date invalide.'
            );
        }

        $date = DateTimeImmutable::createFromFormat(
            '!Y-m-d',
            $value
        );

        if (
            $date === false ||
            $date->format('Y-m-d') !== $value
        ) {
            throw new InvalidArgumentException(
                'Date invalide.'
            );
        }

        return $date;
    }

    /**
     * Annule une réservation appartenant à l'utilisateur.
     *
     * L'annulation est autorisée uniquement
     * jusqu'à 24 heures avant le départ.
     */
    public function cancelReservation(
        int $reservationId,
        int $userId
    ): array {
        if ($reservationId < 1 || $userId < 1) {
            throw new InvalidArgumentException(
                'Réservation invalide.'
            );
        }

        // Vérifier que la réservation appartient au client
        $reservation = $this->reservationModel->findById(
            $reservationId
        );

        if (
            $reservation === null ||
            (int) $reservation['user_id'] !== $userId
        ) {
            throw new InvalidArgumentException(
                'Réservation introuvable.'
            );
        }

        // Vérifier le statut
        if (!in_array(
            $reservation['status'],
            ['pending', 'confirmed'],
            true
        )) {
            throw new InvalidArgumentException(
                'Cette réservation ne peut plus être annulée.'
            );
        }

        // Vérifier le délai de 24 heures
        $timezone = new \DateTimeZone('Europe/Paris');

        $departure = new DateTimeImmutable(
            $reservation['start_date'] . ' 00:00:00',
            $timezone
        );

        $now = new DateTimeImmutable('now', $timezone);

        if ($departure->getTimestamp() - $now->getTimestamp() < 86400) {
            throw new InvalidArgumentException(
                'L’annulation doit être effectuée au moins 24 heures avant le départ.'
            );
        }

        // Modification sécurisée en base de données
        $cancelled = $this->reservationModel->cancelByUserId(
            $reservationId,
            $userId
        );

        if (!$cancelled) {
            throw new InvalidArgumentException(
                'Impossible d’annuler cette réservation.'
            );
        }

        return [
            'id' => $reservationId,
            'status' => 'cancelled',
            'message' => 'Votre réservation a été annulée.'
        ];
    }

    /**
     * Récupère toutes les réservations pour l'administration.
     *
     * Cette méthode doit uniquement être appelée
     * depuis un Controller protégé par AdminMiddleware.
     */
    public function getAllReservationsForAdmin(): array
    {
        return $this->reservationModel->findAllForAdmin();
    }


    /**
     * Confirme une réservation uniquement si
     * le véhicule est officiellement en service.
     */
    public function confirmReservation(int $reservationId): array
    {
        if ($reservationId < 1) {
            throw new InvalidArgumentException(
                'Identifiant de réservation invalide.'
            );
        }

        // Récupérer la réservation concernée
        $reservation = $this->reservationModel->findById(
            $reservationId
        );

        if ($reservation === null) {
            throw new InvalidArgumentException(
                'Réservation introuvable.'
            );
        }

        $vehicleId = (int) $reservation['vehicle_id'];

        // Verrouiller le véhicule pendant la confirmation
        return $this->reservationModel->withVehicleLock(
            $vehicleId,
            function () use ($reservationId, $vehicleId) {

                // Relire la réservation sous verrou
                $reservation = $this->reservationModel->findById(
                    $reservationId
                );

                if (
                    $reservation === null ||
                    $reservation['status'] !== 'pending'
                ) {
                    throw new InvalidArgumentException(
                        'Cette réservation ne peut plus être confirmée.'
                    );
                }

                // Vérifier que l'administrateur a validé
                // la remise en service du véhicule
                if (!$this->reservationModel->isVehicleAvailable($vehicleId)) {
                    throw new InvalidArgumentException(
                        'Le véhicule n’a pas été remis en service.'
                    );
                }

                // Vérifier qu'aucune immobilisation n'est ouverte
                if ($this->unavailabilityModel
                    ->hasActiveUnavailability($vehicleId)
                ) {
                    throw new InvalidArgumentException(
                        'Une immobilisation est toujours en cours.'
                    );
                }

                // Confirmer la réservation
                $confirmed = $this->reservationModel->confirmById(
                    $reservationId
                );

                if (!$confirmed) {
                    throw new InvalidArgumentException(
                        'Impossible de confirmer cette réservation.'
                    );
                }

                return [
                    'id' => $reservationId,
                    'status' => 'confirmed',
                    'message' => 'La réservation a été confirmée.'
                ];
            }
        );
    }

    /**
     * Refuse une réservation en attente.
     */
    public function rejectReservation(int $reservationId): array
    {
        if ($reservationId < 1) {
            throw new InvalidArgumentException(
                'Identifiant de réservation invalide.'
            );
        }

        $rejected = $this->reservationModel->rejectById(
            $reservationId
        );

        if (!$rejected) {
            throw new InvalidArgumentException(
                'Réservation introuvable ou impossible à refuser.'
            );
        }

        return [
            'id' => $reservationId,
            'status' => 'rejected',
            'message' => 'La réservation a été refusée.'
        ];
    }
}
