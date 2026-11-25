import { useEffect, useId, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Header({ theme = "dark" }) {
  const { user, loading, logout } = useAuth()
  const [error, setError] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const toggleRef = useRef(null)
  const navigate = useNavigate()

  function closeMenu() {
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    // Fermer automatiquement si l'écran repasse au format ordinateur.
    const desktopQuery = window.matchMedia("(min-width: 1201px)")
    function onDesktopChange(event) {
      if (event.matches) setMenuOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    desktopQuery.addEventListener("change", onDesktopChange)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      desktopQuery.removeEventListener("change", onDesktopChange)
    }
  }, [menuOpen])

  async function handleLogout() {
    setError("")
    setLoggingOut(true)

    try {
      await logout()
      closeMenu()
      navigate("/login")
    } catch {
      setError("Impossible de se déconnecter.")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className={`navbar navbar-${theme}`}>
      <Link to="/" className="logo" onClick={closeMenu}>
        <span aria-hidden="true">⚡</span> VORTEX'LOC
      </Link>

      <button
        ref={toggleRef}
        type="button"
        className={`navbar-menu-toggle${menuOpen ? " is-open" : ""}`}
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="navbar-menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>


      <div className={`navbar-panel${menuOpen ? " is-open" : ""}`} id={menuId}>
        <nav className="navbar-links" aria-label="Navigation principale">
          <Link to="/flotte" onClick={closeMenu}>Flotte</Link>
          <Link to="/services" onClick={closeMenu}>Services</Link>
          <Link to="/avis" onClick={closeMenu}>Avis</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </nav>

        <div className="navbar-account">
          {!loading && (
            user ? (
              <>
                <span className="navbar-welcome">Bonjour {user.first_name}</span>

                {user.role === "admin" && (
                  <Link to="/admin" className="navbar-admin-link" onClick={closeMenu}>
                    ⚙ Administration
                  </Link>
                )}

                <Link to="/compte" className="navbar-account-link" onClick={closeMenu}>
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
                <Link to="/login" className="navbar-login" onClick={closeMenu}>
                  Connexion
                </Link>
                <Link to="/register" className="btn-reserve" onClick={closeMenu}>
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
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar-menu-backdrop"
          aria-label="Fermer le menu mobile"
          tabIndex={-1}
          onClick={() => {
            closeMenu()
            toggleRef.current?.focus()
          }}
        />
      )}
    </header>
  )
}

export default Header
