-- Base VORTEX'LOC
-- Charset : utf8mb4

CREATE DATABASE IF NOT EXISTS `vortex_loc` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `vortex_loc`;

-- ============================
-- UTILISATEURS
-- ============================

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================
-- VEHICLES
-- ============================

CREATE TABLE IF NOT EXISTS `vehicles` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `brand` varchar(100) NOT NULL,
    `model` varchar(100) NOT NULL,
    `category` varchar(100) NOT NULL,
    `motorization` ENUM('electric', 'thermal') NULL DEFAULT NULL,
    `price_per_day` decimal(10, 2) NOT NULL,
    `seats` tinyint(3) UNSIGNED NOT NULL,
    `transmission` varchar(50) NOT NULL,
    `power` varchar(50) DEFAULT NULL,
    `range_km` int(10) UNSIGNED DEFAULT NULL,
    `image` varchar(255) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `available` tinyint(1) NOT NULL DEFAULT 1,
    `vehicle_status` VARCHAR(30) NOT NULL DEFAULT 'available',
    `status_reason` TEXT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================
-- RESERVATIONS
-- ============================

CREATE TABLE IF NOT EXISTS `reservations` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `vehicle_id` int(10) UNSIGNED NOT NULL,
    `customer_name` varchar(150) NOT NULL,
    `customer_email` varchar(180) NOT NULL,
    `customer_phone` varchar(30) DEFAULT NULL,
    `pickup_location` varchar(150) NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `total_price` decimal(10, 2) NOT NULL,
    -- Forfait contractuel, figé lors de la création de la réservation.
    `included_km` int UNSIGNED DEFAULT NULL,
    `extra_km_rate` decimal(6, 2) DEFAULT NULL,
    -- Renseignés ultérieurement lors de l'état des lieux départ/retour.
    `odometer_start_km` int UNSIGNED DEFAULT NULL,
    `odometer_end_km` int UNSIGNED DEFAULT NULL,
    `extra_km` int UNSIGNED DEFAULT NULL,
    `extra_km_amount` decimal(10, 2) DEFAULT NULL,
    `status` varchar(30) NOT NULL DEFAULT 'pending',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_reservations_vehicle` (`vehicle_id`),
    CONSTRAINT `fk_reservations_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    KEY `idx_reservations_user` (`user_id`),
    CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================
-- IMMOBILISATIONS DES VEHICULES
-- ============================

CREATE TABLE IF NOT EXISTS `vehicle_unavailability` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `vehicle_id` INT UNSIGNED NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `reason` TEXT DEFAULT NULL,
    `start_date` DATE NOT NULL,
    `estimated_end_date` DATE DEFAULT NULL,
    `resolved_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_unavailability_vehicle` (`vehicle_id`),
    CONSTRAINT `fk_unavailability_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Catalogue des options validees : prix par jour de location.
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

-- Historique des options : tarifs figes au moment de la reservation.
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

-- Initialisation reservee aux installations neuves (ne pas rejouer sur la base existante).
INSERT IGNORE INTO `rental_options`
    (`code`, `name`, `description`, `pricing_unit`, `unit_price`, `enabled`)
VALUES
    ('additional_driver', 'Conducteur supplémentaire',
        'Ajout d''un conducteur autorise, sous reserve des conditions du contrat.', 'per_day', 8.00, 1),
    ('family_pack', 'Pack Famille',
        'Siege bebe, siege enfant ou rehausseur adapte, selon disponibilite.', 'per_day', 7.00, 1),
    ('escape_pack', 'Pack Évasion',
        'Coffre de toit et equipements de voyage selon vehicule et saison.', 'per_day', 25.00, 1);
