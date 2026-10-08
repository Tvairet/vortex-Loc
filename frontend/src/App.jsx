import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Fleet from "./pages/Fleet"
import VehicleDetails from "./pages/VehicleDetails"
import Reservation from "./pages/Reservation"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Account from "./pages/Account"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/flotte" element={<Fleet />} />
        <Route path="/vehicule/:id" element={<VehicleDetails />} />
        <Route path="/reservation/:id" element={<Reservation />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/compte" element={<Account />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App