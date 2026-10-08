
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Header({ theme = "dark" }) {
  const { user, loading, logout } = useAuth()
  const [error, setError] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    setError("")
    setLoggingOut(true)

    try {
      await logout()
      navigate("/login")
    } catch {
      setError("Impossible de se déconnecter.")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className={`navbar navbar-${theme}`}>
      <Link to="/" className="logo">
        <span>⚡</span> VORTEX'LOC
      </Link>

      <nav>
        <Link to="/flotte">Flotte</Link>
        <Link to="/services">Services</Link>
        <Link to="/avis">Avis</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className="navbar-account">
        {!loading && (
          user ? (
            <>
              <span className="navbar-welcome">
                Bonjour {user.first_name}
              </span>

              <Link to="/compte" className="navbar-account-link">
                Mon compte
              </Link>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Déconnexion..." : "Déconnexion"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login">
                Connexion
              </Link>

              <Link to="/register" className="btn-reserve">
                S'inscrire
              </Link>
            </>
          )
        )}

        {error && (
          <span className="navbar-auth-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </header>
  )
}

export default Header
