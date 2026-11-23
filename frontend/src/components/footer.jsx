function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo">
            <span>⚡</span> VORTEX'LOC
          </div>
          <p>
            Location de véhicules premium. La route, à votre rythme.
          </p>
        </div>

        <div>
          <p className="footer-title">Flotte</p>
          <ul>
            <li><a href="/flotte">Citadines</a></li>
            <li><a href="/flotte">Berlines &amp; SUV</a></li>
            <li><a href="/flotte">Utilitaires</a></li>
            <li><a href="/flotte">Luxe &amp; Sport</a></li>
          </ul>
        </div>

        <div>
          <p className="footer-title">Société</p>
          <ul>
            <li><a href="#services">Nos services</a></li>
            <li><a href="#avis">Avis clients</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="/docs/">Documentation API</a></li>
            <li><a href="/flotte">Réserver</a></li>
          </ul>
        </div>

        <div>
          <p className="footer-title">Légal</p>
          <ul>
            <li><a href="#cgv">Conditions générales</a></li>
            <li><a href="#confidentialite">Politique de confidentialité</a></li>
            <li><a href="#mentions">Mentions légales</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} VORTEX'LOC. Tous droits réservés. Projet pédagogique.</p>
        <p>Conçu avec précision.</p>
      </div>
    </footer>
  )
}

export default Footer
