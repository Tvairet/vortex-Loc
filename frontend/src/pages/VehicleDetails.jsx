import { useParams } from "react-router-dom";
import Header from "../components/header"
import Footer from "../components/footer"

function VehicleDetails() {
  const { id } = useParams()

  return (
    <div className="vehicle-details-page">
      <Header/>

      <main className="vehicle-details">

        <a href="/flotte" className="back-link">
          ← Retour à la flotte
        </a>

        <div className="details-grid">

          <div className="details-image">
            <img
              src="/images/hero-taycan.png"
              alt="Porsche Taycan Turbo GT"
            />
          </div>

          <div className="details-content">

            <span className="details-category">
              ÉLECTRIQUE
            </span>

            <p className="details-brand">
              PORSCHE
            </p>

            <h1>
              Taycan
              <strong> Turbo GT</strong>
            </h1>

            <p className="details-description">
              Une sportive électrique d'exception combinant
              performances, technologie et confort premium.
            </p>

            <div className="details-price">
              <strong>499 €</strong>
              <span>/ jour</span>
            </div>

            <div className="specifications">

              <div>
                <small>PUISSANCE</small>
                <strong>1 034 ch</strong>
              </div>

              <div>
                <small>AUTONOMIE</small>
                <strong>556 km</strong>
              </div>

              <div>
                <small>PLACES</small>
                <strong>4</strong>
              </div>

              <div>
                <small>BOÎTE</small>
                <strong>Automatique</strong>
              </div>

            </div>

            <button className="details-reserve">
              Réserver ce véhicule →
            </button>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}

export default VehicleDetails