import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

function Confidentialite() {
  return (
    <InformationLayout
      eyebrow="PROTECTION DES DONNÉES"
      title="Confidentialité."
      intro="Comment les données sont utilisées dans le fonctionnement actuel du projet Vortex'Loc."
    >
      <div className="legal-notice" role="note">
        <strong>Document pédagogique — obligations à finaliser</strong>
        <p>Le responsable du traitement, le fondement juridique de chaque usage, les durées de conservation et le moyen d'exercer les droits devront être formalisés avant d'accueillir des utilisateurs réels sur un site public. Ce texte décrit le fonctionnement observé dans la version de développement ; il ne vaut pas certification RGPD.</p>
      </div>

      <div className="legal-content">
        <section className="legal-panel" aria-labelledby="privacy-responsable">
          <h2 id="privacy-responsable">1. Responsable et contact</h2>
          <p><strong>Site :</strong> Vortex'Loc, projet DWWM.</p>
          <p><strong>Responsable du traitement :</strong> identification et coordonnées à compléter avant mise en ligne.</p>
          <p>Une fois un canal de contact opérationnel défini, il devra permettre les demandes portant sur les données personnelles. Voir <Link to="/contact">Contact</Link>.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-donnees">
          <h2 id="privacy-donnees">2. Données utilisées</h2>
          <ul>
            <li><strong>Compte :</strong> prénom, nom, adresse e-mail, téléphone facultatif, rôle et mot de passe stocké sous forme de hachage, non en clair.</li>
            <li><strong>Réservation :</strong> véhicule, dates, lieu de retrait, coordonnées associées au compte, prix calculé, options choisies, statut et, le cas échéant, kilométrage relevé lors du départ ou du retour.</li>
            <li><strong>Technique :</strong> identifiant de session et jeton de protection CSRF pour la connexion et la sécurité des formulaires.</li>
          </ul>
          <p>Aucune donnée de carte bancaire n'est demandée par ce projet.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-finalites">
          <h2 id="privacy-finalites">3. Utilisations des données</h2>
          <p>Les informations servent à créer et retrouver les comptes, authentifier les utilisateurs, gérer les réservations simulées, présenter l'historique et permettre la gestion par un administrateur autorisé. Les sessions et jetons contribuent à la sécurité du site.</p>
          <p>Le projet n'intègre pas de fonctionnalité de prospection publicitaire ni de paiement en ligne.</p>
          <p><strong>Bases juridiques :</strong> à déterminer et à documenter pour chaque traitement avant ouverture à de vrais utilisateurs. Le simple affichage de cette page ne constitue pas un consentement.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-acces">
          <h2 id="privacy-acces">4. Accès et hébergement</h2>
          <p>Les informations sont utilisées par l'application et peuvent être consultées par les utilisateurs habilités, notamment l'administrateur pour la gestion des réservations. Les données sont actuellement stockées dans la base locale du projet.</p>
          <p>En cas d'hébergement public, il faudra identifier le prestataire, ses conditions de traitement et les éventuels transferts hors de l'Espace économique européen avant d'affirmer quoi que ce soit à leur sujet.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-duree">
          <h2 id="privacy-duree">5. Durée de conservation</h2>
          <p>La version actuelle conserve les comptes et l'historique des réservations dans MySQL. <strong>Aucun mécanisme automatique de purge n'a été validé à ce stade.</strong> Des durées ou critères de conservation adaptés aux finalités doivent être fixés et implémentés avant toute exploitation publique avec des données réelles.</p>
          <p>Pour les démonstrations, il est recommandé d'utiliser des identités et coordonnées fictives, puis de supprimer les données de test qui ne sont plus nécessaires.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-cookies">
          <h2 id="privacy-cookies">6. Cookies et traceurs</h2>
          <p>Le backend utilise un cookie de session destiné à l'authentification. Le projet ne prévoit pas, dans sa version actuelle, de traçage publicitaire. Les cookies strictement nécessaires au fonctionnement ou à la sécurité ne nécessitent généralement pas le même recueil de consentement que les traceurs publicitaires.</p>
          <p>Tout ajout ultérieur de statistiques, publicité ou services tiers nécessitera un nouveau contrôle des traceurs et des obligations correspondantes.</p>
        </section>

        <section className="legal-panel" aria-labelledby="privacy-droits">
          <h2 id="privacy-droits">7. Vos droits</h2>
          <p>Selon la situation et le fondement juridique du traitement, les personnes peuvent disposer de droits d'accès, de rectification, d'effacement, de limitation et d'opposition, ainsi que d'un droit à la portabilité lorsque ses conditions sont remplies. Elles peuvent aussi adresser une réclamation à la CNIL.</p>
          <p>Le projet doit encore définir le contact responsable et la procédure de traitement de ces demandes avant sa publication. Il ne faut pas interpréter l'espace « Mon compte » comme une procédure complète d'exercice de ces droits.</p>
          <p>Informations générales : <a href="https://www.cnil.fr/fr/respecter-les-droits-des-personnes" target="_blank" rel="noopener noreferrer">CNIL — Respecter les droits des personnes</a>.</p>
        </section>
      </div>
    </InformationLayout>
  )
}

export default Confidentialite
