import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

const services = [
  {
    title: "Conducteur supplémentaire",
    price: "8 € / jour",
    detail: "Ajoutez un conducteur, sous réserve des conditions prévues au contrat de location."
  },
  {
    title: "Pack Famille",
    price: "7 € / jour",
    detail: "Choisissez un siège bébé, un siège enfant ou un rehausseur selon les disponibilités."
  },
  {
    title: "Pack Évasion",
    price: "25 € / jour",
    detail: "Équipement de voyage ou coffre de toit, uniquement pour les véhicules compatibles."
  }
]

function Services() {
  return (
    <InformationLayout
      eyebrow="SERVICES VORTEX'LOC"
      title="Votre trajet, vos options."
      intro="Choisissez votre véhicule et personnalisez votre réservation avec les services proposés."
    >
      <section className="info-section" aria-labelledby="services-options">
        <div className="info-section-heading">
          <h2 id="services-options">Options de location</h2>
          <p>Les tarifs indiqués sont des valeurs fictives utilisées pour ce projet pédagogique.</p>
        </div>
        <div className="info-card-grid">
          {services.map((service) => (
            <article className="info-card" key={service.title}>
              <span className="info-card-tag">OPTION PAYANTE</span>
              <h3>{service.title}</h3>
              <p>{service.detail}</p>
              <strong className="info-price">{service.price}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section info-highlight" aria-labelledby="services-km">
        <div>
          <p className="info-card-tag">KILOMÉTRAGE</p>
          <h2 id="services-km">100 km inclus par jour</h2>
          <p>Le kilométrage inclus augmente avec la durée de location. Au-delà du forfait, les kilomètres supplémentaires sont facturés à 0,50 € / km au retour du véhicule.</p>
        </div>
        <Link className="info-cta" to="/flotte">Choisir mon véhicule <span aria-hidden="true">→</span></Link>
      </section>
      <p className="info-disclaimer">Projet de démonstration : tarifs, disponibilité des équipements et conditions de location non contractuels.</p>
    </InformationLayout>
  )
}

export default Services
