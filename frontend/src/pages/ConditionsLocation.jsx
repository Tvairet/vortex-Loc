import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

function ConditionsLocation() {
  return (
    <InformationLayout
      eyebrow="CONDITIONS DE DÉMONSTRATION"
      title="Conditions de location."
      intro="Règles de fonctionnement de la simulation de réservation Vortex'Loc, sans location ni paiement réels."
    >
      <div className="legal-notice" role="note">
        <strong>Conditions fictives — sans valeur de contrat commercial</strong>
        <p>Vortex'Loc n'est pas un loueur automobile réel. Cette page documente les règles mises en œuvre dans l'application pédagogique. Elle ne constitue pas des CGV prêtes à être utilisées pour une vraie activité.</p>
      </div>

      <div className="legal-content">
        <section className="legal-panel" aria-labelledby="conditions-objet">
          <h2 id="conditions-objet">1. Objet</h2>
          <p>La plateforme permet de parcourir un catalogue fictif, de créer un compte et de déposer une demande de réservation dans une base de démonstration. L'enregistrement de cette demande ne garantit aucune mise à disposition physique d'un véhicule.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-etapes">
          <h2 id="conditions-etapes">2. Demande et disponibilité</h2>
          <p>L'utilisateur choisit un véhicule, un lieu de retrait, une date de départ et une date de retour, puis éventuellement des options. Une demande créée apparaît d'abord avec le statut « En attente ». L'administrateur peut la confirmer ou la refuser selon les vérifications prévues dans l'application.</p>
          <p>La disponibilité est contrôlée à partir des périodes déjà réservées et des immobilisations connues. Une date prévisionnelle de remise en service ne remplace pas la validation manuelle de l'administrateur.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-prix">
          <h2 id="conditions-prix">3. Tarifs fictifs</h2>
          <p>Le tarif prévisionnel est calculé en fonction du prix journalier du véhicule, de la durée sélectionnée et des options choisies. Les tarifs sont entièrement fictifs et servent exclusivement au projet pédagogique.</p>
          <p>Aucun paiement, débit, caution ou contrat de location réel n'est réalisé par ce site.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-options">
          <h2 id="conditions-options">4. Options proposées</h2>
          <ul>
            <li><strong>Conducteur supplémentaire :</strong> 8 € fictifs par jour ; le conducteur serait à déclarer dans un véritable contrat.</li>
            <li><strong>Pack Famille :</strong> 7 € fictifs par jour ; choix d'un siège bébé, siège enfant ou rehausseur.</li>
            <li><strong>Pack Évasion :</strong> 25 € fictifs par jour ; uniquement pour les véhicules compatibles.</li>
          </ul>
          <p>Ces prestations sont présentées pour démontrer la sélection d'options, leur compatibilité et le calcul du total.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-km">
          <h2 id="conditions-km">5. Kilométrage</h2>
          <p>Le forfait simulé inclut 100 km par jour de location. Les kilomètres supplémentaires sont valorisés à 0,50 € fictif par kilomètre. Le supplément éventuel est déterminé à partir des relevés kilométriques de départ et de retour lorsqu'ils sont renseignés dans l'application.</p>
          <p>Ces montants ne représentent pas une facturation réelle.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-annulation">
          <h2 id="conditions-annulation">6. Annulation et historique</h2>
          <p>L'utilisateur peut consulter ses demandes depuis « Mon compte » et demander l'annulation lorsque les règles de statut et de date définies par l'application le permettent. Les demandes et modifications apparaissent dans l'historique de démonstration.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-limites">
          <h2 id="conditions-limites">7. Limites du service</h2>
          <p>Le projet ne définit pas les conditions nécessaires à une location commerciale réelle : vérification du permis, âge du conducteur, assurances, franchise, dépôt de garantie, état des lieux contractuel, modes de paiement, règles de restitution ou modalités de médiation.</p>
          <p>Les photographies et visuels des voitures sont illustratifs. Ils ne constituent pas une garantie sur les caractéristiques précises d'un véhicule disponible.</p>
          <p>En cas de transformation en activité commerciale, de véritables CGV devront être rédigées et validées en tenant compte du droit applicable et du parcours de commande.</p>
        </section>

        <section className="legal-panel" aria-labelledby="conditions-info">
          <h2 id="conditions-info">8. Informations complémentaires</h2>
          <p>Pour les informations sur l'éditeur, consulter les <Link to="/mentions-legales">mentions légales</Link>. Pour les données enregistrées avec les comptes et réservations, consulter la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
        </section>
      </div>
    </InformationLayout>
  )
}

export default ConditionsLocation
