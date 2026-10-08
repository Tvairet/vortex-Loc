import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import { useAuth } from "../context/AuthContext"

function Login() {
    const { refreshUser } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: "",
        password: ""
    })

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function handleChange(event) {
        const { name, value } = event.target

        setForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }


    async function handleSubmit(event) {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            const response = await fetch(
                "http://localhost/vortex-loc/backend/public/api/auth/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || "Email ou mot de passe incorrect."
                )
            }

            // Connexion réussie
            // Le cookie de session est géré par PHP.
            await refreshUser()
            navigate("/")

        } catch (err) {
            setError(
                err.message || "Impossible de se connecter."
            )
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="login-page">
            <Header theme="dark" />

            <main className="login-content">

                <div className="login-heading">
                    <span className="login-eyebrow">
                        VOTRE ESPACE VORTEX'LOC
                    </span>

                    <h1>
                        Bon <span>retour.</span>
                    </h1>

                    <p>
                        Connectez-vous pour gérer vos réservations
                        et retrouver votre espace personnel.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Connexion</h2>

                    {location.state?.message && (
                        <p className="login-success" role="status">
                            {location.state.message}
                        </p>
                    )}

                    {error && (
                        <p className="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="login-field">
                        <label htmlFor="login-email">
                            Adresse email
                        </label>

                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="votre@email.fr"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">
                            Mot de passe
                        </label>

                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Votre mot de passe"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading ? "Connexion..." : "Se connecter →"}
                    </button>

                    <p className="login-register-link">
                        Pas encore de compte ?
                        {" "}
                        <Link to="/register">
                            Créer un compte
                        </Link>
                    </p>
                </form>

            </main>

            <Footer />
        </div>
    )
}
export default Login