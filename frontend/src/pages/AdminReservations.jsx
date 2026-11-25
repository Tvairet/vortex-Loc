
import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import { apiFetch } from "../services/apiFetch"

function AdminReservations() {
    const { user, loading } = useAuth()

    // Liste des réservations
    const [reservations, setReservations] = useState([])
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState("")

    // Gestion des actions administrateur
    const [reservationToUpdate, setReservationToUpdate] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [actionError, setActionError] = useState("")
    const [actionSuccess, setActionSuccess] = useState("")

    /*
    ==========================================
    CHARGEMENT DES RÉSERVATIONS
    ==========================================
    */

    useEffect(() => {
        if (loading) return

        if (!user || user.role !== "admin") {
            setFetching(false)
            return
        }

        const controller = new AbortController()

        async function loadReservations() {
            setFetching(true)
            setError("")

            try {
                const response = await apiFetch("/admin/reservations", {
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "Accès administrateur refusé."
                            : "Impossible de charger les réservations."
                    )
                }

                const data = await response.json()

                if (!controller.signal.aborted) {
                    setReservations(data.reservations ?? [])
                }

            } catch (err) {
                if (
                    err.name !== "AbortError" &&
                    !controller.signal.aborted
                ) {
                    setError(err.message || "Erreur de chargement.")
                }
            } finally {
                if (!controller.signal.aborted) {
                    setFetching(false)
                }
            }
        }

        loadReservations()

        return () => controller.abort()
    }, [loading, user?.id, user?.role])

    /*
    ==========================================
    FORMATAGE
    ==========================================
    */

    function formatDate(dateString) {
        if (!dateString) return "—"

        const [year, month, day] =
            dateString.slice(0, 10).split("-")

        return `${day}/${month}/${year}`
    }

    function formatPrice(price) {
        return Number(price).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        })
    }

    function getStatusLabel(status) {
        const labels = {
            pending: "En attente",
            confirmed: "Confirmée",
            cancelled: "Annulée",
            rejected: "Refusée"
        }

        return labels[status] || status
    }

    /*
    ==========================================
    OUVERTURE DE LA MODALE
    ==========================================
    */

    function openActionModal(reservation, action) {
        if (updating || reservation.status !== "pending") {
            return
        }

        setActionError("")
        setActionSuccess("")
        setReservationToUpdate({ reservation, action })
    }

    function closeActionModal() {
        if (updating) return

        setReservationToUpdate(null)
        setActionError("")
    }

    /*
    ==========================================
    CONFIRMATION / REFUS
    ==========================================
    */

    async function handleUpdateReservation() {
        if (!reservationToUpdate || updating) return

        const { reservation, action } = reservationToUpdate

        setUpdating(true)
        setActionError("")
        setActionSuccess("")

        try {
            const response = await apiFetch(
                `/admin/reservations/${reservation.id}/${action}`,
                {
                    method: "PATCH"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible de modifier la réservation."
                )
            }

            // Utiliser le statut renvoyé par PHP
            const newStatus = data.status

            if (!newStatus) {
                throw new Error(
                    "Le serveur n'a pas retourné de statut."
                )
            }

            // Mettre à jour la liste sans recharger
            setReservations((previous) =>
                previous.map((item) =>
                    Number(item.id) === Number(reservation.id)
                        ? { ...item, status: newStatus }
                        : item
                )
            )

            setActionSuccess(
                action === "confirm"
                    ? `La réservation #${reservation.id} a été confirmée.`
                    : `La réservation #${reservation.id} a été refusée.`
            )

            // Fermer la modale uniquement en cas de réussite
            setReservationToUpdate(null)

        } catch (err) {
            setActionError(
                err.message || "Une erreur est survenue."
            )
        } finally {
            setUpdating(false)
        }
    }

    /*
    ==========================================
    PROTECTION DE LA PAGE
    ==========================================
    */

    if (loading) {
        return (
            <div className="admin-page">
                <Header theme="dark" />
                <main className="admin-content">
                    <p>Vérification de votre session...</p>
                </main>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== "admin") {
        return <Navigate to="/compte" replace />
    }

    /*
    ==========================================
    AFFICHAGE
    ==========================================
    */

    return (
        <div className="admin-page">
            <Header theme="dark" />

            <main className="admin-content">

                {/* RETOUR */}

                <Link to="/admin" className="admin-back">
                    ← Retour au tableau de bord
                </Link>

                {/* TITRE */}

                <div className="admin-heading">
                    <span className="admin-eyebrow">
                        VORTEX'LOC / ADMINISTRATION
                    </span>

                    <h1>
                        Gestion des <span>réservations.</span>
                    </h1>

                    <p>
                        Consultez les demandes de location,
                        confirmez ou refusez les réservations
                        de vos clients.
                    </p>
                </div>

                {/* CHARGEMENT */}

                {fetching && (
                    <p>Chargement des réservations...</p>
                )}

                {/* ERREUR DE CHARGEMENT */}

                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}

                {/* MESSAGE APRÈS CONFIRMATION OU REFUS */}

                {actionSuccess && (
                    <p
                        className="admin-action-success"
                        role="status"
                    >
                        ✓ {actionSuccess}
                    </p>
                )}

                {/* LISTE DES RÉSERVATIONS */}

                {!fetching && !error && (
                    <>
                        <p className="admin-reservations-count">
                            {reservations.length} réservation(s)
                        </p>

                        {reservations.length === 0 ? (
                            <p>Aucune réservation enregistrée.</p>
                        ) : (
                            <div className="admin-reservations-list">

                                {reservations.map((reservation) => (
                                    <article
                                        key={reservation.id}
                                        className="admin-reservation-card"
                                    >

                                        {/* VÉHICULE ET STATUT */}

                                        <div className="admin-reservation-heading">
                                            <div>
                                                <span className="admin-reservation-id">
                                                    RÉSERVATION #{reservation.id}
                                                </span>

                                                <h2>
                                                    {reservation.brand}{" "}
                                                    {reservation.model}
                                                </h2>
                                            </div>

                                            <span
                                                className={
                                                    `account-status account-status-${reservation.status}`
                                                }
                                            >
                                                {getStatusLabel(reservation.status)}
                                            </span>
                                        </div>

                                        {/* INFORMATIONS */}

                                        <div className="admin-reservation-details">

                                            <div>
                                                <span>CLIENT</span>
                                                <strong>
                                                    {reservation.customer_name}
                                                </strong>
                                                <p>
                                                    {reservation.customer_email}
                                                </p>
                                            </div>

                                            <div>
                                                <span>DÉPART</span>
                                                <strong>
                                                    {formatDate(reservation.start_date)}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>RETOUR</span>
                                                <strong>
                                                    {formatDate(reservation.end_date)}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>LIEU DE RETRAIT</span>
                                                <strong>
                                                    {reservation.pickup_location}
                                                </strong>
                                            </div>

                                            {reservation.included_km != null && (
                                                <div>
                                                    <span>FORFAIT KILOMÉTRIQUE</span>
                                                    <strong>{Number(reservation.included_km)} km inclus</strong>
                                                </div>
                                            )}
                                            {Array.isArray(reservation.options) && reservation.options.length > 0 && (
                                                <div>
                                                    <span>OPTIONS CHOISIES</span>
                                                    {reservation.options.map((option) => (
                                                        <p key={option.code}>
                                                            {option.name}{option.variant === "baby_seat" ? " · Siège bébé" : option.variant === "child_seat" ? " · Siège enfant" : option.variant === "booster_seat" ? " · Rehausseur" : ""}
                                                            {" — "}{formatPrice(option.line_total)}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            <div>
                                                <span>MONTANT</span>
                                                <strong>
                                                    {formatPrice(reservation.total_price)}
                                                </strong>
                                            </div>

                                        </div>

                                        {/* ACTIONS DISPONIBLES UNIQUEMENT
                        POUR LES RÉSERVATIONS EN ATTENTE */}

                                        {reservation.status === "pending" && (
                                            <div className="admin-reservation-actions">

                                                <button
                                                    type="button"
                                                    className="admin-action-confirm"
                                                    disabled={updating}
                                                    onClick={() =>
                                                        openActionModal(
                                                            reservation,
                                                            "confirm"
                                                        )
                                                    }
                                                >
                                                    Confirmer
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-action-reject"
                                                    disabled={updating}
                                                    onClick={() =>
                                                        openActionModal(
                                                            reservation,
                                                            "reject"
                                                        )
                                                    }
                                                >
                                                    Refuser
                                                </button>

                                            </div>
                                        )}

                                    </article>
                                ))}

                            </div>
                        )}
                    </>
                )}

            </main>

            {/* MODALE DE CONFIRMATION / REFUS */}

            {reservationToUpdate && (
                <div
                    className="admin-modal-overlay"
                    onClick={closeActionModal}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-modal-title"
                        aria-describedby="admin-modal-description"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span className="admin-modal-icon">
                            {reservationToUpdate.action === "confirm"
                                ? "✓"
                                : "⚠"}
                        </span>

                        <h2 id="admin-modal-title">
                            {reservationToUpdate.action === "confirm"
                                ? "Confirmer la réservation ?"
                                : "Refuser la réservation ?"}
                        </h2>

                        <p id="admin-modal-description">
                            Réservation #
                            {reservationToUpdate.reservation.id}
                            {" — "}
                            {reservationToUpdate.reservation.brand}{" "}
                            {reservationToUpdate.reservation.model}
                        </p>

                        <p>
                            Client :{" "}
                            <strong>
                                {reservationToUpdate.reservation.customer_name}
                            </strong>
                        </p>

                        {reservationToUpdate.action === "reject" && (
                            <p className="admin-modal-note">
                                Le refus rendra ce véhicule de nouveau
                                disponible pour cette période.
                            </p>
                        )}

                        {/* ERREUR DE L'ACTION */}

                        {actionError && (
                            <p className="admin-error" role="alert">
                                {actionError}
                            </p>
                        )}

                        {/* BOUTONS MODALE */}

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-modal-back"
                                disabled={updating}
                                onClick={closeActionModal}
                            >
                                Retour
                            </button>

                            <button
                                type="button"
                                className={
                                    reservationToUpdate.action === "confirm"
                                        ? "admin-action-confirm"
                                        : "admin-action-reject"
                                }
                                disabled={updating}
                                onClick={handleUpdateReservation}
                            >
                                {updating
                                    ? "Traitement en cours..."
                                    : reservationToUpdate.action === "confirm"
                                        ? "Confirmer la réservation"
                                        : "Refuser la réservation"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default AdminReservations
