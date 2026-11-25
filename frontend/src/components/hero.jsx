import { Link } from "react-router-dom"
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

                    <Link to="/flotte" className="btn-primary">
                    Découvrir la flotte <span>→</span>
                    </Link>
                    <Link to="/services" className="btn-link">
                    Pourquoi nous choisir
                    </Link>
                </div>
            </div>
        </main>
)
}
export default Hero
