import { useEffect, useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import { apiFetch } from "../services/apiFetch"

function Account() {
    const { user, loading } = useAuth()
    const location = useLocation()

    // Réservations
    const [reservations, setReservations] = useState([])
    const [reservationsLoading, setReservationsLoading] = useState(true)
    const [reservationsError, setReservationsError] = useState("")

    // Annulation
    const [cancellingId, setCancellingId] = useState(null)
    const [cancelError, setCancelError] = useState("")
    const [cancelSuccess, setCancelSuccess] = useState("")
    const [reservationToCancel, setReservationToCancel] = useState(null)

    /*
    ==========================================
    CHARGEMENT DES RÉSERVATIONS
    ==========================================
    */

    useEffect(() => {
        if (loading) return

        if (!user) {
            setReservations([])
            setReservationsLoading(false)
            return
        }

        const controller = new AbortController()

        async function fetchReservations() {
            setReservationsLoading(true)
            setReservationsError("")

            try {
                const response = await apiFetch("/reservations/me", {
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error(
                        "Impossible de charger vos réservations."
                    )
                }

                const data = await response.json()

                if (!controller.signal.aborted) {
                    setReservations(data.reservations ?? [])
                }

            } catch (error) {
                if (
                    error.name !== "AbortError" &&
                    !controller.signal.aborted
                ) {
                    setReservationsError(error.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setReservationsLoading(false)
                }
            }
        }

        fetchReservations()

        return () => controller.abort()
    }, [user?.id, loading])

    /*
    ==========================================
    ANNULATION D'UNE RÉSERVATION
    ==========================================
    */

    function openCancelModal(reservation) {
        setCancelError("")
        setCancelSuccess("")
        setReservationToCancel(reservation)
    }

    async function handleCancel(reservation) {
        if (cancellingId !== null) return

        setCancellingId(reservation.id)
        setCancelError("")
        setCancelSuccess("")
        setReservationToCancel(null)

        try {
            const response = await apiFetch(
                `/reservations/${reservation.id}/cancel`,
                {
                    method: "PATCH"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible d'annuler la réservation."
                )
            }

            // Actualiser immédiatement le statut
            setReservations((previous) =>
                previous.map((item) =>
                    item.id === reservation.id
                        ? { ...item, status: "cancelled" }
                        : item
                )
            )

            setCancelSuccess(
                `La réservation de ${reservation.brand} ${reservation.model} a été annulée.`
            )

        } catch (error) {
            setCancelError(
                error.message || "Une erreur est survenue."
            )
        } finally {
            setCancellingId(null)
        }
    }

    /*
    ==========================================
    FORMATAGE DES DATES
    ==========================================
    */

    function formatDate(dateString) {
        if (!dateString) return "—"

        const parts = dateString.slice(0, 10).split("-")

        if (parts.length !== 3) return dateString

        return `${parts[2]}/${parts[1]}/${parts[0]}`
    }

    function canCancelReservation(reservation) {
        if (!["pending", "confirmed"].includes(reservation.status)) {
            return false
        }

        if (!reservation.start_date) return false

        // Départ fixé provisoirement à minuit,
        // heure de Paris.
        const departure = new Date(
            `${reservation.start_date.slice(0, 10)}T00:00:00`
        )

        if (Number.isNaN(departure.getTime())) return false

        const remainingTime = departure.getTime() - Date.now()

        return remainingTime >= 24 * 60 * 60 * 1000
    }

    /*
    ==========================================
    CHARGEMENT DE LA SESSION
    ==========================================
    */

    if (loading) {
        return (
            <div className="account-page">
                <Header theme="dark" />

                <main className="account-content">
                    <p>Chargement de votre compte...</p>
                </main>

                <Footer />
            </div>
        )
    }

    /*
    ==========================================
    PROTECTION DE LA PAGE
    ==========================================
    */

    if (!user) {
        return <Navigate to="/login" replace />
    }

    /*
    ==========================================
    AFFICHAGE
    ==========================================
    */

    return (
        <div className="account-page">
            <Header theme="dark" />

            <main className="account-content">

                {/* TITRE */}

                <div className="account-heading">
                    <span className="account-eyebrow">
                        ESPACE CLIENT VORTEX'LOC
                    </span>

                    <h1>
                        Bonjour, <span>{user.first_name}.</span>
                    </h1>

                    <p>
                        Retrouvez vos informations personnelles et
                        gérez vos réservations depuis votre espace.
                    </p>
                </div>

                {/* GRILLE PRINCIPALE */}

                <div className="account-grid">

                    {/* INFORMATIONS PERSONNELLES */}

                    <section className="account-card">
                        <div className="account-card-header">
                            <h2>Mes informations</h2>
                            <span className="account-card-icon">👤</span>
                        </div>

                        <div className="account-information">

                            <div>
                                <span>PRÉNOM</span>
                                <strong>{user.first_name}</strong>
                            </div>

                            <div>
                                <span>NOM</span>
                                <strong>{user.last_name}</strong>
                            </div>

                            <div>
                                <span>EMAIL</span>
                                <strong>{user.email}</strong>
                            </div>

                            <div>
                                <span>TÉLÉPHONE</span>
                                <strong>
                                    {user.phone || "Non renseigné"}
                                </strong>
                            </div>

                        </div>
                    </section>

                    {/* MES RÉSERVATIONS */}

                    <section className="account-card">
                        <div className="account-card-header">
                            <h2>Mes réservations</h2>
                            <span className="account-card-icon">📅</span>
                        </div>

                        {/* CONFIRMATION DE RÉSERVATION */}

                        {location.state?.reservationSuccess && (
                            <p className="account-success" role="status">
                                ✓ Votre réservation a bien été enregistrée !
                            </p>
                        )}

                        {/* CONFIRMATION D'ANNULATION */}

                        {cancelSuccess && (
                            <p className="account-success" role="status">
                                ✓ {cancelSuccess}
                            </p>
                        )}

                        {/* CHARGEMENT */}

                        {reservationsLoading && (
                            <p>Chargement de vos réservations...</p>
                        )}

                        {/* ERREURS */}

                        {reservationsError && (
                            <p className="account-error" role="alert">
                                {reservationsError}
                            </p>
                        )}

                        {cancelError && (
                            <p className="account-error" role="alert">
                                {cancelError}
                            </p>
                        )}

                        {/* AUCUNE RÉSERVATION */}

                        {!reservationsLoading &&
                            !reservationsError &&
                            reservations.length === 0 && (
                                <div className="account-empty">
                                    <p>
                                        Vous n'avez pas encore de réservation.
                                    </p>

                                    <Link
                                        to="/flotte"
                                        className="account-button"
                                    >
                                        Découvrir notre flotte →
                                    </Link>
                                </div>
                            )}

                        {/* HISTORIQUE DES RÉSERVATIONS */}

                        {!reservationsLoading &&
                            !reservationsError &&
                            reservations.length > 0 && (
                                <div className="account-reservations">

                                    {reservations.map((reservation) => (
                                        <article
                                            key={reservation.id}
                                            className="account-reservation"
                                        >

                                            {/* VÉHICULE ET STATUT */}

                                            <div className="account-reservation-top">
                                                <strong>
                                                    {reservation.brand}{" "}
                                                    {reservation.model}
                                                </strong>

                                                <span
                                                    className={
                                                        `account-status account-status-${reservation.status}`
                                                    }
                                                >
                                                    {reservation.status === "pending"
                                                        ? "En attente"
                                                        : reservation.status === "confirmed"
                                                            ? "Confirmée"
                                                            : reservation.status === "cancelled"
                                                                ? "Annulée"
                                                                : reservation.status}
                                                </span>
                                            </div>

                                            {/* DÉTAILS */}

                                            <div className="account-reservation-details">

                                                <p>
                                                    <span>Départ</span>
                                                    {formatDate(reservation.start_date)}
                                                </p>

                                                <p>
                                                    <span>Retour</span>
                                                    {formatDate(reservation.end_date)}
                                                </p>

                                                <p>
                                                    <span>Retrait</span>
                                                    {reservation.pickup_location}
                                                </p>

                                                <p>
                                                    <span>Prix total</span>
                                                    <strong>
                                                        {Number(
                                                            reservation.total_price
                                                        ).toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: "EUR"
                                                        })}
                                                    </strong>
                                                </p>

                                            </div>

                                            {/* BOUTON ANNULATION */}

                                            {["pending", "confirmed"].includes(
                                                reservation.status
                                            ) && (
                                                    <button
                                                        type="button"
                                                        className="account-cancel-button"
                                                        disabled={cancellingId !== null || !canCancelReservation(reservation)}
                                                        onClick={() => openCancelModal(reservation)}
                                                    >
                                                        {cancellingId === reservation.id
                                                            ? "Annulation en cours..."
                                                            : canCancelReservation(reservation)
                                                                ? "Annuler ma réservation"
                                                                : "Délai d'annulation dépassé"}
                                                    </button>
                                                )}

                                        </article>
                                    ))}

                                </div>
                            )}

                    </section>

                </div>

            </main>

            {reservationToCancel && (
                <div
                    className="account-modal-overlay"
                    onClick={() => {
                        if (cancellingId === null) {
                            setReservationToCancel(null)
                        }
                    }}
                >
                    <div
                        className="account-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-modal-title"
                        aria-describedby="cancel-modal-description"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="account-modal-icon">
                            ⚠
                        </div>

                        <h2 id="cancel-modal-title">
                            Annuler la réservation ?
                        </h2>

                        <p id="cancel-modal-description">
                            Vous êtes sur le point d'annuler votre réservation de
                            <strong>
                                {" "}{reservationToCancel.brand}{" "}
                                {reservationToCancel.model}
                            </strong>.
                        </p>

                        <p className="account-modal-note">
                            L'annulation est possible uniquement jusqu'à
                            24 heures avant le départ.
                        </p>

                        {cancelError && (
                            <p className="account-error" role="alert">
                                {cancelError}
                            </p>
                        )}

                        <div className="account-modal-actions">
                            <button
                                type="button"
                                className="account-modal-back"
                                disabled={cancellingId !== null}
                                onClick={() => setReservationToCancel(null)}
                            >
                                Conserver ma réservation
                            </button>

                            <button
                                type="button"
                                className="account-modal-confirm"
                                disabled={cancellingId !== null}
                                onClick={() => handleCancel(reservationToCancel)}
                            >
                                {cancellingId !== null
                                    ? "Annulation..."
                                    : "Confirmer l'annulation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default Account
