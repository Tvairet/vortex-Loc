import { Link } from "react-router-dom"

function AdminCard({
  icon,
  title,
  description,
  path,
  available = true
}) {
  return (
    <section className="admin-card">
      <span className="admin-card-icon" aria-hidden="true">
        {icon}
      </span>

      <h2>{title}</h2>

      <p>{description}</p>

      {available ? (
        <Link
          to={path}
          className="admin-card-link"
        >
          Accéder à la gestion →
        </Link>
      ) : (
        <span className="admin-coming-soon">
          À développer
        </span>
      )}
    </section>
  )
}

export default AdminCard
