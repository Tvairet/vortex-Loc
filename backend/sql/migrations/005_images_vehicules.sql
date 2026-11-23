-- Vortex'Loc - LOT IMAGES
-- IMPORTANT : ne PAS executer avant d'avoir copie les images correspondantes
-- dans frontend/public/images/.
-- A executer UNE SEULE FOIS apres verification des 11 fichiers.
-- Protege les chemins existants autres que les photos temporaires identifiees.
-- Ne modifie ni tarifs, ni options, ni reservations.

USE `vortex_loc`;
SET NAMES utf8mb4;
START TRANSACTION;

-- Sportives : Porsche et BMW conservent leurs images actuelles.
-- Mercedes : l'ancien chemin utilise l'image de la Porsche (image provisoire).
UPDATE `vehicles`
SET `image` = '/images/mercedes-amg-gt.png'
WHERE `brand` = 'Mercedes-Benz' AND `model` = 'AMG GT'
  AND (`image` IS NULL OR `image` = '' OR `image` = '/images/hero-taycan.png');

UPDATE `vehicles`
SET `image` = '/images/audi-rs6.png'
WHERE `brand` = 'Audi' AND `model` = 'RS6'
  AND (`image` IS NULL OR `image` = '');

-- Citadines : renseigner uniquement les photos encore absentes.
UPDATE `vehicles` SET `image` = '/images/renault-5-etech.png'
WHERE `brand` = 'Renault' AND `model` = '5 E-Tech' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/peugeot-e-208.png'
WHERE `brand` = 'Peugeot' AND `model` = 'e-208' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/volkswagen-polo.png'
WHERE `brand` = 'Volkswagen' AND `model` = 'Polo' AND (`image` IS NULL OR `image` = '');

-- Familiales
UPDATE `vehicles` SET `image` = '/images/tesla-model-3.png'
WHERE `brand` = 'Tesla' AND `model` = 'Model 3' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/volkswagen-id7-tourer.png'
WHERE `brand` = 'Volkswagen' AND `model` = 'ID.7 Tourer' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/skoda-octavia-combi.png'
WHERE `brand` = 'Skoda' AND `model` = 'Octavia Combi' AND (`image` IS NULL OR `image` = '');

-- SUV
UPDATE `vehicles` SET `image` = '/images/hyundai-kona-electric.png'
WHERE `brand` = 'Hyundai' AND `model` = 'Kona Electric' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/skoda-enyaq.png'
WHERE `brand` = 'Skoda' AND `model` = 'Enyaq' AND (`image` IS NULL OR `image` = '');
UPDATE `vehicles` SET `image` = '/images/seat-ateca.png'
WHERE `brand` = 'SEAT' AND `model` = 'Ateca' AND (`image` IS NULL OR `image` = '');

COMMIT;

SELECT `id`, `brand`, `model`, `image` FROM `vehicles` ORDER BY `id`;
