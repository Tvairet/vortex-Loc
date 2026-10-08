import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// Styles globaux
import "./styles/global.css"

// Composants communs
import "./styles/components/header.css"
import "./styles/components/footer.css"

// Styles des pages
import "./styles/pages/home.css"
import "./styles/pages/fleet.css"
import "./styles/pages/vehicle-details.css"
import "./styles/pages/reservation.css"
import "./styles/pages/register.css"
import "./styles/pages/login.css"
import "./styles/pages/account.css"

import { AuthProvider } from "./context/AuthContext"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
