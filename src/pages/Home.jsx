import Header from "../components/header"

function Home() {
  return (
    <div className="app">
      <Header/>

      <main className="hero">
        <div className="hero-content">

          <div className="eyebrow">
            <span></span>
            LOCATION DE VÉHICULES PREMIUM
          </div>

          <h1>
            La route
            <br />
            <strong>n'attend</strong>
            <br />
            <strong>que vous.</strong>
          </h1>

          <p>
            Une flotte rigoureusement sélectionnée, une réservation
            en quelques clics. Prenez le volant, on s'occupe du reste.
          </p>

          <div className="hero-actions">

            <a href="/flotte" className="btn-primary">
              Découvrir la flotte <span>→</span>
            </a>

            <a href="#about" className="btn-link">
              Pourquoi nous choisir
            </a>

          </div>

        </div>
      </main>

      <section className="search-bar">

        <div className="search-field">
          <small>📍 LIEU DE PRISE EN CHARGE</small>
          <span>Paris — Gare de Lyon</span>
        </div>

        <div className="search-field">
          <small>▣ DÉPART</small>
          <span>jj/mm/aaaa</span>
        </div>

        <div className="search-field">
          <small>▣ RETOUR</small>
          <span>jj/mm/aaaa</span>
        </div>

        <div className="search-field">
          <small>TYPE DE VÉHICULE</small>
          <span>Tous⌄</span>
        </div>

        <button className="search-button">
          🔍 Rechercher
        </button>

      </section>

    </div>
  )
}

export default Home