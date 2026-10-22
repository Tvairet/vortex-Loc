<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\User;

class StatisticsService
{
    public function __construct(
        private Reservation $reservationModel,
        private Vehicle $vehicleModel,
        private User $userModel
    ) {}

    /**
     * Rassemble les statistiques de l'administration.
     */
    public function getDashboardStatistics(): array
    {
        $fleet = $this->vehicleModel->getFleetStatistics();

        $reservations = [
            'pending' => 0,
            'confirmed' => 0,
            'cancelled' => 0,
            'rejected' => 0
        ];

        foreach (
            $this->reservationModel->getStatusStatistics()
            as $row
        ) {
            $reservations[$row['status']] = (int) $row['total'];
        }

        return [
            'vehicles' => $fleet,

            'reservations' => [
                'total' => array_sum($reservations),
                'by_status' => $reservations
            ],

            'users' => [
                'total' => $this->userModel->countAll()
            ],

            'revenue' => [
                'confirmed_total' =>
                    $this->reservationModel->getConfirmedRevenue()
            ]
        ];
    }
}
