import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import Header from "../components/header"
import Footer from "../components/footer"
import VehicleForm from "../components/admin/VehicleForm"
import VehicleCard from "../components/admin/VehicleCard"

const API_URL = "http://localhost/vortex-loc/backend/public/api"

const EMPTY_VEHICLE = {
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
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || "Erreur de communication avec le serveur."
    )
  }

  return data
}

function AdminVehicles() {
  const { user, loading } = useAuth()

  const [vehicles, setVehicles] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Actions : immobilisation et remise en service
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState({
    id: null,
    message: ""
  })

  // Formulaire commun ajout / modification
  const [formMode, setFormMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formVehicle, setFormVehicle] = useState({
    ...EMPTY_VEHICLE
  })
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "admin") {
      setFetching(false)
      return
    }

    const controller = new AbortController()

    setFetching(true)
    setError("")

    apiRequest("/admin/vehicles", {
      signal: controller.signal
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setVehicles(data.vehicles ?? [])
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setFetching(false)
        }
      })

    return () => controller.abort()
  }, [loading, user?.id, user?.role])

  async function refreshVehicles() {
    const data = await apiRequest("/admin/vehicles")
    setVehicles(data.vehicles ?? [])
  }

  function openAddForm() {
    if (formSaving || busyId !== null) return

    setFormMode("create")
    setEditingId(null)
    setFormVehicle({ ...EMPTY_VEHICLE })
    setFormError("")
    setSuccess("")
  }

  function openEditForm(vehicle) {
    if (formSaving || busyId !== null) return

    setFormMode("edit")
    setEditingId(vehicle.id)

    setFormVehicle({
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      category: vehicle.category ?? "",
      price_per_day: String(vehicle.price_per_day ?? ""),
      seats: String(vehicle.seats ?? ""),
      transmission: vehicle.transmission ?? "",
      power: vehicle.power ?? "",
      range_km: vehicle.range_km == null
        ? ""
        : String(vehicle.range_km),
      image: vehicle.image ?? "",
      description: vehicle.description ?? ""
    })

    setFormError("")
    setSuccess("")
  }

  function closeForm() {
    if (formSaving) return

    setFormMode(null)
    setEditingId(null)
    setFormError("")
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setFormVehicle((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  async function handleSaveVehicle() {
    if (formSaving || busyId !== null || !formMode) return

    const isEditing = formMode === "edit"

    if (isEditing && editingId === null) return

    setFormSaving(true)
    setFormError("")
    setSuccess("")

    try {
      const path = isEditing
        ? `/admin/vehicles/${editingId}`
        : "/admin/vehicles"

      const data = await apiRequest(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          ...formVehicle,
          range_km: formVehicle.range_km === ""
            ? null
            : formVehicle.range_km
        })
      })

      // Actualiser la flotte depuis MySQL
      await refreshVehicles()

      setFormMode(null)
      setEditingId(null)
      setFormVehicle({ ...EMPTY_VEHICLE })

      setSuccess(
        isEditing
          ? `Véhicule #${data.vehicle.id} modifié avec succès.`
          : `Véhicule #${data.vehicle.id} ajouté à la flotte.`
      )
    } catch (err) {
      setFormError(err.message || "Erreur d'enregistrement.")
    } finally {
      setFormSaving(false)
    }
  }

  async function immobilize(vehicleId, payload) {
    if (busyId !== null || formSaving) return false

    setBusyId(vehicleId)
    setActionError({ id: null, message: "" })
    setSuccess("")

    try {
      await apiRequest(
        `/admin/vehicles/${vehicleId}/unavailability`,
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      )

      await refreshVehicles()

      setSuccess(
        `Immobilisation du véhicule #${vehicleId} enregistrée.`
      )

      return true
    } catch (err) {
      setActionError({
        id: vehicleId,
        message: err.message
      })
      return false
    } finally {
      setBusyId(null)
    }
  }

  async function restore(vehicleId) {
    if (busyId !== null || formSaving) return

    const confirmed = window.confirm(
      "Confirmer la remise en service de ce véhicule ?"
    )

    if (!confirmed) return

    setBusyId(vehicleId)
    setActionError({ id: null, message: "" })
    setSuccess("")

    try {
      await apiRequest(
        `/admin/vehicles/${vehicleId}/restore`,
        { method: "PATCH" }
      )

      await refreshVehicles()

      setSuccess(
        `Véhicule #${vehicleId} remis en service.`
      )
    } catch (err) {
      setActionError({
        id: vehicleId,
        message: err.message
      })
    } finally {
      setBusyId(null)
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
            Gérez la flotte, les immobilisations et les
            remises en service Vortex'Loc.
          </p>
        </div>

        <button
          type="button"
          className="admin-action-confirm"
          disabled={formSaving || busyId !== null}
          onClick={() => {
            if (formMode === "create") {
              closeForm()
            } else {
              openAddForm()
            }
          }}
        >
          {formMode === "create"
            ? "Fermer le formulaire"
            : "+ Ajouter un véhicule"}
        </button>

        {formMode !== null && (
          <VehicleForm
            mode={formMode}
            vehicle={formVehicle}
            saving={formSaving}
            error={formError}
            onChange={handleFormChange}
            onSubmit={handleSaveVehicle}
            onCancel={closeForm}
          />
        )}

        {success && (
          <p className="admin-action-success" role="status">
            ✓ {success}
          </p>
        )}

        {fetching && (
          <p>Chargement des véhicules...</p>
        )}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {!fetching && !error && (
          <>
            <p className="admin-reservations-count">
              {vehicles.length} véhicule(s) dans la flotte
            </p>

            <div className="admin-reservations-list">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  busy={busyId !== null || formSaving}
                  onEdit={openEditForm}
                  onImmobilize={immobilize}
                  onRestore={restore}
                  actionError={
                    actionError.id === vehicle.id
                      ? actionError.message
                      : ""
                  }
                />
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
