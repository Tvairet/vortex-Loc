import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Footer from "../components/footer"
import Header from "../components/header"
import { apiFetch } from "../services/apiFetch"

const CATEGORIES = ["Sportive", "Citadine", "Familiale", "SUV"]
const CATEGORY_TITLES = {
  Sportive: "Sportives",
  Citadine: "Citadines",
  Familiale: "Familiales",
  SUV: "SUV",
  Autres: "Autres véhicules"
}

function motorizationRank(motorization) {
  if (motorization === "electric") return 0
  if (motorization === "thermal") return 1
  return 2
}

function VehiclePreviewCard({ vehicle }) {
  const motorization = vehicle.motorization === "electric"
    ? "100 % électrique"
    : vehicle.motorization === "thermal"
      ? "Thermique"
      : "Motorisation à préciser"

  return (
    <article className="vehicle-card">
      <div className="vehicle-image">
        {vehicle.image ? (
          <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
        ) : (
          <div className="vehicle-image-placeholder" aria-label="Photo à venir">
            <span aria-hidden="true">⚡</span>
            <strong>VORTEX'LOC</strong>
            <small>Visuel du véhicule à venir</small>
          </div>
        )}
        <span className="vehicle-category">{vehicle.category}</span>
      </div>
      <div className="vehicle-card-body">
        <p className="vehicle-motorization">{motorization}</p>
        <div className="vehicle-info">
          <div>
            <small>{vehicle.brand}</small>
            <h3>{vehicle.model}</h3>
          </div>
          <div className="vehicle-price">
            <strong>{Number(vehicle.price_per_day).toLocaleString("fr-FR")} €</strong>
            <span>/ jour</span>
          </div>
        </div>
        <div className="vehicle-specs">
          <span>👥 {vehicle.seats} places</span>
          <span>⚙️ {vehicle.transmission}</span>
          {vehicle.power && <span>Puissance : {vehicle.power}</span>}
          {vehicle.motorization === "electric" && vehicle.range_km != null && (
            <span>🔋 {vehicle.range_km} km</span>
          )}
        </div>
        <Link to={`/vehicule/${vehicle.id}`} className="vehicle-button">
          Découvrir et réserver <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

function Fleet() {
  const [vehicles, setVehicles] = useState([])
  const [category, setCategory] = useState("Tous")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function loadVehicles() {
      try {
        const response = await apiFetch("/vehicles", { signal: controller.signal })
        if (!response.ok) throw new Error("Impossible de récupérer les véhicules.")
        const result = await response.json()
        if (!controller.signal.aborted) setVehicles(Array.isArray(result) ? result : [])
      } catch (err) {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          setError(err.message || "Erreur de chargement.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadVehicles()
    return () => controller.abort()
  }, [])

  const groups = useMemo(() => {
    const hasOther = vehicles.some((vehicle) => !CATEGORIES.includes(vehicle.category))
    const categories = hasOther ? [...CATEGORIES, "Autres"] : CATEGORIES

    return categories.map((name) => {
      const items = vehicles
        .filter((vehicle) => name === "Autres"
          ? !CATEGORIES.includes(vehicle.category)
          : vehicle.category === name)
        .sort((a, b) => motorizationRank(a.motorization) - motorizationRank(b.motorization)
          || Number(a.price_per_day) - Number(b.price_per_day))
      return { name, items }
    }).filter((group) => group.items.length > 0)
  }, [vehicles])

  const visibleGroups = category === "Tous"
    ? groups
    : groups.filter((group) => group.name === category)
  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div className="fleet-page">
      <Header theme="dark" />
      <main className="fleet-content">
        <div className="fleet-header">
          <div>
            <div className="eyebrow"><span /> NOTRE FLOTTE</div>
            <h1>Trouvez votre<strong> prochaine voiture.</strong></h1>
          </div>
          <p>Sportives, citadines, familiales et SUV : choisissez le véhicule
            adapté à votre trajet. Les électriques sont présentées en premier.</p>
        </div>
        <div className="fleet-toolbar">
          <div className="fleet-filters" aria-label="Filtrer les véhicules par catégorie">
            {["Tous", ...CATEGORIES, ...(groups.some((group) => group.name === "Autres") ? ["Autres"] : [])]
              .map((item) => (
                <button key={item} type="button"
                  className={category === item ? "filter-button active" : "filter-button"}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}>
                  {item === "Tous" ? "Tous" : CATEGORY_TITLES[item]}
                </button>
              ))}
          </div>
          <span className="fleet-count">{!loading && !error && `${visibleCount} véhicule(s)`}</span>
        </div>
        {loading && <p className="fleet-message">Chargement des véhicules...</p>}
        {error && <p className="fleet-message" role="alert">Erreur : {error}</p>}
        {!loading && !error && visibleCount === 0 && (
          <p className="fleet-message">Aucun véhicule dans cette catégorie.</p>
        )}
        {!loading && !error && visibleGroups.map((group) => (
          <section key={group.name} className="fleet-group" aria-label={CATEGORY_TITLES[group.name]}>
            <div className="fleet-group-heading">
              <h2>{CATEGORY_TITLES[group.name]}</h2>
              <span>{group.items.length} véhicule(s)</span>
            </div>
            <div className="vehicle-grid">
              {group.items.map((vehicle) => <VehiclePreviewCard key={vehicle.id} vehicle={vehicle} />)}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}

export default Fleet
