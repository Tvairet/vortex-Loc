
import { useState } from "react"
import VehicleUnavailabilityForm from "./VehicleUnavailabilityForm"
import VehicleHistory from "./VehicleHistory"

const LABELS = {
  available: "Disponible",
  breakdown: "En panne",
  cleaning: "En nettoyage",
  maintenance: "En révision",
  repair: "En réparation",
  preparation: "En préparation",
  out_of_service: "Hors service"
}

function VehicleCard({
  vehicle,
  busy,
  onEdit,
  onImmobilize,
  onRestore,
  actionError
}) {
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const isAvailable =
    vehicle.vehicle_status === "available" &&
    vehicle.available

  return (
    <article className="admin-reservation-card">

      <div className="admin-reservation-heading">
        <div>
          <span className="admin-reservation-id">
            VÉHICULE #{vehicle.id}
          </span>

          <h2>
            {vehicle.brand} {vehicle.model}
          </h2>
        </div>

        <span className="admin-vehicle-status">
          {LABELS[vehicle.vehicle_status] ?? vehicle.vehicle_status}
        </span>
      </div>

      <div className="admin-reservation-details">
        <div>
          <span>CATÉGORIE</span>
          <strong>{vehicle.category}</strong>
        </div>

        <div>
          <span>PRIX PAR JOUR</span>
          <strong>
            {Number(vehicle.price_per_day).toLocaleString(
              "fr-FR",
              {
                style: "currency",
                currency: "EUR"
              }
            )}
          </strong>
        </div>

        <div>
          <span>ÉTAT ACTUEL</span>
          <strong>
            {isAvailable
              ? "En service"
              : "Immobilisé / indisponible"}
          </strong>
        </div>
      </div>

      {vehicle.status_reason && (
        <p className="admin-vehicle-reason">
          Motif : {vehicle.status_reason}
        </p>
      )}

      {/* FORMULAIRE D'IMMOBILISATION */}

      {showForm && isAvailable && (
        <VehicleUnavailabilityForm
          vehicleId={vehicle.id}
          saving={busy}
          error={actionError}
          onCancel={() => setShowForm(false)}
          onSave={async (data) => {
            const succeeded = await onImmobilize(
              vehicle.id,
              data
            )

            if (succeeded) {
              setShowForm(false)
            }
          }}
        />
      )}

      {/* ACTIONS SUR LE VÉHICULE */}

      {!showForm && (
        <div className="admin-reservation-actions">

          <button
            type="button"
            className="admin-modal-back"
            disabled={busy}
            onClick={() => onEdit(vehicle)}
          >
            Modifier le véhicule
          </button>

          {isAvailable ? (
            <button
              type="button"
              className="admin-action-confirm"
              disabled={busy}
              onClick={() => setShowForm(true)}
            >
              Immobiliser le véhicule
            </button>
          ) : (
            <button
              type="button"
              className="admin-action-confirm"
              disabled={busy}
              onClick={() => onRestore(vehicle.id)}
            >
              {busy
                ? "Traitement..."
                : "Remettre en service"}
            </button>
          )}

        </div>
      )}

      {/* ERREURS */}

      {!showForm && actionError && (
        <p className="admin-error" role="alert">
          {actionError}
        </p>
      )}

      {/* HISTORIQUE */}

      <div className="admin-reservation-actions">
        <button
          type="button"
          className="admin-modal-back"
          onClick={() => setShowHistory((value) => !value)}
        >
          {showHistory
            ? "Masquer l'historique"
            : "Voir l'historique"}
        </button>
      </div>

      {showHistory && (
        <VehicleHistory vehicleId={vehicle.id} />
      )}

    </article>
  )
}

export default VehicleCard
