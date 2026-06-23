import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PackageProvider } from "./context/PackageContext";
import LoginPage from "./pages/LoginPage";
import ResidentDashboard from "./pages/ResidentDashboard";
import ReceptionPanel from "./pages/ReceptionPanel";
import AdminPanel from "./pages/AdminPanel";
import PackageDetail from "./pages/PackageDetail";
import TermsPage from "./pages/TermsPage";

export default function App() {
  const location = useLocation();
  return (
    <PackageProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Acceso e Inicio de Sesión */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Paneles de Control de Roles */}
        <Route path="/residente" element={<ResidentDashboard />} />
        <Route path="/recepcion" element={<ReceptionPanel />} />
        <Route path="/administrador" element={<AdminPanel />} />

        {/* Trazabilidad y Detalles */}
        <Route path="/paquete/:id" element={<PackageDetail />} />
        <Route path="/terminos" element={<TermsPage />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </PackageProvider>
  );
}
