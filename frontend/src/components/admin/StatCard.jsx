function StatCard({ label, value, detail, icon }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-heading">
        <span className="admin-stat-label">
          {label}
        </span>

        {icon && (
          <span className="admin-stat-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <strong className="admin-stat-value">
        {value}
      </strong>

      {detail && (
        <p className="admin-stat-detail">
          {detail}
        </p>
      )}
    </article>
  )
}

export default StatCard
