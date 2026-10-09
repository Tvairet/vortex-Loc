import { useEffect, useState } from "react"

const API_URL = "http://localhost/vortex-loc/backend/public/api"

const LABELS = {
  breakdown: "En panne",
  cleaning: "En nettoyage",
  maintenance: "En révision",
  repair: "En réparation",
  preparation: "En préparation",
  out_of_service: "Hors service"
}

function formatDate(value) {
  if (!value) return "Non renseignée"
  const [year, month, day] = value.slice(0, 10).split("-")
  return `${day}/${month}/${year}`
}

function VehicleHistory({ vehicleId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    async function fetchHistory() {
      try {
        const response = await fetch(
          `${API_URL}/admin/vehicles/${vehicleId}/unavailability`,
          { credentials: "include", signal: controller.signal }
        )
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Historique indisponible.")
        if (!controller.signal.aborted) setHistory(data.unavailability ?? [])
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || "Erreur de chargement.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchHistory()
    return () => controller.abort()
  }, [vehicleId])

  return (
    <section className="admin-vehicle-history">
      <h3>Historique des immobilisations</h3>
      {loading && <p>Chargement...</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {!loading && !error && history.length === 0 && (
        <p>Aucune immobilisation enregistrée.</p>
      )}
      {!loading && !error && history.map((item) => (
        <div className="admin-vehicle-history-item" key={item.id}>
          <strong>{LABELS[item.status] ?? item.status}</strong>
          <p>Début : {formatDate(item.start_date)}</p>
          <p>Fin prévisionnelle : {item.estimated_end_date
            ? formatDate(item.estimated_end_date)
            : "Inconnue"}</p>
          {item.reason && <p>Motif : {item.reason}</p>}
          <p>{item.resolved_at
            ? `Remise en service validée le ${formatDate(item.resolved_at)}`
            : "Remise en service non validée"}</p>
        </div>
      ))}
    </section>
  )
}

export default VehicleHistory
