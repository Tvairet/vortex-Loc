-- Vortex'Loc - migration 002 : forfait kilometrage et catalogue d'options.
-- A appliquer sur une SAUVEGARDE de la base puis dans vortex_loc.
-- Compatible MariaDB 10.4 (XAMPP). Ne supprime aucune reservation existante.
-- Les nouvelles colonnes sont NULL pour les anciennes reservations :
-- on n'attribue pas retroactivement une politique tarifaire aux anciens contrats.
USE `vortex_loc`;

ALTER TABLE `reservations`
    ADD COLUMN IF NOT EXISTS `included_km` INT UNSIGNED NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `extra_km_rate` DECIMAL(6,2) NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `odometer_start_km` INT UNSIGNED NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `odometer_end_km` INT UNSIGNED NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `extra_km` INT UNSIGNED NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `extra_km_amount` DECIMAL(10,2) NULL DEFAULT NULL;

-- Options retenues : tarifs non fixes => ne pas les facturer ou les proposer
-- comme reservables avant validation des tarifs et conditions commerciales.
CREATE TABLE IF NOT EXISTS `rental_options` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `pricing_unit` ENUM('per_day','per_booking') NULL DEFAULT NULL,
    `unit_price` DECIMAL(10,2) NULL DEFAULT NULL,
    `enabled` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_rental_option_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historique futur des options selectionnees par reservation.
-- Le tarif est fige lors de la validation d'une option (non implemente ici).
CREATE TABLE IF NOT EXISTS `reservation_options` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `reservation_id` INT UNSIGNED NOT NULL,
    `option_id` INT UNSIGNED NOT NULL,
    `variant` VARCHAR(100) NULL DEFAULT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `pricing_unit_snapshot` VARCHAR(20) NULL DEFAULT NULL,
    `unit_price_snapshot` DECIMAL(10,2) NULL DEFAULT NULL,
    `line_total` DECIMAL(10,2) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_reservation_option` (`reservation_id`, `option_id`),
    CONSTRAINT `fk_reservation_option_reservation` FOREIGN KEY (`reservation_id`)
        REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reservation_option_catalog` FOREIGN KEY (`option_id`)
        REFERENCES `rental_options` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT IGNORE pour ne pas effacer une tarification configuree ulterieurement.
INSERT IGNORE INTO `rental_options`
    (`code`, `name`, `description`, `pricing_unit`, `unit_price`, `enabled`)
VALUES
    ('additional_driver', 'Conducteur supplementaire',
        'Ajout d''un conducteur autorise, sous reserve des conditions du contrat.', NULL, NULL, 0),
    ('family_pack', 'Pack Famille',
        'Siege bebe, siege enfant ou rehausseur adapte, selon disponibilite.', NULL, NULL, 0),
    ('escape_pack', 'Pack Evasion',
        'Coffre de toit et equipements de voyage selon vehicule et saison.', NULL, NULL, 0);
