import { useState } from "react"

const STATUSES = [
  { value: "breakdown", label: "En panne" },
  { value: "cleaning", label: "En nettoyage" },
  { value: "maintenance", label: "En révision" },
  { value: "repair", label: "En réparation" },
  { value: "preparation", label: "En préparation" },
  { value: "out_of_service", label: "Hors service" }
]

function localToday() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10)
}

function VehicleUnavailabilityForm({ vehicleId, onSave, onCancel, saving, error }) {
  const [status, setStatus] = useState("breakdown")
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState(localToday)
  const [estimatedEndDate, setEstimatedEndDate] = useState("")
  const [validationError, setValidationError] = useState("")

  function submit(event) {
    event.preventDefault()
    if (estimatedEndDate && estimatedEndDate < startDate) {
      setValidationError("La fin prévisionnelle ne peut pas précéder le début.")
      return
    }
    setValidationError("")
    onSave({
      status,
      reason,
      start_date: startDate,
      estimated_end_date: estimatedEndDate || null
    })
  }

  return (
    <form className="admin-vehicle-editor" onSubmit={submit}>
      <h3>Nouvelle immobilisation</h3>

      <label htmlFor={`status-${vehicleId}`}>Type d'immobilisation</label>
      <select id={`status-${vehicleId}`} value={status} disabled={saving}
        onChange={(event) => setStatus(event.target.value)}>
        {STATUSES.map((item) => (
          <option value={item.value} key={item.value}>{item.label}</option>
        ))}
      </select>

      <label htmlFor={`start-${vehicleId}`}>Date de début</label>
      <input id={`start-${vehicleId}`} type="date" required value={startDate}
        disabled={saving} onChange={(event) => setStartDate(event.target.value)} />

      <label htmlFor={`end-${vehicleId}`}>Fin prévisionnelle (facultative)</label>
      <input id={`end-${vehicleId}`} type="date" value={estimatedEndDate}
        min={startDate} disabled={saving}
        onChange={(event) => setEstimatedEndDate(event.target.value)} />

      <label htmlFor={`reason-${vehicleId}`}>Motif ou commentaire</label>
      <textarea id={`reason-${vehicleId}`} rows={3} maxLength={500}
        value={reason} disabled={saving} placeholder="Ex. : réparation des freins"
        onChange={(event) => setReason(event.target.value)} />

      {(validationError || error) && (
        <p className="admin-error" role="alert">{validationError || error}</p>
      )}

      <div className="admin-reservation-actions">
        <button type="button" className="admin-modal-back"
          disabled={saving} onClick={onCancel}>Annuler</button>
        <button type="submit" className="admin-action-confirm" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer l'immobilisation"}
        </button>
      </div>
    </form>
  )
}

export default VehicleUnavailabilityForm
