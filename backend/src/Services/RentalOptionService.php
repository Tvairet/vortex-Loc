<?php

namespace App\Services;

use App\Models\RentalOption;
use InvalidArgumentException;

/** Regles metier des options. Aucun tarif ne provient du navigateur. */
class RentalOptionService
{
    private const CODES = ['additional_driver', 'family_pack', 'escape_pack'];
    private const FAMILY_VARIANTS = ['baby_seat', 'child_seat', 'booster_seat'];

    public function __construct(private RentalOption $optionModel) {}

    public function listAvailable(): array
    {
        return $this->optionModel->findEnabled();
    }

    /**
     * Cree des lignes de facturation figees depuis le catalogue MySQL.
     * Doit etre appele a l'interieur de la transaction de reservation.
     */
    public function priceSelection(mixed $requested, array $vehicle, int $days): array
    {
        if (!is_array($requested) || !array_is_list($requested) || count($requested) > 3) {
            throw new InvalidArgumentException('Selection des options invalide.');
        }

        $seen = [];
        $priced = [];

        foreach ($requested as $item) {
            if (!is_array($item) || array_is_list($item) || !is_string($item['code'] ?? null)) {
                throw new InvalidArgumentException('Option invalide.');
            }

            if (array_diff(array_keys($item), ['code', 'variant']) !== []) {
                throw new InvalidArgumentException('Champs non autorises dans les options.');
            }

            $code = $item['code'];
            if (!in_array($code, self::CODES, true) || isset($seen[$code])) {
                throw new InvalidArgumentException('Option inconnue ou selectionnee plusieurs fois.');
            }
            $seen[$code] = true;

            $variant = $item['variant'] ?? null;
            if ($code === 'family_pack') {
                if (!is_string($variant) || !in_array($variant, self::FAMILY_VARIANTS, true)) {
                    throw new InvalidArgumentException('Choisissez un equipement pour le Pack Famille.');
                }
                if ((int) $vehicle['seats'] < 4) {
                    throw new InvalidArgumentException('Pack Famille indisponible pour ce vehicule.');
                }
            } elseif ($variant !== null) {
                throw new InvalidArgumentException('Variante non autorisee pour cette option.');
            }

            if ($code === 'escape_pack' && !self::isEscapeCompatible($vehicle)) {
                throw new InvalidArgumentException('Pack Evasion reserve aux SUV et voitures familiales.');
            }

            $option = $this->optionModel->findEnabledByCode($code);
            if ($option === null || $option['pricing_unit'] !== 'per_day') {
                throw new InvalidArgumentException('Une option selectionnee est indisponible.');
            }

            // Prix decimal MySQL vers centimes pour eviter les erreurs de calcul.
            $centsPerDay = (int) round((float) $option['unit_price'] * 100);
            if ($centsPerDay < 0) {
                throw new InvalidArgumentException('Tarif de location invalide.');
            }

            $priced[] = [
                'option_id' => (int) $option['id'],
                'code' => $code,
                'name' => $option['name'],
                'variant' => $variant,
                'pricing_unit' => 'per_day',
                'unit_price' => number_format($centsPerDay / 100, 2, '.', ''),
                'line_total' => number_format(($centsPerDay * $days) / 100, 2, '.', ''),
                'line_total_cents' => $centsPerDay * $days
            ];
        }
        return $priced;
    }

    public static function isEscapeCompatible(array $vehicle): bool
    {
        $category = mb_strtolower((string) ($vehicle['category'] ?? ''), 'UTF-8');
        return str_contains($category, 'suv') || str_contains($category, 'famil');
    }
}
