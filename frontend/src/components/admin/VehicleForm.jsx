import "../../styles/components/vehicle-form.css"

function VehicleForm({
    vehicle,
    onChange,
    onSubmit,
    onCancel,
    saving,
    error,
    mode = "create"
}) {
    const isEditing = mode === "edit"

    return (
        <form
            className="admin-vehicle-editor"
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
        >
            <h2>{isEditing ? "Modifier le véhicule" : "Ajouter un véhicule"}</h2>

            <label htmlFor="vehicle-brand">Marque *</label>
            <input
                id="vehicle-brand"
                name="brand"
                value={vehicle.brand}
                onChange={onChange}
                maxLength={100}
                required
                disabled={saving}
                placeholder="Ex. : Audi"
            />

            <label htmlFor="vehicle-model">Modèle *</label>
            <input
                id="vehicle-model"
                name="model"
                value={vehicle.model}
                onChange={onChange}
                maxLength={100}
                required
                disabled={saving}
                placeholder="Ex. : RS6 Avant"
            />

            <label htmlFor="vehicle-category">Catégorie *</label>
            <select
                id="vehicle-category"
                name="category"
                value={vehicle.category}
                onChange={onChange}
                required
                disabled={saving}
            >
                <option value="">Choisir une catégorie</option>
                {!["Sportive", "Citadine", "Familiale", "SUV", ""].includes(vehicle.category) && (
                    <option value={vehicle.category} disabled>
                        Ancienne catégorie : {vehicle.category} (à reclasser)
                    </option>
                )}
                <option value="Sportive">Sportive</option>
                <option value="Citadine">Citadine</option>
                <option value="Familiale">Familiale</option>
                <option value="SUV">SUV</option>
            </select>

            <label htmlFor="vehicle-motorization">Motorisation *</label>
            <select
                id="vehicle-motorization"
                name="motorization"
                value={vehicle.motorization}
                onChange={onChange}
                required
                disabled={saving}
            >
                <option value="">Choisir une motorisation</option>
                <option value="electric">100 % électrique</option>
                <option value="thermal">Thermique</option>
            </select>

            <label htmlFor="vehicle-price">Prix par jour (€) *</label>
            <input
                id="vehicle-price"
                name="price_per_day"
                type="number"
                min="0.01"
                step="0.01"
                value={vehicle.price_per_day}
                onChange={onChange}
                required
                disabled={saving}
            />

            <label htmlFor="vehicle-seats">Nombre de places *</label>
            <input
                id="vehicle-seats"
                name="seats"
                type="number"
                min="1"
                max="20"
                step="1"
                value={vehicle.seats}
                onChange={onChange}
                required
                disabled={saving}
            />

            <label htmlFor="vehicle-transmission">Transmission *</label>
            <select
                id="vehicle-transmission"
                name="transmission"
                value={vehicle.transmission}
                onChange={onChange}
                required
                disabled={saving}
            >
                <option value="">Choisir une transmission</option>
                <option value="Automatique">Automatique</option>
                <option value="Manuelle">Manuelle</option>
            </select>

            <label htmlFor="vehicle-power">Puissance</label>
            <input
                id="vehicle-power"
                name="power"
                value={vehicle.power}
                onChange={onChange}
                disabled={saving}
                placeholder="Ex. : 600 ch"
            />

            <label htmlFor="vehicle-range">Autonomie (km)</label>
            <input
                id="vehicle-range"
                name="range_km"
                type="number"
                min="0"
                step="1"
                value={vehicle.range_km}
                onChange={onChange}
                disabled={saving}
                placeholder="Facultatif"
            />

            <label htmlFor="vehicle-image">Image (URL ou chemin)</label>
            <input
                id="vehicle-image"
                name="image"
                value={vehicle.image}
                onChange={onChange}
                disabled={saving}
                placeholder="/images/audi-rs6.jpg"
            />

            <label htmlFor="vehicle-description">Description</label>
            <textarea
                id="vehicle-description"
                name="description"
                value={vehicle.description}
                onChange={onChange}
                maxLength={2000}
                rows={4}
                disabled={saving}
                placeholder="Description du véhicule..."
            />

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            <div className="admin-reservation-actions">
                <button
                    type="button"
                    className="admin-modal-back"
                    disabled={saving}
                    onClick={onCancel}
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    className="admin-action-confirm"
                    disabled={saving}
                >
                    {saving
                        ? "Enregistrement..."
                        : isEditing
                            ? "Enregistrer les modifications"
                            : "Ajouter le véhicule"}
                </button>
            </div>
        </form>
    )
}

export default VehicleForm
