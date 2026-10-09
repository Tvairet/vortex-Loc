<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Reservation
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    /**
     * Exécute une opération dans une transaction,
     * en verrouillant le véhicule concerné.
     */
    public function withVehicleLock(
        int $vehicleId,
        callable $callback
    ): mixed {
        $this->db->beginTransaction();

        try {
            $statement = $this->db->prepare("
            SELECT id
            FROM vehicles
            WHERE id = :id
            FOR UPDATE
        ");

            $statement->execute(['id' => $vehicleId]);

            if (!$statement->fetch()) {
                throw new \RuntimeException(
                    'Véhicule introuvable.'
                );
            }

            $result = $callback();

            $this->db->commit();

            return $result;
        } catch (\Throwable $error) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            throw $error;
        }
    }

    /**
     * Vérifie la disponibilité d'un véhicule.
     */
    public function isVehicleAvailable(int $vehicleId): bool
    {
        $sql = "
        SELECT available, vehicle_status
        FROM vehicles
        WHERE id = :id
        LIMIT 1
    ";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $vehicleId]);

        $vehicle = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$vehicle) {
            return false;
        }

        return (int) $vehicle['available'] === 1
            && $vehicle['vehicle_status'] === 'available';
    }

    /**
     * Recherche les réservations qui chevauchent
     * les dates demandées pour un véhicule.
     *
     * La date de retour est exclusive :
     * le véhicule peut être reloué ce jour-là.
     */
    public function hasDateConflict(
        int $vehicleId,
        string $startDate,
        string $endDate
    ): bool {
        $sql = "
            SELECT COUNT(*)
            FROM reservations
            WHERE vehicle_id = :vehicle_id
              AND status IN ('pending', 'confirmed')
              AND start_date < :end_date
              AND end_date > :start_date
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'vehicle_id' => $vehicleId,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);

        return (int) $statement->fetchColumn() > 0;
    }

    /**
     * Enregistre une nouvelle réservation.
     * Les données doivent déjà être validées
     * par ReservationService.
     */
    public function create(array $data): int
    {
        $sql = "
            INSERT INTO reservations (
                user_id,
                vehicle_id,
                customer_name,
                customer_email,
                customer_phone,
                pickup_location,
                start_date,
                end_date,
                total_price,
                status
            ) VALUES (
                :user_id,
                :vehicle_id,
                :customer_name,
                :customer_email,
                :customer_phone,
                :pickup_location,
                :start_date,
                :end_date,
                :total_price,
                'pending'
            )
        ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'user_id' => $data['user_id'],
            'vehicle_id' => $data['vehicle_id'],
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'pickup_location' => $data['pickup_location'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'total_price' => $data['total_price']
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Récupère les réservations d'un utilisateur
     * avec les informations des véhicules.
     */
    public function findByUserId(int $userId): array
    {
        $sql = "
            SELECT
                r.id,
                r.vehicle_id,
                r.start_date,
                r.end_date,
                r.total_price,
                r.status,
                r.pickup_location,
                r.created_at,
                v.brand,
                v.model,
                v.image
            FROM reservations r
            INNER JOIN vehicles v ON v.id = r.vehicle_id
            WHERE r.user_id = :user_id
            ORDER BY r.created_at DESC, r.id DESC
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'user_id' => $userId
        ]);

        return $statement->fetchAll();
    }

    /**
     * Récupère une réservation par son ID.
     */
    public function findById(int $id): ?array
    {
        $sql = "
            SELECT *
            FROM reservations
            WHERE id = :id
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        $reservation = $statement->fetch();

        return $reservation ?: null;
    }

    /**
     * Annule une réservation appartenant à un utilisateur.
     *
     * Conditions :
     * - Réservation appartenant au client
     * - Statut pending ou confirmed
     * - Annulation au moins 24h avant le départ
     *
     * Hypothèse actuelle : départ à 00h00,
     * heure de Paris.
     */
    public function cancelByUserId(
        int $reservationId,
        int $userId
    ): bool {
        $sql = "
        UPDATE reservations
        SET status = 'cancelled'
        WHERE id = :reservation_id
          AND user_id = :user_id
          AND status IN ('pending', 'confirmed')
          AND TIMESTAMP(start_date) >= :deadline
    ";

        $departureLimit = (new \DateTimeImmutable(
            '+24 hours',
            new \DateTimeZone('Europe/Paris')
        ))->format('Y-m-d H:i:s');

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'reservation_id' => $reservationId,
            'user_id' => $userId,
            'deadline' => $departureLimit
        ]);

        return $statement->rowCount() === 1;
    }

    /**
     * Récupère toutes les réservations pour l'administration.
     */
    public function findAllForAdmin(): array
    {
        $sql = "
        SELECT
            r.id,
            r.user_id,
            r.vehicle_id,
            r.customer_name,
            r.customer_email,
            r.pickup_location,
            r.start_date,
            r.end_date,
            r.total_price,
            r.status,
            r.created_at,
            v.brand,
            v.model
        FROM reservations r
        INNER JOIN vehicles v
            ON v.id = r.vehicle_id
        ORDER BY r.created_at DESC, r.id DESC
    ";

        $statement = $this->db->query($sql);

        return $statement->fetchAll();
    }

    /**
     * Confirme une réservation en attente.
     */
    public function confirmById(int $id): bool
    {
        $sql = "
        UPDATE reservations
        SET status = 'confirmed'
        WHERE id = :id
          AND status = 'pending'
    ";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        return $statement->rowCount() === 1;
    }

    /**
     * Refuse une réservation en attente.
     */
    public function rejectById(int $id): bool
    {
        $sql = "
        UPDATE reservations
        SET status = 'rejected'
        WHERE id = :id
          AND status = 'pending'
    ";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        return $statement->rowCount() === 1;
    }

    /**
     * Compte les réservations par statut.
     *
     * Statuts possibles :
     * pending, confirmed, cancelled, rejected.
     */
    public function getStatusStatistics(): array
    {
        $statement = $this->db->query("
        SELECT
            status,
            COUNT(*) AS total
        FROM reservations
        GROUP BY status
    ");

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calcule la valeur totale des réservations confirmées.
     *
     * Il s'agit du montant réservé, et non
     * d'un chiffre d'affaires réellement encaissé.
     */
    public function getConfirmedRevenue(): float
    {
        $statement = $this->db->query("
        SELECT COALESCE(SUM(total_price), 0)
        FROM reservations
        WHERE status = 'confirmed'
    ");

        return (float) $statement->fetchColumn();
    }
}
