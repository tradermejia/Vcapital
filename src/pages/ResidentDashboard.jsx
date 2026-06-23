import { useState, useRef, useEffect } from "react";
import { usePackages } from "../context/PackageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WhatsAppService } from "../lib/WhatsAppService";

export default function ResidentDashboard() {
  const { packages, preRegisterPackage, authorizePackage, rejectPackage } = usePackages();
  const navigate = useNavigate();

  // Filtramos los paquetes del residente activo
  const residentName = localStorage.getItem("Portier_logged_resident_name") || "Juan Carlos Pérez";
  const residentPhone = localStorage.getItem("Portier_logged_resident_phone") || "+573132223333";
  const myPackages = packages.filter(p => p.residentPhone === residentPhone);

  // Estados de interfaz
  const [showPreRegister, setShowPreRegister] = useState(false);
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(""); // Número de guía opcional
  const [hasTracking, setHasTracking] = useState("no"); // yes / no
  const [showConfirmPreRegister, setShowConfirmPreRegister] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [activeAuthPkg, setActiveAuthPkg] = useState(null); // Paquete que se está autorizando
  const [authMethod, setAuthMethod] = useState("firma"); // firma o otp
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Estadísticas del Residente
  const stats = {
    total: myPackages.length,
    pending: myPackages.filter(p => ["pre_registrado", "recibido", "autorizado", "inesperado"].includes(p.status)).length,
    delivered: myPackages.filter(p => p.status === "entregado").length,
    attention: myPackages.filter(p => ["recibido", "inesperado"].includes(p.status)).length // Requieren autorización
  };

  const handlePreRegisterSubmit = (e) => {
    e.preventDefault();
    setShowConfirmPreRegister(true);
  };

  const handleConfirmPreRegister = () => {
    const trackingVal = hasTracking === "yes" ? trackingNumber.trim() : "";
    const pkg = preRegisterPackage(residentPhone, residentName, trackingVal, notes);

    // Generar y abrir enlace real a WhatsApp
    const message = `Hola *${pkg.residentName}*. Tu aviso de llegada de paquete con código *${pkg.id}* ha sido creado. Detalle: ${pkg.notes || "Sin notas"}. ${pkg.trackingNumber ? `Guía: *${pkg.trackingNumber}*` : `Código de retiro: *${pkg.otp}*`}.`;
    const link = WhatsAppService.generateWaMeLink(residentPhone, message);
    window.open(link, "_blank");

    setNotes("");
    setTrackingNumber("");
    setHasTracking("no");
    setAcceptTerms(false);
    setShowConfirmPreRegister(false);
    setShowPreRegister(false);
  };

  const startDrawing = ({ nativeEvent }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(nativeEvent.offsetX, nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (activeAuthPkg && authMethod === "firma" && !showRejectForm && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#0061a5"; // primary
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
    }
  }, [activeAuthPkg, authMethod, showRejectForm]);

  const handleAuthorize = () => {
    if (authMethod === "otp") {
      if (otpInput === activeAuthPkg.otp) {
        authorizePackage(activeAuthPkg.id, "Validación por Código OTP");
        setOtpInput("");
        setOtpError(false);
        setActiveAuthPkg(null);
      } else {
        setOtpError(true);
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      authorizePackage(activeAuthPkg.id, dataUrl);
      clearCanvas();
      setActiveAuthPkg(null);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectPackage(activeAuthPkg.id, rejectReason);
    setRejectReason("");
    setShowRejectForm(false);
    setActiveAuthPkg(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pre_registrado":
        return <span className="bg-white/50 text-outline border border-outline/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase">Anunciado</span>;
      case "recibido":
        return <span className="bg-secondary-container/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase animate-pulse">Por Aprobar</span>;
      case "inesperado":
        return <span className="bg-amber-500/20 text-amber-700 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase animate-pulse">Inesperado (Por Aprobar)</span>;
      case "autorizado":
        return <span className="bg-primary-container/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase">Aprobado</span>;
      case "rechazado":
        return <span className="bg-error-container/20 text-error border border-error/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase">Rechazado</span>;
      case "entregado":
        return <span className="bg-tertiary-container/20 text-tertiary border border-tertiary/30 px-3 py-1 rounded-full text-[11px] font-semibold uppercase">Entregado</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className="min-h-screen bg-background p-4 md:p-6 font-body text-on-surface"
    >
      {/* Header del Residente */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-title text-3xl font-bold text-on-surface">Hola, {residentName}</h1>
          <p className="font-body text-on-surface-variant mt-1">Celular: {residentPhone} · Historial de Entregas</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-white/60 border border-outline/20 text-on-surface-variant px-5 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-all flex items-center gap-2 shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
          <button
            onClick={() => setShowPreRegister(true)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Avisar Llegada de Paquete
          </button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-outline uppercase tracking-wider">Anunciados (Por Llegar)</p>
            <h3 className="font-title text-3xl font-bold text-on-surface mt-2">
              {myPackages.filter(p => p.status === "pre_registrado").length}
            </h3>
          </div>
          <span className="material-symbols-outlined text-outline text-4xl opacity-40">inventory_2</span>
        </div>

        <div className="glass-card p-6 rounded-lg flex items-center justify-between border-l-4 border-l-secondary">
          <div>
            <p className="text-xs font-semibold text-outline uppercase tracking-wider">Requieren Aprobación</p>
            <h3 className="font-title text-3xl font-bold text-secondary mt-2">{stats.attention}</h3>
          </div>
          <span className="material-symbols-outlined text-secondary text-4xl opacity-40">notification_important</span>
        </div>

        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-outline uppercase tracking-wider">En Recepción</p>
            <h3 className="font-title text-3xl font-bold text-primary mt-2">
              {myPackages.filter(p => ["recibido", "autorizado"].includes(p.status)).length}
            </h3>
          </div>
          <span className="material-symbols-outlined text-primary text-4xl opacity-40">warehouse</span>
        </div>

        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-outline uppercase tracking-wider">Entregados</p>
            <h3 className="font-title text-3xl font-bold text-tertiary mt-2">{stats.delivered}</h3>
          </div>
          <span className="material-symbols-outlined text-tertiary text-4xl opacity-40">check_circle</span>
        </div>
      </div>

      {/* Alerta de acción inmediata */}
      {myPackages.some(p => ["recibido", "inesperado"].includes(p.status)) && (
        <div className="max-w-7xl mx-auto mb-10 glass-card border border-secondary/30 bg-secondary-container/5 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">notifications_active</span>
            </div>
            <div>
              <h4 className="font-title font-bold text-on-surface text-lg">Aprobación Digital Requerida</h4>
              <p className="text-sm text-on-surface-variant">Tienes paquetes en recepción esperando tu confirmación digital para ingresar.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {myPackages
              .filter(p => ["recibido", "inesperado"].includes(p.status))
              .map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveAuthPkg(p)}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all text-sm flex items-center gap-2 shadow-md ${p.status === "inesperado"
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/15 animate-bounce"
                      : "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-secondary/15"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">draw</span>
                  {p.status === "inesperado" ? `Aprobar Inesperado ${p.id}` : `Aprobar ${p.id}`}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Listado de Paquetes */}
      <div className="max-w-7xl mx-auto glass-card rounded-lg p-6">
        <h3 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          Mis Paquetes
        </h3>

        {myPackages.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-outline text-6xl opacity-30">inbox</span>
            <p className="text-on-surface-variant font-body text-sm mt-3">No tienes registros de paquetes activos.</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Versión Escritorio (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/10 text-outline text-xs uppercase font-semibold">
                    <th className="py-4 px-4">Referencia</th>
                    <th className="py-4 px-4">Detalle / Notas</th>
                    <th className="py-4 px-4">Identificación / Código</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4">Actualizado</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-outline/5 hover:bg-white/30 transition-all text-sm font-body text-on-surface">
                      <td className="py-4 px-4 font-bold text-primary">{pkg.id}</td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant truncate max-w-[200px]" title={pkg.notes}>
                        {pkg.notes || <span className="text-outline italic">Sin detalles</span>}
                      </td>
                      <td className="py-4 px-4">
                        {pkg.trackingNumber ? (
                          <span className="text-xs font-bold text-primary">
                            Guía: {pkg.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-secondary">
                            Retiro: {pkg.otp}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(pkg.status)}</td>
                      <td className="py-4 px-4 text-xs text-outline">
                        {pkg.deliveredAt
                          ? new Date(pkg.deliveredAt).toLocaleString()
                          : pkg.receivedAt
                            ? new Date(pkg.receivedAt).toLocaleString()
                            : pkg.preRegisteredAt
                              ? new Date(pkg.preRegisteredAt).toLocaleString()
                              : "Pendiente"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => navigate(`/paquete/${pkg.id}`)}
                          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all inline-flex items-center"
                          title="Ver Seguimiento"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        {pkg.status === "recibido" && (
                          <button
                            onClick={() => setActiveAuthPkg(pkg)}
                            className="text-secondary hover:bg-secondary/10 p-2 rounded-full transition-all inline-flex items-center ml-1"
                            title="Aprobar Ingreso"
                          >
                            <span className="material-symbols-outlined">draw</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Versión Móvil (Cards) */}
            <div className="md:hidden space-y-4">
              {myPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white/40 border border-white/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Referencia</p>
                      <p className="font-title font-bold text-primary text-base">{pkg.id}</p>
                    </div>
                    <div>{getStatusBadge(pkg.status)}</div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Identificación / Código</p>
                    <p className="text-sm">
                      {pkg.trackingNumber ? (
                        <span className="font-bold text-primary">Guía: {pkg.trackingNumber}</span>
                      ) : (
                        <span className="font-bold text-secondary">Retiro: {pkg.otp}</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Detalle / Notas</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {pkg.notes || <span className="text-outline italic">Sin detalles</span>}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-3 border-t border-white/30">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Actualizado</p>
                      <p className="text-xs font-semibold text-on-surface-variant">
                        {pkg.deliveredAt
                          ? new Date(pkg.deliveredAt).toLocaleString()
                          : pkg.receivedAt
                            ? new Date(pkg.receivedAt).toLocaleString()
                            : pkg.preRegisteredAt
                              ? new Date(pkg.preRegisteredAt).toLocaleString()
                              : "Pendiente"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/paquete/${pkg.id}`)}
                        className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-full transition-all inline-flex items-center"
                        title="Ver Seguimiento"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      {pkg.status === "recibido" && (
                        <button
                          onClick={() => setActiveAuthPkg(pkg)}
                          className="bg-secondary/10 text-secondary hover:bg-secondary/20 p-2 rounded-full transition-all inline-flex items-center"
                          title="Aprobar Ingreso"
                        >
                          <span className="material-symbols-outlined text-sm">draw</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: AVISO DE LLEGADA */}
      <AnimatePresence>
      {showPreRegister && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
            className="glass-card max-w-lg w-full p-6 rounded-lg shadow-2xl relative"
          >
            <h3 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">app_registration</span>
              Anunciar Llegada de Paquete
            </h3>

            <form onSubmit={handlePreRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Descripción / Notas Especiales</label>
                <textarea
                  required
                  placeholder="Ej: Libro de Amazon, Zapatos de MercadoLibre..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/50 border border-white/40 rounded-lg px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all h-20 resize-none text-on-surface"
                />
              </div>

              <div className="bg-white/30 p-4 rounded-lg border border-white/20">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">¿Tiene número de guía / tracking?</label>
                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-1.5 text-sm text-on-surface font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="residentHasTracking"
                      value="yes"
                      checked={hasTracking === "yes"}
                      onChange={() => setHasTracking("yes")}
                      className="text-primary focus:ring-primary"
                    />
                    Sí tengo guía
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-on-surface font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="residentHasTracking"
                      value="no"
                      checked={hasTracking === "no"}
                      onChange={() => setHasTracking("no")}
                      className="text-primary focus:ring-primary"
                    />
                    No tengo guía (Código de Retiro)
                  </label>
                </div>

                {hasTracking === "yes" ? (
                  <div className="mt-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Número de Guía / Tracking</label>
                    <input
                      type="text"
                      required={hasTracking === "yes"}
                      placeholder="Ej: AMZN-99221, DHL-12345, etc."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase font-bold"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-outline mt-2 italic leading-relaxed">
                    * El sistema generará un código de retiro de 4 dígitos para retirar el paquete en la recepción una vez que sea recibido.
                  </p>
                )}
              </div>

              {/* Checkbox de Términos y Condiciones */}
              <div className="flex items-start gap-2 mt-4 bg-white/10 p-3 rounded-lg border border-white/20">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary bg-white/50 border-white/40 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="acceptTerms" className="text-xs text-on-surface-variant leading-tight">
                  He leído y acepto los <button type="button" onClick={() => window.open("/terminos", "_blank")} className="text-primary hover:underline font-bold">Términos y Condiciones</button> del servicio de paquetería, incluyendo políticas de almacenamiento, tarifas y responsabilidades.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreRegister(false);
                    setAcceptTerms(false);
                  }}
                  className="px-5 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!acceptTerms}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-sm font-title font-semibold shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  Confirmar Aviso
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL: APROBAR DIGITALMENTE */}
      <AnimatePresence>
      {activeAuthPkg && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
            className="glass-card max-w-2xl w-full p-6 rounded-lg shadow-2xl relative"
          >
            <h3 className="font-title text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              {activeAuthPkg.status === "inesperado" ? "Aprobación de Envío Inesperado" : "Confirmación Digital de Recepción"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              La recepción ha reportado la llegada del paquete <strong className="text-primary">{activeAuthPkg.id}</strong>. Revisa la evidencia fotográfica y confirma digitalmente para autorizar su ingreso.
            </p>

            {activeAuthPkg.status === "inesperado" && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg text-amber-900 text-xs font-semibold mb-6 flex items-start gap-2.5 leading-relaxed">
                <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="font-bold">⚠️ AVISO DE SEGURIDAD: Paquete Inesperado</p>
                  <p className="font-normal mt-0.5 text-amber-800">Este paquete llegó a recepción sin aviso previo de su parte. Verifique detalladamente el remitente y las fotografías antes de confirmar.</p>
                </div>
              </div>
            )}

            {/* Evidencia Fotográfica */}
            {activeAuthPkg.photos && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">1. Etiqueta</p>
                  <div className="h-32 rounded-lg bg-cover bg-center border border-white/50" style={{ backgroundImage: `url(${activeAuthPkg.photos.label})` }}></div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">2. Paquete Completo</p>
                  <div className="h-32 rounded-lg bg-cover bg-center border border-white/50" style={{ backgroundImage: `url(${activeAuthPkg.photos.package})` }}></div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">3. Remitente / Repartidor</p>
                  <div className="h-32 rounded-lg bg-cover bg-center border border-white/50" style={{ backgroundImage: `url(${activeAuthPkg.photos.context})` }}></div>
                </div>
              </div>
            )}

            {!showRejectForm ? (
              <div className="space-y-4">

                {/* Selector de Método */}
                <div className="flex gap-2 bg-white/30 p-1 rounded-lg border border-white/20 mb-4">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("firma"); setOtpError(false); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMethod === "firma" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-white/40"}`}
                  >
                    Firma a Mano
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("otp"); setOtpError(false); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMethod === "otp" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-white/40"}`}
                  >
                    Código de Retiro
                  </button>
                </div>

                {authMethod === "firma" ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-outline uppercase tracking-wider">Dibujar Firma</label>
                      <button type="button" onClick={clearCanvas} className="text-xs text-primary hover:underline">Limpiar</button>
                    </div>
                    <div className="bg-white rounded-lg border border-outline/30 overflow-hidden h-40">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none"
                      />
                    </div>
                    <p className="text-[11px] text-outline mt-1.5">
                      Dibuja tu firma en el recuadro para autorizar la recepción de manera formal.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/30 p-4 rounded-lg border border-white/20">
                    <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                      Ingresa tu Código de Retiro (PIN)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ej: 1234"
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/\D/g, ''));
                        setOtpError(false);
                      }}
                      className={`w-full bg-white/50 border ${otpError ? "border-error focus:ring-error/50" : "border-white/40 focus:ring-primary/50"} rounded-full px-4 py-2.5 text-lg font-bold tracking-widest text-center outline-none focus:ring-2 transition-all text-on-surface`}
                    />
                    {otpError && <p className="text-xs text-error mt-2 text-center font-semibold">Código incorrecto. Verifica el PIN.</p>}
                    <p className="text-[11px] text-outline mt-3 text-center">
                      El código fue enviado a tu WhatsApp y también es visible en los detalles de tu paquete.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="text-error hover:bg-error/10 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
                  >
                    Rechazar Paquete
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAuthPkg(null)}
                      className="px-5 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-sm font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAuthorize}
                      disabled={authMethod === "otp" ? otpInput.length !== 4 : false}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-sm font-title font-semibold shadow-md shadow-primary/10 disabled:opacity-50"
                    >
                      Aprobar Ingreso
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Motivo de Rechazo</label>
                  <textarea
                    required
                    placeholder="Ej: Destinatario incorrecto, paquete dañado, no pedí este producto."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-white/50 border border-white/40 rounded-lg px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-error/50 transition-all h-20 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-5 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-sm font-semibold"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                    className="px-6 py-2.5 rounded-full bg-error text-on-error hover:bg-error/95 transition-all text-sm font-title font-semibold shadow-md shadow-error/10 disabled:opacity-50"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL: CONFIRMACIÓN DE AVISO DE LLEGADA */}
      <AnimatePresence>
      {showConfirmPreRegister && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
            className="glass-card max-w-md w-full p-6 rounded-lg shadow-2xl relative text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>

            <h3 className="font-title text-xl font-bold text-on-surface mb-2">
              ¿Confirmar Aviso de Llegada?
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 font-body">
              Verifica los datos ingresados antes de proceder. Se guardará el aviso de llegada y se abrirá WhatsApp para notificar.
            </p>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6 text-left space-y-2.5">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Destinatario</p>
                <p className="text-sm font-semibold text-on-surface">{residentName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Celular</p>
                <p className="text-sm font-semibold text-primary">{residentPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Detalles / Notas</p>
                <p className="text-sm font-body text-on-surface-variant italic">"{notes || 'Sin detalles'}"</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Seguimiento</p>
                <p className="text-sm font-semibold text-secondary">
                  {hasTracking === "yes" ? `Guía: ${trackingNumber.toUpperCase()}` : "Se generará código de retiro de 4 dígitos"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmPreRegister(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-xs font-semibold"
              >
                Volver a Editar
              </button>
              <button
                type="button"
                onClick={handleConfirmPreRegister}
                className="flex-1 px-4 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-xs font-title font-semibold shadow-md shadow-primary/10"
              >
                Confirmar y Enviar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
