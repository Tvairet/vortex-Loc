import Header from "../components/header"
import Footer from "../components/footer"
import Hero from "../components/hero"

function Home() {
  return (
    <div className="app">
      <Header theme="dark" />
      <Hero/>      
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

      <Footer />
    </div>
  )
}

export default Home