
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react"

const AuthContext = createContext(null)

const API_URL =
    "http://localhost/vortex-loc/backend/public/api/auth"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    async function refreshUser() {
        try {
            const response = await fetch(`${API_URL}/me`, {
                credentials: "include"
            })

            if (!response.ok) {
                setUser(null)
                return
            }

            const data = await response.json()
            setUser(data.user)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    async function logout() {
        const response = await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include"
        })

        if (!response.ok) {
            throw new Error("Impossible de se déconnecter.")
        }

        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, refreshUser, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth doit être utilisé dans AuthProvider")
    }

    return context
}
