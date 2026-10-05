function Fleet() {
  const vehicles = [
  {
    id: 1,
    brand: "Porsche",
    model: "Taycan Turbo GT",
    category: "Électrique",
    price: 499,
    seats: 4,
    transmission: "Automatique",
    power: "1 034 ch",
    range: "556 km"
  },
  {
    id: 2,
    brand: "BMW",
    model: "M4 Competition",
    category: "Sportive",
    price: 299,
    seats: 4,
    transmission: "Automatique",
    power: "510 ch",
    range: "—"
  },
  {
    id: 3,
    brand: "Mercedes-Benz",
    model: "AMG GT",
    category: "Sportive",
    price: 399,
    seats: 2,
    transmission: "Automatique",
    power: "585 ch",
    range: "—"
  }
]

  return (
    <div className="fleet-page">

      <header className="navbar">
        <div className="logo">
          <span>⚡</span> VORTEX'LOC
        </div>

        <nav>
          <a href="/">Accueil</a>
          <a href="/flotte">Flotte</a>
          <a href="#">Services</a>
          <a href="#">À propos</a>
          <a href="#">Contact</a>
        </nav>

        <button className="btn-reserve">
          Réserver
        </button>
      </header>

      <main className="fleet-content">

        <div className="fleet-header">

          <div>
            <div className="eyebrow">
              <span></span>
              NOTRE FLOTTE
            </div>

            <h1>
              Choisissez votre
              <strong> machine.</strong>
            </h1>
          </div>

          <p>
            Des véhicules sélectionnés pour offrir
            une expérience de conduite exceptionnelle.
          </p>

        </div>

        <div className="vehicle-grid">

          {vehicles.map((vehicle) => (
            <article className="vehicle-card" key={vehicle.id}>

              <div className="vehicle-image">
                <div className="vehicle-category">
                  {vehicle.category}
                </div>
              </div>

              <div className="vehicle-info">

                <div>
                  <small>{vehicle.brand}</small>

                  <h2>{vehicle.model}</h2>
                </div>

                <div className="vehicle-price">
                  <strong>{vehicle.price} €</strong>
                  <span>/ jour</span>
                </div>

              </div>

              <a
                href={`/vehicule/${vehicle.id}`}
                className="vehicle-button"
                >
                Voir le véhicule →
              </a>

            </article>
          ))}

        </div>

      </main>

    </div>
  )
}

export default Fleet