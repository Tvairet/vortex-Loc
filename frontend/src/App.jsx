import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Fleet from "./pages/Fleet"
import VehicleDetails from "./pages/VehicleDetails"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/flotte" element={<Fleet />} />
        <Route path="/vehicule/:id" element={<VehicleDetails />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App