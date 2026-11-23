import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Fleet from "./pages/Fleet"
import VehicleDetails from "./pages/VehicleDetails"
import Reservation from "./pages/Reservation"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Account from "./pages/Account"
import AdminDashboard from "./pages/AdminDashboard"
import AdminReservations from "./pages/AdminReservations"
import AdminVehicles from "./pages/AdminVehicles"
import AdminUsers from "./pages/AdminUsers"
import AdminStats from "./pages/AdminStats"
import Services from "./pages/Services"
import Avis from "./pages/Avis"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"
import MentionsLegales from "./pages/MentionsLegales"
import Confidentialite from "./pages/Confidentialite"
import ConditionsLocation from "./pages/ConditionsLocation"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/flotte" element={<Fleet />} />
        <Route path="/services" element={<Services />} />
        <Route path="/avis" element={<Avis />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/conditions-location" element={<ConditionsLocation />} />
        <Route path="/vehicule/:id" element={<VehicleDetails />} />
        <Route path="/reservation/:id" element={<Reservation />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/compte" element={<Account />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/vehicles" element={<AdminVehicles />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App
