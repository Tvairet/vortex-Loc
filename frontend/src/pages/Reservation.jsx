import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import { apiFetch } from "../services/apiFetch"

const FAMILY_VARIANTS = [
  { value: "baby_seat", label: "Siège bébé" },
  { value: "child_seat", label: "Siège enfant" },
  { value: "booster_seat", label: "Rehausseur" }
]

function formatEuro(amount) {
  return Number(amount).toLocaleString("fr-FR", {
    style: "currency", currency: "EUR"
  })
}

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

  const [rentalOptions, setRentalOptions] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState("")
  const [selectedCodes, setSelectedCodes] = useState([])
  const [familyVariant, setFamilyVariant] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchVehicle() {
      setLoading(true)
      setError(null)
      setVehicle(null)
      setSelectedCodes([])
      setFamilyVariant("")

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

  // Les tarifs viennent de l'API, jamais du formulaire ni d'un prix codé en dur.
  useEffect(() => {
    const controller = new AbortController()

    async function loadOptions() {
      try {
        const response = await apiFetch("/rental-options", {
          signal: controller.signal
        })
        if (!response.ok) throw new Error("Impossible de charger les options.")
        const data = await response.json()
        if (!controller.signal.aborted) {
          setRentalOptions(Array.isArray(data.options) ? data.options : [])
        }
      } catch (err) {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          setOptionsError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) setOptionsLoading(false)
      }
    }

    loadOptions()
    return () => controller.abort()
  }, [])

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

  const vehicleSubtotal = vehicle
    ? numberOfDays * Number(vehicle.price_per_day)
    : 0

  const compatibleOptions = rentalOptions.map((option) => {
    const category = String(vehicle?.category ?? "").toLocaleLowerCase("fr-FR")
    const compatible = option.code === "family_pack"
      ? Number(vehicle?.seats) >= 4
      : option.code === "escape_pack"
        ? category.includes("suv") || category.includes("famil")
        : true

    return { ...option, compatible }
  })

  const selectedOptions = compatibleOptions.filter(
    (option) => option.compatible && selectedCodes.includes(option.code)
  )
  const optionsSubtotal = numberOfDays * selectedOptions.reduce(
    (sum, option) => sum + Number(option.unit_price), 0
  )
  const totalPrice = vehicleSubtotal + optionsSubtotal

  function toggleOption(code) {
    setSelectedCodes((previous) => previous.includes(code)
      ? previous.filter((item) => item !== code)
      : [...previous, code]
    )
    if (code === "family_pack") setFamilyVariant("")
    setReservationError("")
  }

  // Le serveur fournit la règle commerciale et enregistre le forfait
  // contractuel au moment de la demande de réservation.
  const includedKmPerDay = vehicle?.rental_terms?.included_km_per_day
  const extraKmRate = vehicle?.rental_terms?.extra_km_rate
  const includedKm = numberOfDays * (includedKmPerDay ?? 0)

  const today = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10)

  const canSubmit =
    !authLoading &&
    !submitting &&
    !optionsLoading &&
    !optionsError &&
    !!vehicle &&
    (!selectedCodes.includes("family_pack") || !!familyVariant) &&
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
          pickup_location: pickupLocation.trim(),
          options: selectedOptions.map((option) => ({
            code: option.code,
            ...(option.code === "family_pack" ? { variant: familyVariant } : {})
          }))
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

              <section className="reservation-options-preview" aria-label="Options de location">
                <h2>Options de location</h2>
                <p>Choisissez les équipements et services souhaités. Les tarifs
                  sont calculés par jour de location.</p>

                {optionsLoading && <p>Chargement des options...</p>}
                {optionsError && (
                  <p className="reservation-error" role="alert">{optionsError}</p>
                )}

                {!optionsLoading && !optionsError && compatibleOptions.map((option) => (
                  <div className="reservation-option" key={option.code}>
                    <label className="reservation-option-choice">
                      <input
                        type="checkbox"
                        checked={selectedCodes.includes(option.code)}
                        disabled={!option.compatible || submitting}
                        onChange={() => toggleOption(option.code)}
                      />
                      <span>
                        <strong>{option.name}</strong>
                        <small>{option.description}</small>
                        {!option.compatible && (
                          <small>Non proposé pour ce véhicule.</small>
                        )}
                      </span>
                      <strong className="reservation-option-price">
                        {formatEuro(option.unit_price)}/jour
                      </strong>
                    </label>
                    {option.code === "family_pack" && selectedCodes.includes("family_pack") && (
                      <div className="reservation-field reservation-family-choice">
                        <label htmlFor="family-variant">Équipement souhaité</label>
                        <select
                          id="family-variant"
                          value={familyVariant}
                          disabled={submitting}
                          required
                          onChange={(event) => {
                            setFamilyVariant(event.target.value)
                            setReservationError("")
                          }}
                        >
                          <option value="">Choisir un équipement</option>
                          {FAMILY_VARIANTS.map((variant) => (
                            <option value={variant.value} key={variant.value}>
                              {variant.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}

                <p className="reservation-options-info">
                  Conducteur supplémentaire : identité à déclarer au contrat.
                  Équipements sous réserve de compatibilité et de disponibilité ;
                  l'agence vérifie la demande avant confirmation.
                </p>
              </section>

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

              <p className="legal-form-notice">
                Cette demande est enregistrée uniquement pour la démonstration : aucune location réelle ni aucun paiement.
                Voir les <Link to="/conditions-location">conditions de location</Link> et la <Link to="/confidentialite">politique de confidentialité</Link>.
              </p>

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

                {includedKmPerDay != null && extraKmRate != null && (
                  <div className="reservation-mileage" aria-label="Forfait kilométrique">
                    <h3>Forfait kilométrique</h3>
                    <div className="reservation-price-row">
                      <span>Kilomètres inclus</span>
                      <strong>{includedKm} km ({includedKmPerDay} km/jour)</strong>
                    </div>
                    <div className="reservation-price-row">
                      <span>Au-delà du forfait</span>
                      <strong>{Number(extraKmRate).toLocaleString("fr-FR", {
                        style: "currency", currency: "EUR"
                      })} / km</strong>
                    </div>
                    <p className="reservation-km-note">
                      Le dépassement éventuel sera calculé au retour du véhicule,
                      selon le kilométrage réellement parcouru. Il n'est pas
                      compris dans le total estimé ci-dessous.
                    </p>
                  </div>
                )}

                <div className="reservation-price-row">
                  <span>Location hors options</span>
                  <strong>{formatEuro(vehicleSubtotal)}</strong>
                </div>

                {selectedOptions.map((option) => (
                  <div className="reservation-price-row" key={option.code}>
                    <span>{option.name} × {numberOfDays} jour(s)
                      {option.code === "family_pack" && familyVariant &&
                        ` · ${FAMILY_VARIANTS.find((v) => v.value === familyVariant)?.label}`}
                    </span>
                    <strong>{formatEuro(Number(option.unit_price) * numberOfDays)}</strong>
                  </div>
                ))}

                <div className="reservation-price-row">
                  <span>Sous-total options</span>
                  <strong>{formatEuro(optionsSubtotal)}</strong>
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
                  Le tarif de location et la disponibilité seront vérifiés
                  par notre serveur à l'enregistrement de la demande.
                  Les frais kilométriques éventuels sont calculés à la restitution.
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
