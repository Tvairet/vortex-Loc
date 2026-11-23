<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class VehicleUnavailability
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    /**
     * Exécute une opération dans une transaction
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

            $statement->execute([
                'id' => $vehicleId
            ]);

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
     * Récupère les immobilisations d'un véhicule,
     * de la plus récente à la plus ancienne.
     */
    public function findByVehicleId(int $vehicleId): array
    {
        $sql = "
            SELECT *
            FROM vehicle_unavailability
            WHERE vehicle_id = :vehicle_id
            ORDER BY created_at DESC, id DESC
        ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'vehicle_id' => $vehicleId
        ]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère l'immobilisation en cours,
     * si elle n'a pas été clôturée.
     */
    public function findActiveByVehicleId(int $vehicleId): ?array
    {
        $sql = "
            SELECT *
            FROM vehicle_unavailability
            WHERE vehicle_id = :vehicle_id
              AND resolved_at IS NULL
            ORDER BY id DESC
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'vehicle_id' => $vehicleId
        ]);

        $result = $statement->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    /**
     * Indique si une immobilisation non clôturée
     * est actuellement enregistrée pour ce véhicule.
     */
    public function hasActiveUnavailability(int $vehicleId): bool
    {
        return $this->findActiveByVehicleId($vehicleId) !== null;
    }

    /**
     * Vérifie si une réservation chevauche
     * une immobilisation non clôturée.
     *
     * La date de retour est exclusive.
     * La fin prévisionnelle est incluse.
     */
    public function hasBlockingPeriod(
        int $vehicleId,
        string $startDate,
        string $endDate
    ): bool {
        $sql = "
        SELECT COUNT(*)
        FROM vehicle_unavailability
        WHERE vehicle_id = :vehicle_id
          AND resolved_at IS NULL
          AND start_date < :end_date
          AND (
              estimated_end_date IS NULL
              OR DATE_ADD(
                  estimated_end_date,
                  INTERVAL 1 DAY
              ) > :start_date
          )
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
     * Enregistre une nouvelle immobilisation.
     */
    public function create(
        int $vehicleId,
        string $status,
        ?string $reason,
        string $startDate,
        ?string $estimatedEndDate
    ): int {
        $sql = "
        INSERT INTO vehicle_unavailability (
            vehicle_id,
            status,
            reason,
            start_date,
            estimated_end_date
        ) VALUES (
            :vehicle_id,
            :status,
            :reason,
            :start_date,
            :estimated_end_date
        )
    ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'vehicle_id' => $vehicleId,
            'status' => $status,
            'reason' => $reason,
            'start_date' => $startDate,
            'estimated_end_date' => $estimatedEndDate
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Clôture une immobilisation après validation
     * de la remise en service par l'administrateur.
     */
    public function resolve(int $id): bool
    {
        $sql = "
        UPDATE vehicle_unavailability
        SET resolved_at = NOW()
        WHERE id = :id
          AND resolved_at IS NULL
    ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'id' => $id
        ]);

        return $statement->rowCount() === 1;
    }
}
