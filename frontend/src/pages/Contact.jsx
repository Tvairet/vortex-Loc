import { useState } from "react"
import { Link } from "react-router-dom"
import InformationLayout from "../components/InformationLayout"

// Adresse volontairement non inventée : à définir dans frontend/.env avant publication.
const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL || "").trim()

function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(event) {
    event.preventDefault()
    if (!contactEmail) return

    const body = `Nom : ${name}\nAdresse de réponse : ${email}\n\n${message}`
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(`[Vortex'Loc] ${subject}`)}&body=${encodeURIComponent(body)}`
    // Aucun envoi via le serveur : le visiteur confirme l'envoi depuis son logiciel de messagerie.
    window.location.href = mailto
  }

  return (
    <InformationLayout
      eyebrow="CONTACT"
      title="Parlons de votre trajet."
      intro="Besoin d'une précision sur nos véhicules ou les options de location ? Retrouvez ici le moyen de nous contacter."
    >
      <div className="info-contact-grid">
        <section className="info-card" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Envoyer un message</h2>
          {!contactEmail ? (
            <div className="info-notice" role="status">
              <strong>Contact en préparation</strong>
              <p>L'adresse de contact n'a pas encore été définie pour ce projet pédagogique. Le formulaire sera activé après sa configuration, avant la mise en ligne.</p>
            </div>
          ) : (
            <form className="info-form" onSubmit={handleSubmit}>
              <div className="info-form-row">
                <label htmlFor="contact-name">Nom
                  <input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} autoComplete="name" required />
                </label>
                <label htmlFor="contact-email">E-mail
                  <input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={180} autoComplete="email" required />
                </label>
              </div>
              <label htmlFor="contact-subject">Objet
                <input id="contact-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required />
              </label>
              <label htmlFor="contact-message">Votre message
                <textarea id="contact-message" rows={6} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} required />
              </label>
              <p className="info-form-note">Le bouton ouvre votre application de messagerie. Aucun message n'est automatiquement envoyé ni enregistré par Vortex'Loc.</p>
              <button className="info-cta" type="submit">Préparer mon e-mail <span aria-hidden="true">→</span></button>
            </form>
          )}
        </section>
        <aside className="info-card info-contact-aside">
          <span className="info-card-tag">INFORMATION</span>
          <h2>Vortex'Loc, projet de démonstration</h2>
          <p>Ce site présente un service fictif de location de véhicules dans le cadre d'un projet de formation.</p>
          {contactEmail && <p>Adresse de contact : <a className="info-text-link" href={`mailto:${contactEmail}`}>{contactEmail}</a></p>}
          <Link className="info-text-link" to="/services">Consulter les services →</Link>
          <Link className="info-text-link" to="/flotte">Voir les véhicules →</Link>
        </aside>
      </div>
    </InformationLayout>
  )
}

export default Contact
