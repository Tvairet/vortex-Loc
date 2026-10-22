import { useEffect, useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import UserCard from "../components/admin/UserCard"
import "../styles/pages/admin-users.css"
import { apiFetch } from "../services/apiFetch"

function AdminUsers() {
  const { user, loading } = useAuth()

  const [users, setUsers] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "admin") {
      setFetching(false)
      return
    }

    const controller = new AbortController()

    async function loadUsers() {
      setFetching(true)
      setError("")

      try {
        const response = await apiFetch("/admin/users", {
          signal: controller.signal
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || "Impossible de charger les utilisateurs."
          )
        }

        if (!controller.signal.aborted) {
          setUsers(data.users ?? [])
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.message || "Une erreur est survenue."
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setFetching(false)
        }
      }
    }

    loadUsers()

    return () => controller.abort()
  }, [loading, user?.id, user?.role])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr-FR")

    return users.filter((account) => {
      const fullName = `${account.first_name} ${account.last_name}`
      const searchableText =
        `${fullName} ${account.email}`.toLocaleLowerCase("fr-FR")

      const matchesSearch =
        !query || searchableText.includes(query)

      const matchesRole =
        roleFilter === "all" || account.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  if (loading) {
    return <p>Chargement...</p>
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
        <Link to="/admin" className="admin-back">
          ← Retour au tableau de bord
        </Link>

        <div className="admin-heading">
          <h1>Gestion des utilisateurs</h1>
          <p>
            Consultez les comptes clients et administrateurs
            de Vortex'Loc.
          </p>
        </div>

        <div className="admin-users-filters">
          <div>
            <label htmlFor="user-search">
              Rechercher un utilisateur
            </label>

            <input
              id="user-search"
              type="search"
              placeholder="Nom, prénom ou email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="user-role">
              Filtrer par rôle
            </label>

            <select
              id="user-role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">Tous les comptes</option>
              <option value="user">Clients</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>

        {fetching && <p>Chargement des utilisateurs...</p>}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {!fetching && !error && (
          <>
            <p className="admin-reservations-count">
              {filteredUsers.length} utilisateur(s) affiché(s)
              {" "}sur {users.length}
            </p>

            {filteredUsers.length === 0 ? (
              <p>Aucun utilisateur ne correspond à la recherche.</p>
            ) : (
              <div className="admin-reservations-list">
                {filteredUsers.map((account) => (
                  <UserCard
                    key={account.id}
                    user={account}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminUsers
