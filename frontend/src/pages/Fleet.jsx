
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Footer from "../components/footer"
import Header from "../components/header"

const categories = [
  "Tous",
  "Électrique",
  "Sportive",
  "Citadine",
  "Berline",
  "SUV",
  "Luxe",
  "Utilitaire"
]

function Fleet() {
  const [vehicles, setVehicles] = useState([])
  const [category, setCategory] = useState("Tous")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchVehicles() {
      try {
        const response = await fetch(
          "http://localhost/vortex-loc/backend/public/api/vehicles",
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error("Impossible de récupérer les véhicules.")
        }

        const data = await response.json()
        setVehicles(data)
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

    fetchVehicles()

    return () => controller.abort()
  }, [])

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      category === "Tous" || vehicle.category === category
  )

  return (
    <div className="fleet-page">
      <Header theme="light" />
      <main className="fleet-content">
        <div className="fleet-header">
          <div>
            <div className="eyebrow">
              <span></span>
              NOTRE FLOTTE
            </div>
            <h1>
              Trouvez votre
              <strong> prochaine voiture.</strong>
            </h1>
          </div>
          <p>
            Citadines, sportives ou véhicules électriques :
            découvrez notre sélection et prenez la route
            avec Vortex'Loc.
          </p>
        </div>
        <div className="fleet-toolbar">
          <div className="fleet-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="fleet-count">
            {!loading && !error && (
              <>
                {filteredVehicles.length} véhicule(s)
              </>
            )}
          </span>
        </div>
        {loading && (
          <p className="fleet-message">
            Chargement des véhicules...
          </p>
        )}
        {error && (
          <p className="fleet-message" role="alert">
            Erreur : {error}
          </p>
        )}
        {!loading && !error && filteredVehicles.length === 0 && (
          <p className="fleet-message">
            Aucun véhicule disponible dans cette catégorie.
          </p>
        )}
        {!loading && !error && (
          <div className="vehicle-grid">
            {filteredVehicles.map((vehicle) => (
              <article className="vehicle-card" key={vehicle.id}>
                <div className="vehicle-image">
                  {vehicle.image && (
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      loading="lazy"
                    />
                  )}
                  <span className="vehicle-category">
                    {vehicle.category}
                  </span>
                </div>
                <div className="vehicle-card-body">
                  <div className="vehicle-info">
                    <div>
                      <small>{vehicle.brand}</small>
                      <h2>{vehicle.model}</h2>
                    </div>
                    <div className="vehicle-price">
                      <strong>
                        {Number(vehicle.price_per_day).toLocaleString("fr-FR")} €
                      </strong>
                      <span>/ jour</span>
                    </div>
                  </div>
                  <div className="vehicle-specs">
                    <span>👥 {vehicle.seats} places</span>
                    <span>⚙️ {vehicle.transmission}</span>
                    <span>⚡ {vehicle.power || "Non renseigné"}</span>
                    {vehicle.range_km !== null && (
                      <span>🔋 {vehicle.range_km} km</span>
                    )}
                  </div>
                  <Link
                    to={`/vehicule/${vehicle.id}`}
                    className="vehicle-button"
                  >
                    Découvrir et réserver
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
export default Fleet
