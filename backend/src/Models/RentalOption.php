<?php

namespace App\Models;

use App\Core\Database;
use InvalidArgumentException;
use PDO;

/** Catalogue et snapshots des options de location. */
class RentalOption
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    public function findEnabled(): array
    {
        $statement = $this->db->query("
            SELECT id, code, name, description, pricing_unit, unit_price
            FROM rental_options
            WHERE enabled = 1 AND unit_price IS NOT NULL
            ORDER BY id ASC
        ");

        return array_map(static function (array $option): array {
            $option['id'] = (int) $option['id'];
            $option['unit_price'] = (float) $option['unit_price'];
            return $option;
        }, $statement->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Relit les prix depuis MySQL, dans la transaction de creation. */
    public function findEnabledByCode(string $code): ?array
    {
        $statement = $this->db->prepare("
            SELECT id, code, name, pricing_unit, unit_price
            FROM rental_options
            WHERE code = :code AND enabled = 1 AND unit_price IS NOT NULL
            LIMIT 1
            FOR UPDATE
        ");
        $statement->execute(['code' => $code]);
        return $statement->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Conserve le prix applique au client, independamment des futurs tarifs. */
    public function saveForReservation(int $reservationId, array $selection): void
    {
        if ($selection === []) return;

        $statement = $this->db->prepare("
            INSERT INTO reservation_options (
                reservation_id, option_id, variant, quantity,
                pricing_unit_snapshot, unit_price_snapshot, line_total
            ) VALUES (
                :reservation_id, :option_id, :variant, :quantity,
                :pricing_unit, :unit_price, :line_total
            )
        ");

        foreach ($selection as $item) {
            $statement->execute([
                'reservation_id' => $reservationId,
                'option_id' => $item['option_id'],
                'variant' => $item['variant'],
                'quantity' => 1,
                'pricing_unit' => $item['pricing_unit'],
                'unit_price' => $item['unit_price'],
                'line_total' => $item['line_total']
            ]);
        }
    }

    /** Charge toutes les options en une seule requete pour une liste de reservations. */
    public function attachToReservations(array $reservations): array
    {
        if ($reservations === []) return [];

        $ids = array_map(static fn (array $row): int => (int) $row['id'], $reservations);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $statement = $this->db->prepare("
            SELECT ro.reservation_id, ro.variant, ro.quantity,
                   ro.pricing_unit_snapshot, ro.unit_price_snapshot, ro.line_total,
                   o.code, o.name
            FROM reservation_options ro
            INNER JOIN rental_options o ON o.id = ro.option_id
            WHERE ro.reservation_id IN ($placeholders)
            ORDER BY ro.id
        ");
        $statement->execute($ids);

        $byReservation = [];
        foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $reservationId = (int) $item['reservation_id'];
            unset($item['reservation_id']);
            $item['quantity'] = (int) $item['quantity'];
            $item['unit_price_snapshot'] = (float) $item['unit_price_snapshot'];
            $item['line_total'] = (float) $item['line_total'];
            $byReservation[$reservationId][] = $item;
        }

        foreach ($reservations as &$reservation) {
            $reservation['options'] = $byReservation[(int) $reservation['id']] ?? [];
        }
        unset($reservation);
        return $reservations;
    }
}
