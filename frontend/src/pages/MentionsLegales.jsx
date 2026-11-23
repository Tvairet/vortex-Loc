import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

function MentionsLegales() {
  return (
    <InformationLayout
      eyebrow="INFORMATIONS LÉGALES"
      title="Mentions légales."
      intro="Informations sur l'édition du site Vortex'Loc et sur son caractère pédagogique."
    >
      <div className="legal-notice" role="note">
        <strong>Projet pédagogique — document à compléter avant publication publique</strong>
        <p>Vortex'Loc est une application de démonstration, et non une société de location de véhicules. Les informations d'identification de l'éditeur et d'hébergement ne sont pas encore renseignées.</p>
      </div>

      <div className="legal-content">
        <section className="legal-panel" aria-labelledby="legal-editeur">
          <h2 id="legal-editeur">1. Édition du site</h2>
          <p><strong>Nom du site :</strong> Vortex'Loc.</p>
          <p><strong>Nature :</strong> projet de formation au développement web et web mobile (DWWM), à visée pédagogique.</p>
          <p><strong>Responsable de publication et moyen de contact :</strong> à identifier avant toute publication accessible au public. Aucune identité, adresse ou entreprise fictive n'est présentée comme réelle.</p>
          <p><Link to="/contact">Consulter la page Contact</Link>.</p>
        </section>

        <section className="legal-panel" aria-labelledby="legal-hebergeur">
          <h2 id="legal-hebergeur">2. Hébergement</h2>
          <p>Le site est actuellement développé et testé en environnement local (XAMPP / Vite). Les coordonnées de l'hébergeur de la version publique devront être ajoutées après le choix définitif de l'hébergement.</p>
          <p><strong>Hébergeur, adresse et coordonnées :</strong> à compléter avant publication.</p>
        </section>

        <section className="legal-panel" aria-labelledby="legal-demo">
          <h2 id="legal-demo">3. Caractère fictif du service</h2>
          <p>Les véhicules, disponibilités, montants, options et demandes de réservation servent à démontrer les fonctionnalités de l'application. Aucune location réelle n'est conclue et aucun paiement en ligne n'est traité dans la version présentée.</p>
          <p>Les tarifs sont inventés à des fins pédagogiques et ne reflètent pas les tarifs du marché. Les visuels sont illustratifs et peuvent différer des véhicules réels.</p>
          <p>Pour les règles de la simulation, consulter les <Link to="/conditions-location">conditions de location de démonstration</Link>.</p>
        </section>

        <section className="legal-panel" aria-labelledby="legal-propriete">
          <h2 id="legal-propriete">4. Contenus et propriété intellectuelle</h2>
          <p>Le code, les textes, les visuels et les éléments graphiques du site constituent les éléments de présentation du projet. Les marques et noms de modèles automobiles cités appartiennent à leurs titulaires respectifs. Vortex'Loc n'affirme aucun partenariat ni aucune affiliation avec ces constructeurs.</p>
          <p>Les visuels de véhicules réalisés pour la démonstration ne sont pas des photographies officielles de constructeur.</p>
        </section>

        <section className="legal-panel" aria-labelledby="legal-donnees">
          <h2 id="legal-donnees">5. Données personnelles</h2>
          <p>Le site propose la création de comptes et l'enregistrement de réservations de démonstration. Pour connaître les catégories de données utilisées et les points restant à définir, consultez la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
        </section>
      </div>
    </InformationLayout>
  )
}

export default MentionsLegales
