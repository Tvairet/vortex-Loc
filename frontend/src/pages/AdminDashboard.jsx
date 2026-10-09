
import { useEffect, useState } from "react"
import { Navigate, Link } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import AdminCard from "../components/admin/AdminCard"

const API_URL =
    "http://localhost/vortex-loc/backend/public/api"

const ADMIN_SECTIONS = [
    {
        icon: "🚘",
        title: "Véhicules",
        description:
            "Ajouter, modifier et gérer les immobilisations de la flotte.",
        path: "/admin/vehicles"
    },
    {
        icon: "📅",
        title: "Réservations",
        description:
            "Consulter, confirmer ou refuser les réservations.",
        path: "/admin/reservations"
    },
    {
        icon: "👥",
        title: "Utilisateurs",
        description:
            "Consulter les comptes clients et administrateurs.",
        path: "/admin/users"
    },
    {
        icon: "📊",
        title: "Statistiques",
        description:
            "Visualiser les performances de Vortex'Loc.",
        path: "/admin/stats",
        available: false
    }
]

function AdminDashboard() {
    const { user, loading } = useAuth()

    const [authorized, setAuthorized] = useState(false)
    const [checking, setChecking] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (loading) return

        if (!user || user.role !== "admin") {
            setChecking(false)
            return
        }

        const controller = new AbortController()

        async function checkAdminAccess() {
            setChecking(true)
            setAuthorized(false)
            setError("")

            try {
                const response = await fetch(
                    `${API_URL}/admin/dashboard`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                )

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "Accès administrateur refusé."
                            : "Impossible de charger le tableau de bord."
                    )
                }

                if (!controller.signal.aborted) {
                    setAuthorized(true)
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err.message || "Erreur de connexion."
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setChecking(false)
                }
            }
        }

        checkAdminAccess()

        return () => controller.abort()
    }, [loading, user?.id, user?.role])

    if (loading) {
        return <p>Vérification de votre session...</p>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== "admin") {
        return <Navigate to="/compte" replace />
    }

    return (
        <div className="admin-page">
            <Header theme="dark" />

            <main className="admin-content">
                <div className="admin-heading">
                    <span className="admin-eyebrow">
                        VORTEX'LOC / ADMINISTRATION
                    </span>

                    <h1>
                        Tableau de <span>bord.</span>
                    </h1>

                    <p>
                        Bienvenue {user.first_name}. Gérez les
                        véhicules, les réservations et les clients.
                    </p>
                </div>

                {checking && (
                    <p>Vérification des droits administrateur...</p>
                )}

                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}

                {!checking && authorized && (
                    <div className="admin-grid">
                        {ADMIN_SECTIONS.map((section) => (
                            <AdminCard
                                key={section.title}
                                {...section}
                            />
                        ))}
                    </div>
                )}

                <Link to="/compte" className="admin-back">
                    ← Retour à mon compte
                </Link>
            </main>

            <Footer />
        </div>
    )
}

export default AdminDashboard
