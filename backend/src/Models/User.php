<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class User
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    /**
     * Recherche un utilisateur par son email.
     */
    public function findByEmail(string $email): ?array
    {
        $sql = "
            SELECT *
            FROM users
            WHERE email = :email
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'email' => $email
        ]);

        $user = $statement->fetch();

        return $user ?: null;
    }

    /**
     * Recherche un utilisateur par son ID.
     */
    public function findById(int $id): ?array
    {
        $sql = "
            SELECT id, first_name, last_name, email,
                   phone, role, created_at
            FROM users
            WHERE id = :id
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'id' => $id
        ]);

        $user = $statement->fetch();

        return $user ?: null;
    }

    /**
     * Crée un nouvel utilisateur.
     * Le mot de passe reçu doit déjà être haché.
     */
    public function create(
        string $firstName,
        string $lastName,
        string $email,
        string $passwordHash,
        ?string $phone = null
    ): int {
        $sql = "
            INSERT INTO users
                (first_name, last_name, email, password, phone, role)
            VALUES
                (:first_name, :last_name, :email, :password, :phone, 'user')
        ";

        $statement = $this->db->prepare($sql);

        $statement->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $passwordHash,
            'phone' => $phone
        ]);

        return (int) $this->db->lastInsertId();
    }
}
