-- VORTEX'LOC | SEED FINAL - DEMONSTRATION DWWM
-- Fichier UTF-8 (utf8mb4), compatible MySQL/MariaDB.
-- Selectionner d'abord la base cible (vortex_loc en local ou vortexloc_app sur Alwaysdata).
-- Le script n'inclut volontairement ni CREATE DATABASE ni USE : portable entre environnements.
-- A utiliser APRES la creation du schema final comportant vehicles.motorization.
-- Ajoute seulement les lignes absentes (marque + modele pour vehicles, code pour rental_options).
-- NE modifie PAS les vehicules deja existants, les comptes, les reservations ou les immobilisations.
-- Pour restaurer fidelement des prix/chemins modifies, ce seed ne remplace PAS une sauvegarde SQL.
-- Tarifs et visuels fictifs/illustratifs pour le projet pedagogique; pas une offre commerciale.

SET NAMES utf8mb4;
START TRANSACTION;

-- ============================================================
-- 13 VEHICULES | Sportives, Citadines, Familiales, SUV
-- ============================================================
-- En cas de reexecution, pas de doublon pour chaque couple marque + modele.
-- Les colonnes id, created_at, available, vehicle_status sont gerees par les valeurs par defaut.

-- SPORTIVE | electriques puis thermiques

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Porsche', 'Taycan Turbo GT', 'Sportive', 'electric', 499.00, 4, 'Automatique', '1 034 ch', 556, '/images/porsche-taycan.png', 'Une sportive électrique exceptionnelle combinant performances, technologie et confort.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Porsche' AND `model` = 'Taycan Turbo GT'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'BMW', 'M4 Competition', 'Sportive', 'thermal', 299.00, 4, 'Automatique', '510 ch', NULL, '/images/bmw-m4.png', 'Un coupé sportif puissant et dynamique.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'BMW' AND `model` = 'M4 Competition'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Mercedes-Benz', 'AMG GT', 'Sportive', 'thermal', 399.00, 2, 'Automatique', '585 ch', NULL, '/images/mercedes-amg-gt.png', 'Une sportive premium au caractère affirmé.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Mercedes-Benz' AND `model` = 'AMG GT'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Audi', 'RS6', 'Sportive', 'thermal', 320.00, 5, 'Automatique', NULL, NULL, '/images/audi-rs6.png', 'Un break sportif haut de gamme associant polyvalence et performances.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Audi' AND `model` = 'RS6'
);

-- CITADINE | electriques puis thermiques

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Renault', '5 E-Tech', 'Citadine', 'electric', 59.00, 5, 'Automatique', NULL, NULL, '/images/renault-5-etech.png', 'Citadine électrique agile pour la ville, facile à conduire et à stationner.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Renault' AND `model` = '5 E-Tech'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Peugeot', 'e-208', 'Citadine', 'electric', 62.00, 5, 'Automatique', NULL, NULL, '/images/peugeot-e-208.png', 'Citadine électrique polyvalente pour les trajets quotidiens et les week-ends.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Peugeot' AND `model` = 'e-208'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Volkswagen', 'Polo', 'Citadine', 'thermal', 49.00, 5, 'Manuelle', NULL, NULL, '/images/volkswagen-polo.png', 'Citadine thermique compacte et pratique pour circuler en ville.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Volkswagen' AND `model` = 'Polo'
);

-- FAMILIALE | electriques puis thermiques

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Tesla', 'Model 3', 'Familiale', 'electric', 99.00, 5, 'Automatique', NULL, NULL, '/images/tesla-model-3.png', 'Berline électrique confortable pour les déplacements à plusieurs.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Tesla' AND `model` = 'Model 3'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Volkswagen', 'ID.7 Tourer', 'Familiale', 'electric', 115.00, 5, 'Automatique', NULL, NULL, '/images/volkswagen-id7-tourer.png', 'Grand break électrique, spacieux pour les passagers et les bagages.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Volkswagen' AND `model` = 'ID.7 Tourer'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Skoda', 'Octavia Combi', 'Familiale', 'thermal', 85.00, 5, 'Automatique', NULL, NULL, '/images/skoda-octavia-combi.png', 'Break familial avec un coffre généreux pour les vacances.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Skoda' AND `model` = 'Octavia Combi'
);

-- SUV | electriques puis thermiques

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Hyundai', 'Kona Electric', 'SUV', 'electric', 89.00, 5, 'Automatique', NULL, NULL, '/images/hyundai-kona-electric.png', 'SUV électrique compact qui combine modularité et confort.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Hyundai' AND `model` = 'Kona Electric'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'Skoda', 'Enyaq', 'SUV', 'electric', 105.00, 5, 'Automatique', NULL, NULL, '/images/skoda-enyaq.png', 'SUV électrique spacieux adapté aux longs trajets en famille.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'Skoda' AND `model` = 'Enyaq'
);

INSERT INTO `vehicles` (`brand`, `model`, `category`, `motorization`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`)
SELECT 'SEAT', 'Ateca', 'SUV', 'thermal', 79.00, 5, 'Automatique', NULL, NULL, '/images/seat-ateca.png', 'SUV thermique polyvalent et pratique au quotidien.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `vehicles`
    WHERE `brand` = 'SEAT' AND `model` = 'Ateca'
);

-- ============================================================
-- 3 OPTIONS | les prix sont des tarifs journaliers de demonstration
-- ============================================================
-- La base creee par schema.sql a peut-etre deja ces 3 options.
-- INSERT IGNORE evite les doublons grace a unique_rental_option_code.
INSERT IGNORE INTO `rental_options`
  (`code`, `name`, `description`, `pricing_unit`, `unit_price`, `enabled`)
VALUES
  ('additional_driver', 'Conducteur supplémentaire',
   'Ajout d''un conducteur autorisé, sous réserve des conditions du contrat.', 'per_day', 8.00, 1),
  ('family_pack', 'Pack Famille',
   'Siège bébé, siège enfant ou rehausseur adapté, selon disponibilité.', 'per_day', 7.00, 1),
  ('escape_pack', 'Pack Évasion',
   'Coffre de toit et équipements de voyage selon véhicule et saison.', 'per_day', 25.00, 1);

COMMIT;

-- Contrôles lecture seule :
SELECT COUNT(*) AS nombre_vehicules FROM `vehicles`;
SELECT `code`, `name`, `unit_price`, `pricing_unit`, `enabled`
FROM `rental_options` ORDER BY `code`;
