<?php

namespace App\Controllers;

use App\Core\Response;
use App\Services\RentalOptionService;
use Throwable;

class RentalOptionController
{
    public function __construct(private RentalOptionService $optionService) {}

    /** GET /api/rental-options - catalogue public, prix fixes par MySQL */
    public function index(): void
    {
        try {
            Response::json(['options' => $this->optionService->listAvailable()]);
        } catch (Throwable $error) {
            error_log($error->getMessage());
            Response::json(['message' => 'Impossible de charger les options.'], 500);
        }
    }
}
