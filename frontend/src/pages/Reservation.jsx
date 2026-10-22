import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import { apiFetch } from "../services/apiFetch"

function Reservation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [reservationError, setReservationError] = useState("")

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

  // Calcul du nombre de jours
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

  const canSubmit =
    !authLoading &&
    !submitting &&
    !!vehicle &&
    numberOfDays >= 1 &&
    startDate >= today &&
    pickupLocation.trim().length > 0 &&
    pickupLocation.trim().length <= 150

  // Envoyer la réservation à PHP
  async function handleSubmit(event) {
    event.preventDefault()
    setReservationError("")

    if (!canSubmit) return

    if (!user) {
      navigate("/login", {
        state: {
          message: "Connectez-vous pour réserver votre véhicule.",
          from: `/reservation/${id}`
        }
      })
      return
    }

    setSubmitting(true)

    try {

      const response = await apiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: Number(id),
          start_date: startDate,
          end_date: endDate,
          pickup_location: pickupLocation.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Votre session a expiré. Reconnectez-vous avant de réserver."
          )
        }

        throw new Error(
          data.message || "Impossible d'enregistrer votre réservation."
        )
      }

      navigate("/compte", {
        state: {
          reservationSuccess: true,
          reservationId: data.reservation?.id
        }
      })

    } catch (err) {
      setReservationError(
        err.message || "Une erreur est survenue."
      )
    } finally {
      setSubmitting(false)
    }
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
                      setReservationError("")
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
                    onChange={(event) => {
                      setEndDate(event.target.value)
                      setReservationError("")
                    }}
                    required
                  />
                </div>

                <div className="reservation-field">
                  <label htmlFor="pickup-location">
                    Lieu de retrait
                  </label>

                  <input
                    id="pickup-location"
                    name="pickup_location"
                    type="text"
                    placeholder="Ex. Lyon Part-Dieu"
                    maxLength={150}
                    value={pickupLocation}
                    onChange={(event) => {
                      setPickupLocation(event.target.value)
                      setReservationError("")
                    }}
                    required
                  />
                </div>

              </div>

              {startDate && endDate && numberOfDays === 0 && (
                <p className="reservation-error" role="alert">
                  La date de retour doit être après
                  la date de départ.
                </p>
              )}

              {!authLoading && !user && (
                <p className="reservation-info">
                  Vous devrez vous connecter avant
                  de confirmer votre réservation.
                </p>
              )}

              {reservationError && (
                <p className="reservation-error" role="alert">
                  {reservationError}
                </p>
              )}

              <button
                type="submit"
                className="reservation-submit"
                disabled={!canSubmit}
              >
                {submitting
                  ? "Enregistrement en cours..."
                  : user
                    ? "Confirmer la réservation →"
                    : "Se connecter pour réserver →"}
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
                    {totalPrice.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} €
                  </strong>
                </div>

                <p className="reservation-note">
                  Le tarif est indicatif. Le prix définitif
                  et la disponibilité seront vérifiés
                  par notre serveur lors de la confirmation.
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
