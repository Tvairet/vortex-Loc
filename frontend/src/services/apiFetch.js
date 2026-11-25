
import { API_URL } from "../config/api"

let csrfToken = null
let csrfPromise = null

// Oublier le jeton lorsqu'une session change
export function resetCsrfToken() {
    csrfToken = null
}

export async function getCsrfToken() {
    if (csrfToken) {
        return csrfToken
    }

    // Évite plusieurs récupérations simultanées du jeton
    if (!csrfPromise) {
        csrfPromise = (async () => {
            const response = await fetch(`${API_URL}/auth/csrf`, {
                credentials: "include",
                cache: "no-store"
            })

            if (!response.ok) {
                throw new Error(
                    "Impossible de récupérer le jeton CSRF."
                )
            }

            const data = await response.json()

            if (
                typeof data.csrf_token !== "string" ||
                !data.csrf_token
            ) {
                throw new Error("Jeton CSRF invalide.")
            }

            csrfToken = data.csrf_token
            return csrfToken
        })().finally(() => {
            csrfPromise = null
        })
    }

    return csrfPromise
}

export async function apiFetch(endpoint, options = {}) {
    const { headers, ...rest } = options
    const method = (rest.method || "GET").toUpperCase()

    const requestHeaders = new Headers(headers)

    if (
        rest.body != null &&
        !(rest.body instanceof FormData) &&
        !requestHeaders.has("Content-Type")
    ) {
        requestHeaders.set("Content-Type", "application/json")
    }

    // Ajouter le jeton aux requêtes qui modifient des données
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const token = await getCsrfToken()
        requestHeaders.set("X-CSRF-Token", token)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...rest,
        credentials: "include",
        headers: requestHeaders
    })

    // Une connexion ou déconnexion peut changer la session PHP.
    // Le prochain appel protégé récupérera un nouveau jeton.
    const authEndpoints = [
        "/auth/login",
        "/auth/logout",
        "/auth/register"
    ]

    if (response.ok && authEndpoints.includes(endpoint.split("?")[0])) {
        resetCsrfToken()
    }

    return response
}
