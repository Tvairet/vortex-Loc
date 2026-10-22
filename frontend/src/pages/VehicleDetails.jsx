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
              <img
                src={vehicle.image || "/images/hero-taycan.png"}
                alt={`${vehicle.brand} ${vehicle.model}`}
              />
            </div>

            <div className="details-content">

              <span className="details-category">
                {vehicle.category}
              </span>

              <p className="details-brand">
                {vehicle.brand.toUpperCase()}
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
                  <small>AUTONOMIE</small>
                  <strong>
                    {vehicle.range_km != null
                      ? `${vehicle.range_km} km`
                      : "Non renseignée"}
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