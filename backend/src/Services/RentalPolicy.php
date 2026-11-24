<?php

namespace App\Services;

/**
 * Règle commerciale unique : l'API est la source de vérité.
 * Le tarif et le forfait appliqués sont sauvegardés à chaque nouvelle réservation.
 */
final class RentalPolicy
{
    public const INCLUDED_KM_PER_DAY = 100;
    public const EXTRA_KM_RATE = '0.50';

    public const PICKUP_LOCATIONS = [
        'Gare de Lyon-Part-Dieu',
        'Aéroport Lyon-Saint Exupéry',
    ];

    public static function publicTerms(): array
    {
        return [
            'pickup_locations' => self::PICKUP_LOCATIONS,
            'included_km_per_day' => self::INCLUDED_KM_PER_DAY,
            'extra_km_rate' => (float) self::EXTRA_KM_RATE
        ];
    }
}
