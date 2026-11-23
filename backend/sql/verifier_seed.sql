-- VORTEX'LOC | CONTROLE DU SEED (LECTURE SEULE)
-- Selectionner la base cible avant execution.
SET NAMES utf8mb4;

SELECT COUNT(*) AS nb_vehicules FROM `vehicles`;
SELECT `category`, `motorization`, COUNT(*) AS nombre
FROM `vehicles`
GROUP BY `category`, `motorization`
ORDER BY FIELD(`category`, 'Sportive','Citadine','Familiale','SUV'),
         FIELD(`motorization`, 'electric','thermal');

SELECT `brand`, `model`, COUNT(*) AS doublons
FROM `vehicles`
GROUP BY `brand`, `model`
HAVING COUNT(*) > 1;

SELECT `id`, `brand`, `model`, `category`, `motorization`, `price_per_day`, `image`
FROM `vehicles`
ORDER BY FIELD(`category`, 'Sportive','Citadine','Familiale','SUV'),
         FIELD(`motorization`, 'electric','thermal'), `brand`, `model`;

SELECT `code`, `name`, `unit_price`, `pricing_unit`, `enabled`
FROM `rental_options` ORDER BY `code`;
