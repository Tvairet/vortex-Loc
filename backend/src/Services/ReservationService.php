<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\User;
use DateTimeImmutable;
use InvalidArgumentException;
use RuntimeException;
use App\Models\VehicleUnavailability;
use App\Models\RentalOption;

class ReservationService
{

    public function __construct(
        private Reservation $reservationModel,
        private Vehicle $vehicleModel,
        private User $userModel,
        private VehicleUnavailability $unavailabilityModel,
        private RentalOption $rentalOptionModel,
        private RentalOptionService $rentalOptionService
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
        $includedKm = $numberOfDays * RentalPolicy::INCLUDED_KM_PER_DAY;

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

        // Les montants, y compris les options, seront calcules en transaction
        // avec les tarifs MySQL les plus recents (ne jamais accepter un prix client).
        $requestedOptions = $data['options'] ?? [];

        $saved = $this->reservationModel->withVehicleLock(
            $vehicleId,
            function () use (
                $vehicleId,
                $startDate,
                $endDate,
                $numberOfDays,
                $includedKm,
                $pickupLocation,
                $userId,
                $user,
                $requestedOptions
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

                $pricedOptions = $this->rentalOptionService->priceSelection(
                    $requestedOptions,
                    $lockedVehicle,
                    $numberOfDays
                );

                $vehicleCents = (int) round((float) $lockedVehicle['price_per_day'] * 100);
                $vehicleSubtotalCents = $vehicleCents * $numberOfDays;
                $optionSubtotalCents = array_sum(array_column($pricedOptions, 'line_total_cents'));
                $totalCents = $vehicleSubtotalCents + $optionSubtotalCents;

                $reservationData = [
                    'user_id' => $userId,
                    'vehicle_id' => $vehicleId,
                    'customer_name' => trim($user['first_name'] . ' ' . $user['last_name']),
                    'customer_email' => $user['email'],
                    'customer_phone' => $user['phone'],
                    'pickup_location' => $pickupLocation,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'total_price' => number_format($totalCents / 100, 2, '.', ''),
                    'included_km' => $includedKm,
                    'extra_km_rate' => RentalPolicy::EXTRA_KM_RATE
                ];

                $reservationId = $this->reservationModel->create($reservationData);
                $this->rentalOptionModel->saveForReservation($reservationId, $pricedOptions);

                return [
                    'id' => $reservationId,
                    'total_price' => $totalCents / 100,
                    'vehicle_subtotal' => $vehicleSubtotalCents / 100,
                    'options_subtotal' => $optionSubtotalCents / 100,
                    'options' => array_map(static function (array $option): array {
                        unset($option['line_total_cents'], $option['option_id']);
                        return $option;
                    }, $pricedOptions)
                ];
            }
        );

        return [
            'id' => $saved['id'],
            'vehicle_id' => $vehicleId,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'number_of_days' => $numberOfDays,
            'included_km' => $includedKm,
            'extra_km_rate' => (float) RentalPolicy::EXTRA_KM_RATE,
            'vehicle_subtotal' => $saved['vehicle_subtotal'],
            'options_subtotal' => $saved['options_subtotal'],
            'options' => $saved['options'],
            'total_price' => $saved['total_price'],
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

        return $this->rentalOptionModel->attachToReservations(
            $this->reservationModel->findByUserId($userId)
        );
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
        return $this->rentalOptionModel->attachToReservations(
            $this->reservationModel->findAllForAdmin()
        );
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
