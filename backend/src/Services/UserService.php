<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    public function __construct(
        private User $userModel
    ) {}

    /**
     * Liste les utilisateurs pour l'administration.
     */
    public function getAllUsers(): array
    {
        $users = $this->userModel->findAll();

        return array_map(
            [$this, 'formatUser'],
            $users
        );
    }

    /**
     * Récupère un utilisateur par son identifiant.
     */
    public function getUserById(int $id): ?array
    {
        if ($id <= 0) {
            return null;
        }

        $user = $this->userModel->findById($id);

        return $user
            ? $this->formatUser($user)
            : null;
    }

    /**
     * Nombre total de comptes enregistrés.
     */
    public function countUsers(): int
    {
        return $this->userModel->countAll();
    }

    /**
     * Formate les informations destinées à React.
     *
     * Aucune donnée d'authentification sensible
     * n'est retournée.
     */
    private function formatUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'role' => $user['role'],
            'created_at' => $user['created_at']
        ];
    }
}
