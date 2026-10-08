
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"

function Account() {
  const { user, loading } = useAuth()

  // Attendre la vérification de la session PHP
  if (loading) {
    return (
      <div className="account-page">
        <Header theme="dark" />
        <main className="account-content">
          <p>Chargement de votre compte...</p>
        </main>
      </div>
    )
  }

  // Rediriger les visiteurs non connectés
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="account-page">
      <Header theme="dark" />

      <main className="account-content">

        <div className="account-heading">
          <span className="account-eyebrow">
            ESPACE CLIENT VORTEX'LOC
          </span>

          <h1>
            Bonjour, <span>{user.first_name}.</span>
          </h1>

          <p>
            Retrouvez vos informations personnelles et
            gérez vos réservations depuis votre espace.
          </p>
        </div>

        <div className="account-grid">

          <section className="account-card">
            <div className="account-card-header">
              <h2>Mes informations</h2>
              <span className="account-card-icon">👤</span>
            </div>

            <div className="account-information">
              <div>
                <span>PRÉNOM</span>
                <strong>{user.first_name}</strong>
              </div>

              <div>
                <span>NOM</span>
                <strong>{user.last_name}</strong>
              </div>

              <div>
                <span>EMAIL</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>TÉLÉPHONE</span>
                <strong>{user.phone || "Non renseigné"}</strong>
              </div>
            </div>
          </section>

          <section className="account-card">
            <div className="account-card-header">
              <h2>Mes réservations</h2>
              <span className="account-card-icon">📅</span>
            </div>

            <div className="account-empty">
              <p>
                L'historique de vos réservations
                sera bientôt disponible ici.
              </p>

              <Link to="/flotte" className="account-button">
                Découvrir notre flotte →
              </Link>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  )
}

export default Account
