-- Lot 3 : classifier les vehicules sans modifier les reservations.
-- A executer UNE SEULE FOIS, apres sauvegarde SQL de vortex_loc.
USE `vortex_loc`;
ALTER TABLE `vehicles`
  ADD COLUMN `motorization` ENUM('electric', 'thermal') NULL DEFAULT NULL AFTER `category`;

-- Attribution uniquement pour les modeles identifies avec certitude.
UPDATE `vehicles`
SET `category` = 'Sportive', `motorization` = 'electric'
WHERE `brand` = 'Porsche' AND `model` = 'Taycan Turbo GT';

UPDATE `vehicles`
SET `category` = 'Sportive', `motorization` = 'thermal'
WHERE (`brand` = 'BMW' AND `model` = 'M4 Competition')
   OR (`brand` = 'Mercedes-Benz' AND `model` = 'AMG GT');

-- Autres vehicules existants : type et categorie conserves.
-- Si la motorisation est NULL, la preciser ensuite dans l'administration.
