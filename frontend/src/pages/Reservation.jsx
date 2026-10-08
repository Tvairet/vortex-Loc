import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"

function Reservation() {
  const { id } = useParams()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchVehicle() {
      setLoading(true)
      setError(null)
      setVehicle(null)

      try {
        const response = await fetch(
          `http://localhost/vortex-loc/backend/public/api/vehicles/${id}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Véhicule introuvable."
              : "Impossible de charger le véhicule."
          )
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setVehicle(data)
        }
      } catch (err) {
        if (err.name !== "AbortError") {
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

  // Calcul du nombre de jours entre deux dates
  function calculateDays(start, end) {
    if (!start || !end) return 0

    const startTime = Date.parse(`${start}T00:00:00Z`)
    const endTime = Date.parse(`${end}T00:00:00Z`)

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return 0
    }

    const difference = (endTime - startTime) / 86400000

    return difference > 0 ? difference : 0
  }

  const numberOfDays = calculateDays(startDate, endDate)

  const totalPrice = vehicle
    ? numberOfDays * Number(vehicle.price_per_day)
    : 0

  const today = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10)

  function handleSubmit(event) {
    event.preventDefault()

    if (!vehicle || numberOfDays < 1) return

    // La réservation sera enregistrée dans MySQL
    // lors de la prochaine étape.
  }

  return (
    <div className="reservation-page">
      <Header theme="dark" />

      <main className="reservation-content">

        <Link
          to={`/vehicule/${id}`}
          className="reservation-back"
        >
          ← Retour au véhicule
        </Link>

        <div className="reservation-heading">
          <h1>
            Réserver votre <span>véhicule.</span>
          </h1>

          <p>
            Choisissez vos dates et découvrez
            instantanément le tarif de votre location.
          </p>
        </div>

        {loading && <p>Chargement du véhicule...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && vehicle && (
          <div className="reservation-grid">

            <form
              className="reservation-form"
              onSubmit={handleSubmit}
            >
              <h2>Vos dates de location</h2>

              <div className="reservation-fields">

                <div className="reservation-field">
                  <label htmlFor="start-date">
                    Date de départ
                  </label>

                  <input
                    id="start-date"
                    name="start_date"
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value)
                      setEndDate("")
                    }}
                    required
                  />
                </div>

                <div className="reservation-field">
                  <label htmlFor="end-date">
                    Date de retour
                  </label>

                  <input
                    id="end-date"
                    name="end_date"
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    required
                  />
                </div>

              </div>

              {startDate && endDate && numberOfDays === 0 && (
                <p className="reservation-error">
                  La date de retour doit être après
                  la date de départ.
                </p>
              )}

              <button
                type="submit"
                className="reservation-submit"
                disabled={numberOfDays < 1}
              >
                Continuer la réservation →
              </button>
            </form>

            <aside className="reservation-summary">

              {vehicle.image && (
                <img
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="reservation-vehicle-image"
                />
              )}

              <div className="reservation-summary-body">
                <span className="reservation-label">
                  VOTRE VÉHICULE
                </span>

                <h2>
                  {vehicle.brand} {vehicle.model}
                </h2>

                <p>{vehicle.category}</p>

                <div className="reservation-price-row">
                  <span>Prix par jour</span>
                  <strong>
                    {Number(vehicle.price_per_day).toLocaleString("fr-FR")} €
                  </strong>
                </div>

                <div className="reservation-price-row">
                  <span>Durée</span>
                  <strong>
                    {numberOfDays} jour(s)
                  </strong>
                </div>

                <div className="reservation-total">
                  <span>TOTAL ESTIMÉ</span>
                  <strong>
                    {totalPrice.toLocaleString("fr-FR")} €
                  </strong>
                </div>

                <p className="reservation-note">
                  Le tarif est indicatif. La disponibilité
                  du véhicule sera vérifiée lors
                  de la confirmation.
                </p>
              </div>
            </aside>

          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
export default Reservation