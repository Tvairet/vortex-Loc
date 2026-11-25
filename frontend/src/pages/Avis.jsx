import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

function Avis() {
  return (
    <InformationLayout
      eyebrow="AVIS CLIENTS"
      title="Vos expériences comptent."
      intro="Cette rubrique est prévue pour présenter les retours des utilisateurs de Vortex'Loc."
    >
      <section className="info-section info-empty-state" aria-labelledby="avis-etat">
        <span className="info-card-tag">PROJET PÉDAGOGIQUE</span>
        <h2 id="avis-etat">Aucun avis publié pour le moment</h2>
        <p>Le système de collecte et de modération des avis n'est pas encore développé. Nous préférons ne pas afficher de faux témoignages ou de notes inventées.</p>
        <Link className="info-cta" to="/flotte">Découvrir la flotte <span aria-hidden="true">→</span></Link>
      </section>
    </InformationLayout>
  )
}

export default Avis
