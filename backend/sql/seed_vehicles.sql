INSERT IGNORE INTO `vehicles`
  (`id`, `brand`, `model`, `category`, `price_per_day`, `seats`, `transmission`, `power`, `range_km`, `image`, `description`, `available`)
VALUES
  (1, 'Porsche', 'Taycan Turbo GT', 'Électrique', 499.00, 4, 'Automatique', '1 034 ch', 556, '/images/hero-taycan.png', 'Une sportive électrique exceptionnelle combinant performances, technologie et confort.', 1),
  (2, 'BMW', 'M4 Competition', 'Sportive', 299.00, 4, 'Automatique', '510 ch', NULL, '/images/hero-taycan.png', 'Un coupé sportif puissant et dynamique.', 1),
  (3, 'Mercedes-Benz', 'AMG GT', 'Sportive', 399.00, 2, 'Automatique', '585 ch', NULL, '/images/hero-taycan.png', 'Une sportive premium au caractère affirmé.', 1);
