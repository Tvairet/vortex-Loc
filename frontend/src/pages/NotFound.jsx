import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

function NotFound() {
  return (
    <InformationLayout eyebrow="ERREUR 404" title="Cette route n'existe pas."
      intro="La page demandée n'a pas été trouvée sur Vortex'Loc.">
      <section className="info-section info-empty-state">
        <p>Revenez à l'accueil ou découvrez nos véhicules.</p>
        <div className="info-actions">
          <Link className="info-cta" to="/">Retour à l'accueil <span aria-hidden="true">→</span></Link>
          <Link className="info-outline-link" to="/flotte">Voir la flotte</Link>
        </div>
      </section>
    </InformationLayout>
  )
}

export default NotFound
