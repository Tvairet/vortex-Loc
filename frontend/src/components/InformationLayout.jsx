import Header from "./header"
import Footer from "./footer"

/** Mise en page commune des pages éditoriales Vortex'Loc. */
function InformationLayout({ eyebrow, title, intro, children }) {
  return (
    <div className="app info-page">
      <Header theme="dark" />
      <main className="info-main" id="main-content">
        <div className="info-intro">
          <p className="info-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default InformationLayout
