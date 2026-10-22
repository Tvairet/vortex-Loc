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
     *
     * Inclut le mot de passe haché pour permettre
     * la vérification lors de la connexion.
     * Ne jamais retourner ce résultat directement à React.
     */
    public function findByEmail(string $email): ?array
    {
        $statement = $this->db->prepare("
            SELECT *
            FROM users
            WHERE email = :email
            LIMIT 1
        ");

        $statement->execute([
            'email' => $email
        ]);

        return $statement->fetch() ?: null;
    }

    /**
     * Recherche un utilisateur par son identifiant.
     * Sans le mot de passe.
     */
    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare("
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                created_at
            FROM users
            WHERE id = :id
            LIMIT 1
        ");

        $statement->execute([
            'id' => $id
        ]);

        return $statement->fetch() ?: null;
    }

    /**
     * Liste les utilisateurs pour l'administration.
     *
     * Les mots de passe ne sont jamais récupérés.
     */
    public function findAll(): array
    {
        $statement = $this->db->query("
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                created_at
            FROM users
            ORDER BY created_at DESC, id DESC
        ");

        return $statement->fetchAll();
    }

    /**
     * Compte les utilisateurs enregistrés.
     */
    public function countAll(): int
    {
        $statement = $this->db->query("
            SELECT COUNT(*)
            FROM users
        ");

        return (int) $statement->fetchColumn();
    }

    /**
     * Crée un utilisateur.
     * Le mot de passe doit être haché au préalable.
     */
    public function create(
        string $firstName,
        string $lastName,
        string $email,
        string $passwordHash,
        ?string $phone = null
    ): int {
        $statement = $this->db->prepare("
            INSERT INTO users (
                first_name,
                last_name,
                email,
                password,
                phone,
                role
            ) VALUES (
                :first_name,
                :last_name,
                :email,
                :password,
                :phone,
                'user'
            )
        ");

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
