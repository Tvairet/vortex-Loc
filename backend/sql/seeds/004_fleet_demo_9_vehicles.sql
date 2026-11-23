-- Jeu de demonstration facultatif : 9 vehicules supplementaires.

-- Tarifs / versions / descriptions PROPOSES pour projet DWWM, non contractuels.

-- Les photos et fiches techniques exactes seront ajoutees apres verification.

-- Rejouable : evite les doublons pour une marque + un modele existants.

-- Ne modifie jamais les anciens vehicules, leurs prix ou leurs reservations.

USE `vortex_loc`;

SET NAMES utf8mb4;

START TRANSACTION;

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Renault', '5 E-Tech', 'Citadine', 'electric', 59.00, 5, 'Automatique', NULL, NULL, NULL, 'Citadine electrique agile pour la ville, facile a conduire et a stationner.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Renault' AND `model` = '5 E-Tech'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Peugeot', 'e-208', 'Citadine', 'electric', 62.00, 5, 'Automatique', NULL, NULL, NULL, 'Citadine electrique polyvalente pour les trajets quotidiens et les week-ends.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Peugeot' AND `model` = 'e-208'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Volkswagen', 'Polo', 'Citadine', 'thermal', 49.00, 5, 'Manuelle', NULL, NULL, NULL, 'Citadine essence compacte et pratique pour circuler en ville.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Volkswagen' AND `model` = 'Polo'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Tesla', 'Model 3', 'Familiale', 'electric', 99.00, 5, 'Automatique', NULL, NULL, NULL, 'Berline electrique confortable pour les deplacements a plusieurs.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Tesla' AND `model` = 'Model 3'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Volkswagen', 'ID.7 Tourer', 'Familiale', 'electric', 115.00, 5, 'Automatique', NULL, NULL, NULL, 'Grand break electrique, spacieux pour les passagers et les bagages.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Volkswagen' AND `model` = 'ID.7 Tourer'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Skoda', 'Octavia Combi', 'Familiale', 'thermal', 85.00, 5, 'Automatique', NULL, NULL, NULL, 'Break familial avec un coffre genereux pour les vacances.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Skoda' AND `model` = 'Octavia Combi'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Hyundai', 'Kona Electric', 'SUV', 'electric', 89.00, 5, 'Automatique', NULL, NULL, NULL, 'SUV electrique compact qui combine modularite et confort.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Hyundai' AND `model` = 'Kona Electric'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'Skoda', 'Enyaq', 'SUV', 'electric', 105.00, 5, 'Automatique', NULL, NULL, NULL, 'SUV electrique spacieux adapte aux longs trajets en famille.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'Skoda' AND `model` = 'Enyaq'
);

INSERT INTO `vehicles` (brand, model, category, motorization, price_per_day, seats, transmission, power, range_km, image, description)
SELECT 'SEAT', 'Ateca', 'SUV', 'thermal', 79.00, 5, 'Automatique', NULL, NULL, NULL, 'SUV essence polyvalent et pratique au quotidien.'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `vehicles`
  WHERE `brand` = 'SEAT' AND `model` = 'Ateca'
);

COMMIT;
