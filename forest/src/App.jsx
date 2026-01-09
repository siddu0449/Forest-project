import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./output.css";

import Navbar from "./Components/Nabvbar/Navabar";
import ExternalVisitor from "./Components/Extrnal visitor/Extrnalpage";
import Login from "./Components/Login/Login";
import ReceptionDashboard from "./Components/ReceptionDashboard/ReceptionDashboard";
import GateDashboard from "./Components/GateDashboard/GateDashboard"; // import GateDashboard

import { ROLES } from "./Components/constants/roles"; // only roles
import { isLoggedIn } from "./utils/auth"; // auth functions

// ProtectedRoute component
const ProtectedRoute = ({ children, role }) => {
  const loggedIn = isLoggedIn();
  const userRole = localStorage.getItem("userRole");

  // Not logged in -> redirect to login
  if (!loggedIn) return <Navigate to="/login" />;

  // Logged in but role does not match -> redirect to login
  if (role && userRole !== role) return <Navigate to="/login" />;

  // Access granted
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Navbar visible on all pages */}
      <Navbar />

      <Routes>
        {/* External Visitor page */}
        <Route path="/" element={<ExternalVisitor />} />

        {/* Reception dashboard - only accessible by Reception role */}
        <Route
          path="/reception"
          element={
            <ProtectedRoute role={ROLES.RECEPTION}>
              <ReceptionDashboard />
            </ProtectedRoute>
          }
        />

        {/* Gate dashboard - only accessible by Gate role */}
        <Route
          path="/gate"
          element={
            <ProtectedRoute role={ROLES.GATE}>
              <GateDashboard />
            </ProtectedRoute>
          }
        />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Fallback - redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
