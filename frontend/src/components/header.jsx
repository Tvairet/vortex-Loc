function Header() {
    return (<header className="navbar">
        <div className="logo">
          <span>⚡</span> VORTEX'LOC
        </div>

        <nav>
          <a href="/flotte">Flotte</a>
          <a href="#">Services</a>
          <a href="#">À propos</a>
          <a href="#">Contact</a>
        </nav>

        <button className="btn-reserve">
          Réserver
        </button>
      </header>
    )
}
export default Header