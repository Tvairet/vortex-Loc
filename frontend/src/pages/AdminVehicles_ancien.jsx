import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

import Header from "../components/header"
import Footer from "../components/footer"
import VehicleForm from "../components/admin/VehicleForm"

const API_URL = "http://localhost/vortex-loc/backend/public/api"

const VEHICLE_STATUSES = [
    { value: "breakdown", label: "En panne" },
    { value: "cleaning", label: "En nettoyage" },
    { value: "maintenance", label: "En révision" },
    { value: "repair", label: "En réparation" },
    { value: "preparation", label: "En préparation" },
    { value: "out_of_service", label: "Hors service" }
]

function AdminVehicles() {
    const { user, loading } = useAuth()

    const [vehicles, setVehicles] = useState([])
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState("")

    const [editingVehicle, setEditingVehicle] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState("breakdown")
    const [statusReason, setStatusReason] = useState("")
    const [startDate, setStartDate] = useState("")
    const [estimatedEndDate, setEstimatedEndDate] = useState("")

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [saveSuccess, setSaveSuccess] = useState("")

    const [historyVehicle, setHistoryVehicle] = useState(null)
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState("")


    const [showAddForm, setShowAddForm] = useState(false)

    const [newVehicle, setNewVehicle] = useState({
        brand: "",
        model: "",
        category: "",
        price_per_day: "",
        seats: "",
        transmission: "",
        power: "",
        range_km: "",
        image: "",
        description: ""
    })

    const [addingVehicle, setAddingVehicle] = useState(false)
    const [addError, setAddError] = useState("")


    async function loadVehicles(signal) {
        const response = await fetch(`${API_URL}/admin/vehicles`, {
            credentials: "include",
            signal
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Impossible de charger les véhicules.")
        }

        return data.vehicles ?? []
    }

    useEffect(() => {
        if (loading) return

        if (!user || user.role !== "admin") {
            setFetching(false)
            return
        }

        const controller = new AbortController()

        async function fetchVehicles() {
            setFetching(true)
            setError("")

            try {
                const data = await loadVehicles(controller.signal)

                if (!controller.signal.aborted) {
                    setVehicles(data)
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message || "Erreur de chargement.")
                }
            } finally {
                if (!controller.signal.aborted) {
                    setFetching(false)
                }
            }
        }

        fetchVehicles()

        return () => controller.abort()
    }, [loading, user?.id, user?.role])

    async function showVehicleHistory(vehicleId) {
        if (historyLoading) return

        if (historyVehicle === vehicleId) {
            setHistoryVehicle(null)
            return
        }

        setHistoryVehicle(vehicleId)
        setHistory([])
        setHistoryError("")
        setHistoryLoading(true)

        try {
            const response = await fetch(
                `${API_URL}/admin/vehicles/${vehicleId}/unavailability`,
                {
                    credentials: "include"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || "Impossible de charger l'historique."
                )
            }

            setHistory(data.unavailability ?? [])
        } catch (err) {
            setHistoryError(err.message || "Erreur de chargement.")
        } finally {
            setHistoryLoading(false)
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "Non renseignée"

        const [year, month, day] = dateString.slice(0, 10).split("-")

        return `${day}/${month}/${year}`
    }

    function handleNewVehicleChange(event) {
        const { name, value } = event.target

        setNewVehicle((previous) => ({
            ...previous,
            [name]: value
        }))
    }
    
async function handleAddVehicle() {
  if (addingVehicle) return

  setAddingVehicle(true)
  setAddError("")
  setSaveSuccess("")

  try {
    const response = await fetch(
      `${API_URL}/admin/vehicles`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newVehicle,
          range_km: newVehicle.range_km === ""
            ? null
            : newVehicle.range_km
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || "Impossible d'ajouter le véhicule."
      )
    }

    // Actualiser la liste depuis MySQL
    await refreshVehicles()

    // Fermer et réinitialiser le formulaire
    setShowAddForm(false)

    setNewVehicle({
      brand: "",
      model: "",
      category: "",
      price_per_day: "",
      seats: "",
      transmission: "",
      power: "",
      range_km: "",
      image: "",
      description: ""
    })

    setSaveSuccess("Le véhicule a été ajouté à la flotte.")
  } catch (err) {
    setAddError(
      err.message || "Une erreur est survenue."
    )
  } finally {
    setAddingVehicle(false)
  }
}

    function getStatusLabel(status) {
        if (status === "available") return "Disponible"

        return VEHICLE_STATUSES.find(
            (item) => item.value === status
        )?.label ?? status
    }

    function startEditing(vehicle) {
        if (saving) return

        setEditingVehicle(vehicle.id)
        setSelectedStatus("breakdown")
        setStatusReason("")
        setStartDate(new Date().toLocaleDateString("en-CA"))
        setEstimatedEndDate("")
        setSaveError("")
        setSaveSuccess("")
    }

    function cancelEditing() {
        if (saving) return

        setEditingVehicle(null)
        setSaveError("")
    }

    async function refreshVehicles() {
        const data = await loadVehicles()
        setVehicles(data)
    }

    async function createUnavailability(vehicleId) {
        if (saving) return

        if (!startDate) {
            setSaveError("Indique une date de début.")
            return
        }

        if (estimatedEndDate && estimatedEndDate < startDate) {
            setSaveError(
                "La fin prévisionnelle doit être après le début."
            )
            return
        }

        setSaving(true)
        setSaveError("")
        setSaveSuccess("")

        try {
            const response = await fetch(
                `${API_URL}/admin/vehicles/${vehicleId}/unavailability`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: selectedStatus,
                        reason: statusReason,
                        start_date: startDate,
                        estimated_end_date: estimatedEndDate || null
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || "Impossible d'enregistrer l'immobilisation."
                )
            }

            await refreshVehicles()

            setEditingVehicle(null)
            setSaveSuccess(
                `Immobilisation du véhicule #${vehicleId} enregistrée.`
            )
        } catch (err) {
            setSaveError(err.message || "Erreur de sauvegarde.")
        } finally {
            setSaving(false)
        }
    }

    async function restoreVehicle(vehicleId) {
        if (saving) return

        const confirmed = window.confirm(
            "Confirmer la remise en service de ce véhicule ?"
        )

        if (!confirmed) return

        setSaving(true)
        setSaveError("")
        setSaveSuccess("")

        try {
            const response = await fetch(
                `${API_URL}/admin/vehicles/${vehicleId}/restore`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || "Impossible de remettre le véhicule en service."
                )
            }

            await refreshVehicles()

            setEditingVehicle(null)
            setSaveSuccess(
                `Véhicule #${vehicleId} remis en service.`
            )
        } catch (err) {
            setSaveError(err.message || "Erreur de remise en service.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p>Chargement...</p>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== "admin") {
        return <Navigate to="/compte" replace />
    }

    return (
        <div className="admin-page">
            <Header theme="dark" />

            <main className="admin-content">
                <Link to="/admin" className="admin-back">
                    ← Retour au tableau de bord
                </Link>

                <div className="admin-heading">
                    <h1>Gestion des véhicules</h1>
                    <p>
                        Gérez les immobilisations et les remises en
                        service de la flotte Vortex'Loc.
                    </p>
                </div>
                <button
                    type="button"
                    className="admin-action-confirm"
                    onClick={() => {
                        setShowAddForm((previous) => !previous)
                        setAddError("")
                    }}
                >
                    {showAddForm ? "Fermer le formulaire" : "+ Ajouter un véhicule"}
                </button>

                {fetching && <p>Chargement des véhicules...</p>}

                {error && (
                    <p className="admin-error" role="alert">{error}</p>
                )}

                {saveSuccess && (
                    <p className="admin-action-success" role="status">
                        ✓ {saveSuccess}
                    </p>
                )}

                {!fetching && !error && (
                    <>
                        <p className="admin-reservations-count">
                            {vehicles.length} véhicule(s) dans la flotte
                        </p>

                        <div className="admin-reservations-list">
                            {vehicles.map((vehicle) => (
                                <article
                                    className="admin-reservation-card"
                                    key={vehicle.id}
                                >
                                    <div className="admin-reservation-heading">
                                        <div>
                                            <span className="admin-reservation-id">
                                                VÉHICULE #{vehicle.id}
                                            </span>

                                            <h2>
                                                {vehicle.brand} {vehicle.model}
                                            </h2>
                                        </div>

                                        <span className="admin-vehicle-status">
                                            {getStatusLabel(vehicle.vehicle_status)}
                                        </span>
                                    </div>

                                    <div className="admin-reservation-details">
                                        <div>
                                            <span>CATÉGORIE</span>
                                            <strong>{vehicle.category}</strong>
                                        </div>

                                        <div>
                                            <span>PRIX PAR JOUR</span>
                                            <strong>
                                                {Number(vehicle.price_per_day).toLocaleString(
                                                    "fr-FR",
                                                    { style: "currency", currency: "EUR" }
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>ÉTAT ACTUEL</span>
                                            <strong>
                                                {vehicle.available
                                                    ? "En service"
                                                    : "Hors service temporairement"}
                                            </strong>
                                        </div>
                                    </div>

                                    {vehicle.status_reason && (
                                        <p className="admin-vehicle-reason">
                                            Motif : {vehicle.status_reason}
                                        </p>
                                    )}

                                    {editingVehicle === vehicle.id && (
                                        <div className="admin-vehicle-editor">
                                            <h3>Nouvelle immobilisation</h3>

                                            <label htmlFor={`status-${vehicle.id}`}>
                                                Type d'immobilisation
                                            </label>

                                            <select
                                                id={`status-${vehicle.id}`}
                                                value={selectedStatus}
                                                disabled={saving}
                                                onChange={(event) =>
                                                    setSelectedStatus(event.target.value)
                                                }
                                            >
                                                {VEHICLE_STATUSES.map((status) => (
                                                    <option
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <label htmlFor={`start-${vehicle.id}`}>
                                                Date de début
                                            </label>

                                            <input
                                                id={`start-${vehicle.id}`}
                                                type="date"
                                                value={startDate}
                                                disabled={saving}
                                                onChange={(event) =>
                                                    setStartDate(event.target.value)
                                                }
                                            />

                                            <label htmlFor={`end-${vehicle.id}`}>
                                                Fin prévisionnelle (facultative)
                                            </label>

                                            <input
                                                id={`end-${vehicle.id}`}
                                                type="date"
                                                value={estimatedEndDate}
                                                min={startDate || undefined}
                                                disabled={saving}
                                                onChange={(event) =>
                                                    setEstimatedEndDate(event.target.value)
                                                }
                                            />

                                            <label htmlFor={`reason-${vehicle.id}`}>
                                                Motif ou commentaire
                                            </label>

                                            <textarea
                                                id={`reason-${vehicle.id}`}
                                                rows={3}
                                                maxLength={500}
                                                value={statusReason}
                                                disabled={saving}
                                                placeholder="Ex. : réparation des freins"
                                                onChange={(event) =>
                                                    setStatusReason(event.target.value)
                                                }
                                            />

                                            <div className="admin-reservation-actions">
                                                <button
                                                    type="button"
                                                    className="admin-modal-back"
                                                    disabled={saving}
                                                    onClick={cancelEditing}
                                                >
                                                    Annuler
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-action-confirm"
                                                    disabled={saving}
                                                    onClick={() =>
                                                        createUnavailability(vehicle.id)
                                                    }
                                                >
                                                    {saving
                                                        ? "Enregistrement..."
                                                        : "Enregistrer l'immobilisation"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {editingVehicle !== vehicle.id && (
                                        <div className="admin-reservation-actions">
                                            {vehicle.vehicle_status === "available" ? (
                                                <button
                                                    type="button"
                                                    className="admin-action-confirm"
                                                    disabled={saving}
                                                    onClick={() => startEditing(vehicle)}
                                                >
                                                    Immobiliser le véhicule
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="admin-action-confirm"
                                                    disabled={saving}
                                                    onClick={() => restoreVehicle(vehicle.id)}
                                                >
                                                    Remettre en service
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {saveError && (
                                        editingVehicle === vehicle.id ||
                                        (editingVehicle === null &&
                                            vehicle.vehicle_status !== "available")
                                    ) && (
                                            <p className="admin-error" role="alert">
                                                {saveError}
                                            </p>
                                        )}

                                    <div className="admin-reservation-actions">
                                        <button
                                            type="button"
                                            className="admin-modal-back"
                                            onClick={() => showVehicleHistory(vehicle.id)}
                                        >
                                            {historyVehicle === vehicle.id
                                                ? "Masquer l'historique"
                                                : "Voir l'historique"}
                                        </button>
                                    </div>

                                    {historyVehicle === vehicle.id && (
                                        <div className="admin-vehicle-history">
                                            <h3>Historique des immobilisations</h3>

                                            {historyLoading && <p>Chargement...</p>}

                                            {historyError && (
                                                <p className="admin-error">{historyError}</p>
                                            )}

                                            {!historyLoading && !historyError && history.length === 0 && (
                                                <p>Aucune immobilisation enregistrée.</p>
                                            )}

                                            {!historyLoading && !historyError &&
                                                history.map((item) => (
                                                    <div className="admin-vehicle-history-item" key={item.id}>
                                                        <strong>{getStatusLabel(item.status)}</strong>

                                                        <p>
                                                            Du {formatDate(item.start_date)} au{" "}
                                                            {item.estimated_end_date
                                                                ? formatDate(item.estimated_end_date)
                                                                : "date de fin inconnue"}
                                                            {" "} (fin prévisionnelle)
                                                        </p>

                                                        {item.reason && <p>Motif : {item.reason}</p>}

                                                        <p>
                                                            {item.resolved_at
                                                                ? `Remise en service validée le ${formatDate(item.resolved_at)}`
                                                                : "Remise en service non validée"}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default AdminVehicles
