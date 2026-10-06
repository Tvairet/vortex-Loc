-- Base VORTEX'LOC
-- Charset : utf8mb4

CREATE DATABASE IF NOT EXISTS `vortex_loc`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vortex_loc`;

CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `seats` tinyint(3) UNSIGNED NOT NULL,
  `transmission` varchar(50) NOT NULL,
  `power` varchar(50) DEFAULT NULL,
  `range_km` int(10) UNSIGNED DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` int(10) UNSIGNED NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(180) NOT NULL,
  `customer_phone` varchar(30) DEFAULT NULL,
  `pickup_location` varchar(150) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reservations_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_reservations_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
