function UserCard({ user }) {
  const fullName = `${user.first_name} ${user.last_name}`.trim()

  const date = user.created_at
    ? new Date(user.created_at.replace(" ", "T"))
        .toLocaleDateString("fr-FR")
    : "Non renseignée"

  return (
    <article className="admin-reservation-card">
      <div className="admin-reservation-heading">
        <div>
          <span className="admin-reservation-id">
            UTILISATEUR #{user.id}
          </span>
          <h2>{fullName}</h2>
        </div>

        <span className="admin-vehicle-status">
          {user.role === "admin" ? "Administrateur" : "Client"}
        </span>
      </div>

      <div className="admin-reservation-details">
        <div>
          <span>EMAIL</span>
          <strong>{user.email}</strong>
        </div>

        <div>
          <span>TÉLÉPHONE</span>
          <strong>{user.phone || "Non renseigné"}</strong>
        </div>

        <div>
          <span>INSCRIPTION</span>
          <strong>{date}</strong>
        </div>
      </div>
    </article>
  )
}

export default UserCard
