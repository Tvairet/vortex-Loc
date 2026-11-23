-- Vortex'Loc - migration 003 : tarifs approuves (23/10/2026).
-- Prerequis : migration 002 appliquee et sauvegarde SQL recente.
-- Relancable : les trois lignes sont mises a jour par code, sans insertion en double.
-- Aucun changement sur les anciennes reservations ou sur leurs snapshots.
USE `vortex_loc`;

UPDATE `rental_options`
SET `name` = 'Conducteur supplémentaire',
    `pricing_unit` = 'per_day', `unit_price` = 8.00, `enabled` = 1
WHERE `code` = 'additional_driver';

UPDATE `rental_options`
SET `pricing_unit` = 'per_day', `unit_price` = 7.00, `enabled` = 1
WHERE `code` = 'family_pack';

UPDATE `rental_options`
SET `name` = 'Pack Évasion',
    `pricing_unit` = 'per_day', `unit_price` = 25.00, `enabled` = 1
WHERE `code` = 'escape_pack';

SELECT `code`, `pricing_unit`, `unit_price`, `enabled`
FROM `rental_options`
WHERE `code` IN ('additional_driver', 'family_pack', 'escape_pack')
ORDER BY `id`;
