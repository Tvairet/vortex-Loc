import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo" aria-label="Vortex'Loc — Accueil"><span aria-hidden="true">⚡</span> VORTEX'LOC</Link>
          <p>Location de véhicules dans le cadre d'un projet pédagogique.</p>
        </div>
        <div>
          <p className="footer-title">Véhicules</p>
          <ul>
            <li><Link to="/flotte">Toute la flotte</Link></li>
            <li><Link to="/services">Options de location</Link></li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Informations</p>
          <ul>
            <li><Link to="/services">Nos services</Link></li>
            <li><Link to="/avis">Avis clients</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href="/docs/">Documentation API</a></li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Légal</p>
          <ul>
            <li><Link to="/mentions-legales">Mentions légales</Link></li>
            <li><Link to="/confidentialite">Confidentialité</Link></li>
            <li><Link to="/conditions-location">Conditions de location</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} VORTEX'LOC. Tous droits réservés. Projet pédagogique.</p>
        <p>Tarifs et visuels illustratifs.</p>
      </div>
    </footer>
  )
}
export default Footer
