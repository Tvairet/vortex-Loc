<?php

require_once dirname(__DIR__) . '/src/Services/RentalOptionService.php';

use App\Services\RentalOptionService;

$cases = [
    ['SUV', true],
    ['Familiale', true],
    ['Citadine', false],
    ['', false],
];

foreach ($cases as [$category, $expected]) {
    $actual = RentalOptionService::isEscapeCompatible(['category' => $category]);
    if ($actual !== $expected) {
        throw new RuntimeException('Résultat inattendu pour la catégorie : ' . $category);
    }
}
echo count($cases) . " cas validés." . PHP_EOL;
