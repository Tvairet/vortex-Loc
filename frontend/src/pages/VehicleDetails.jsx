import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import { apiFetch } from "../services/apiFetch"

function VehicleDetails() {
  const { id } = useParams()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchVehicle() {
      setLoading(true)
      setError(null)
      setVehicle(null)

      try {
        const response = await apiFetch(`/vehicles/${id}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Ce véhicule est introuvable.")
          }

          throw new Error("Impossible de charger ce véhicule.")
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setVehicle(data)
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchVehicle()

    return () => controller.abort()
  }, [id])

  return (
    <div className="vehicle-details-page">
      <Header theme="dark" />

      <main className="vehicle-details">

        <Link to="/flotte" className="back-link">
          ← Retour à la flotte
        </Link>

        {loading && (
          <p>Chargement du véhicule...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && vehicle && (
          <div className="details-grid">

            <div className="details-image">
              {vehicle.image ? (
                <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
              ) : (
                <div className="details-image-placeholder">
                  <span aria-hidden="true">⚡</span>
                  <strong>VORTEX'LOC</strong>
                  <p>Visuel du véhicule à venir</p>
                </div>
              )}
            </div>

            <div className="details-content">

              <span className="details-category">
                {vehicle.category}
              </span>

              <p className="details-brand">
                {vehicle.brand.toUpperCase()}
                {" · "}
                {vehicle.motorization === "electric"
                  ? "100 % électrique"
                  : vehicle.motorization === "thermal"
                    ? "Thermique"
                    : "Motorisation à préciser"}
              </p>

              <h1>{vehicle.model}</h1>

              <p className="details-description">
                {vehicle.description || "Découvrez ce véhicule de notre flotte."}
              </p>

              <div className="details-price">
                <strong>
                  {Number(vehicle.price_per_day).toLocaleString("fr-FR")} €
                </strong>
                <span>/ jour</span>
              </div>

              <div className="specifications">

                <div>
                  <small>PUISSANCE</small>
                  <strong>{vehicle.power || "Non renseignée"}</strong>
                </div>

                <div>
                  <small>{vehicle.motorization === "electric" ? "AUTONOMIE" : "MOTORISATION"}</small>
                  <strong>
                    {vehicle.motorization === "electric"
                      ? vehicle.range_km != null ? `${vehicle.range_km} km` : "Non renseignée"
                      : vehicle.motorization === "thermal" ? "Thermique" : "À préciser"}
                  </strong>
                </div>

                <div>
                  <small>PLACES</small>
                  <strong>{vehicle.seats}</strong>
                </div>

                <div>
                  <small>BOÎTE</small>
                  <strong>{vehicle.transmission}</strong>
                </div>

              </div>

              {vehicle.rental_terms && (
                <p className="details-kilometers">
                  <strong>{vehicle.rental_terms.included_km_per_day} km/jour inclus</strong>
                  {" · "}
                  {Number(vehicle.rental_terms.extra_km_rate).toLocaleString("fr-FR", {
                    style: "currency", currency: "EUR"
                  })} par km supplémentaire au retour
                </p>
              )}

              <Link
                to={`/reservation/${vehicle.id}`}
                className="details-reserve"
              >
                Réserver ce véhicule →
              </Link>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
export default VehicleDetails