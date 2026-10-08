import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleChange(event) {
    const { name, value } = event.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (form.password.length < 12) {
      setError("Le mot de passe doit contenir au moins 12 caractères.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "http://localhost/vortex-loc/backend/public/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            password: form.password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription.")
      }

      setSuccess("Compte créé avec succès ! Redirection vers la connexion...")

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      })

      // L'utilisateur peut maintenant se connecter.
      navigate("/login", {
        state: { message: "Votre compte a été créé. Connectez-vous." }
      })

    } catch (err) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Header theme="dark" />

      <main className="register-content">

        <div className="register-heading">
          <span className="register-eyebrow">
            REJOIGNEZ VORTEX'LOC
          </span>

          <h1>
            Créez votre <span>compte.</span>
          </h1>

          <p>
            Inscrivez-vous pour réserver nos véhicules
            et profiter de votre espace personnel.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>

          <h2>Vos informations</h2>

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="register-success" role="status">
              {success}
            </p>
          )}

          <div className="register-fields">

            <div className="register-field">
              <label htmlFor="first_name">Prénom *</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                maxLength={100}
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="last_name">Nom *</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                maxLength={100}
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field register-field-full">
              <label htmlFor="email">Adresse email *</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={180}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field register-field-full">
              <label htmlFor="phone">Téléphone (facultatif)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Mot de passe *</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirmation *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <p className="register-password-help">
            Utilisez un mot de passe d'au moins 12 caractères.
          </p>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte →"}
          </button>

          <p className="register-login-link">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>

        </form>
      </main>

      <Footer />
    </div>
  )
}
export default Register
