
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
}
