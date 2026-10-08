<?php

namespace App\Services;

use App\Models\User;
use InvalidArgumentException;
use RuntimeException;

class AuthService
{
    public function __construct(private User $userModel) {}

    /**
     * Inscription d'un nouvel utilisateur.
     */
    public function register(array $data): array
    {
        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = $data['password'] ?? '';
        $phone = trim((string) ($data['phone'] ?? ''));

        // Validation des champs obligatoires
        if ($firstName === '' || $lastName === '' || $email === '') {
            throw new InvalidArgumentException(
                'Veuillez remplir tous les champs obligatoires.'
            );
        }

        if (mb_strlen($firstName) > 100 || mb_strlen($lastName) > 100) {
            throw new InvalidArgumentException(
                'Le nom ou le prénom est trop long.'
            );
        }

        // Validation de l'adresse email
        if (
            mb_strlen($email) > 180 ||
            !filter_var($email, FILTER_VALIDATE_EMAIL)
        ) {
            throw new InvalidArgumentException(
                'Adresse email invalide.'
            );
        }

        // Validation du mot de passe
        if (!is_string($password) || strlen($password) < 12) {
            throw new InvalidArgumentException(
                'Le mot de passe doit contenir au moins 12 caractères.'
            );
        }

        if (strlen($password) > 1024) {
            throw new InvalidArgumentException(
                'Le mot de passe est trop long.'
            );
        }

        if (mb_strlen($phone) > 30) {
            throw new InvalidArgumentException(
                'Le numéro de téléphone est trop long.'
            );
        }

        // Vérifier si l'email existe déjà
        if ($this->userModel->findByEmail($email) !== null) {
            throw new InvalidArgumentException(
                'Cette adresse email est déjà utilisée.'
            );
        }

        // Hachage sécurisé
        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        if ($passwordHash === false) {
            throw new RuntimeException(
                'Impossible de sécuriser le mot de passe.'
            );
        }

        // Création du compte
        $userId = $this->userModel->create(
            $firstName,
            $lastName,
            $email,
            $passwordHash,
            $phone !== '' ? $phone : null
        );

        // Retourner uniquement les informations publiques
        $user = $this->userModel->findById($userId);

        if ($user === null) {
            throw new RuntimeException(
                'Impossible de récupérer le compte créé.'
            );
        }

        return $user;
    }

    /**
     * Vérifie les identifiants d'un utilisateur.
     */
    public function login(array $data): array
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = $data['password'] ?? '';

        if (
            !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            !is_string($password) ||
            $password === ''
        ) {
            throw new InvalidArgumentException(
                'Email ou mot de passe invalide.'
            );
        }

        // Recherche de l'utilisateur
        $user = $this->userModel->findByEmail($email);

        // Ne pas préciser si l'email ou le mot de passe est incorrect
        if (
            $user === null ||
            !password_verify($password, $user['password'])
        ) {
            throw new InvalidArgumentException(
                'Email ou mot de passe incorrect.'
            );
        }

        // Ne jamais retourner le mot de passe
        return [
            'id' => (int) $user['id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'role' => $user['role']
        ];
    }

    /**
     * Récupère les informations publiques d'un utilisateur.
     */
    public function getUserById(int $id): ?array
    {
        if ($id < 1) {
            return null;
        }

        return $this->userModel->findById($id);
    }
}
