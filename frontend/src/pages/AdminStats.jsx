import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import StatCard from "../components/admin/StatCard"
import { apiFetch } from "../services/apiFetch"
import "../styles/pages/admin-stats.css"

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR")

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  })

function AdminStats() {
  const { user, loading } = useAuth()

  const [stats, setStats] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "admin") {
      setFetching(false)
      return
    }

    const controller = new AbortController()

    async function loadStats() {
      setFetching(true)
      setError("")

      try {
        const response = await apiFetch("/admin/stats", {
          signal: controller.signal
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || "Impossible de charger les statistiques."
          )
        }

        if (!controller.signal.aborted) {
          setStats(data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Erreur de chargement.")
        }
      } finally {
        if (!controller.signal.aborted) {
          setFetching(false)
        }
      }
    }

    loadStats()

    return () => controller.abort()
  }, [loading, user?.id, user?.role])

  if (loading) return <p>Vérification de la session...</p>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/compte" replace />

  const reservations = stats?.reservations?.by_status

  return (
    <div className="admin-page">
      <Header theme="dark" />

      <main className="admin-content">
        <Link to="/admin" className="admin-back">
          ← Retour au tableau de bord
        </Link>

        <div className="admin-heading">
          <span className="admin-eyebrow">
            VORTEX'LOC / STATISTIQUES
          </span>

          <h1>
            Statistiques<span>.</span>
          </h1>

          <p>
            Suivez l'activité de la flotte et les
            réservations de Vortex'Loc.
          </p>
        </div>

        {fetching && <p>Chargement des statistiques...</p>}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {!fetching && !error && stats && (
          <>
            <div className="admin-stats-grid">
              <StatCard
                icon="🚘"
                label="Véhicules"
                value={formatNumber(stats.vehicles.total)}
                detail={`${stats.vehicles.available} en service · ${stats.vehicles.unavailable} indisponible(s)`}
              />

              <StatCard
                icon="📅"
                label="Réservations"
                value={formatNumber(stats.reservations.total)}
                detail={`${reservations.confirmed} confirmée(s) · ${reservations.pending} en attente`}
              />

              <StatCard
                icon="👥"
                label="Utilisateurs"
                value={formatNumber(stats.users.total)}
                detail="Comptes enregistrés"
              />

              <StatCard
                icon="💶"
                label="Montant des réservations confirmées"
                value={formatMoney(stats.revenue.confirmed_total)}
                detail="Montant réservé, non nécessairement encaissé"
              />
            </div>

            <section className="admin-stats-section">
              <h2>Répartition des réservations</h2>

              <div className="admin-stats-grid">
                <StatCard
                  label="En attente"
                  value={formatNumber(reservations.pending)}
                />

                <StatCard
                  label="Confirmées"
                  value={formatNumber(reservations.confirmed)}
                />

                <StatCard
                  label="Annulées"
                  value={formatNumber(reservations.cancelled)}
                />

                <StatCard
                  label="Refusées"
                  value={formatNumber(reservations.rejected)}
                />
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminStats
