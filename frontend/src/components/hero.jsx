function Hero() {
    return (
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
)
}
export default Hero