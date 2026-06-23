import { useParams, useNavigate } from "react-router-dom";
import { usePackages } from "../context/PackageContext";
import { WhatsAppService } from "../lib/WhatsAppService";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packages, authorizePackage, rejectPackage } = usePackages();

  const [activeAuthPkg, setActiveAuthPkg] = useState(null);
  const [authMethod, setAuthMethod] = useState("firma"); // firma o otp
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const residentPhone = localStorage.getItem("Portier_logged_resident_phone") || "+573132223333";

  const pkg = packages.find((p) => p.id === id);

  if (!pkg) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        className="min-h-screen bg-background p-6 flex flex-col items-center justify-center"
      >
        <span className="material-symbols-outlined text-error text-6xl">warning</span>
        <h3 className="font-title text-2xl font-bold text-on-surface mt-4">Paquete No Encontrado</h3>
        <p className="text-on-surface-variant font-body text-sm mt-2">La referencia {id} no existe en el sistema.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 bg-primary text-on-primary px-6 py-2.5 rounded-full font-semibold shadow-md"
        >
          Volver Atrás
        </button>
      </motion.div>
    );
  }

  // Fotos fallback por si no tiene fotos asignadas
  const photos = pkg.photos || {
    label: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3vyG7PG-BTn2tz5Ve5kSAs1tmNelfOnDiF0qDroCQDVfGaE30_kn3LSPtxBwF8I-nHG1l6IeB_qbj8r8fwbW-ZkcjPY5RMtawoQ4v8NQCYcrhw2s35lwO2-WO1b3D4Jkgg_gm0mx0jH2VZzeK19MWc11Uplki-KWDgbeyCEAWdbgvzVRFTVsVYl_LmqLnPBjTN2n74x_htOUOZc_PM0hfU9pnbttG-1ll9H--ZIZaPlHNDgBOavHwYDaBHkoUHGKPqy47tVxpgok",
    package: "https://lh3.googleusercontent.com/aida-public/AB6AXuDID-FncxrwywhP4IV3oSUZLN8xP9ySqkDq5bv07ICPQLRrqbgpF-n461_kLYa6KUeLbeSAXvgar3vsbTp69W5pebMTuUKWeA8QT4j_TwtDDQ9pn6aVZNqC-wYQ0zjSzmey78-nVHl96NHWP1oMTfLQ-Nx_iSLhy6o8Ggoge9fT5W4jveNGtTkVx2v5ueockgP80jDNVIlqj92nvtTJSS_RIQmhqra5QutiM6ryslv_gXrAxBir4UMV9sGnTgq6h7Ns71bRSuqffYA",
    context: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdyHOfp0TQ5eCF0ZzQZhDSFNPqCeTjWY70iCMIWajDGUyXaszmRe277Wl80UU5y1nIQo_sVXCeVCYRmgWOA9kofUwr_sNhUZzA1PnaC3uoWZ1DUTGrU94PjKSSS0o76s02WoEnAkKUBlY4WajBPVbp03CPYOcLgI9QMXFUgLtUoX-d-EZ9FsG9pkfL1KcDWr5yL9bYrRIf6j74j9cmo2633q0xzPqCvkG4hVaLzZGMYzPD6AsbUjOwzdMv5TJmciBYUjQ7ygWt930"
  };

  const handleSendWhatsApp = () => {
    const message = `Hola *${pkg.residentName}*. Tu paquete con código *${pkg.id}* está en la recepción en estado *${pkg.status.toUpperCase()}*. Usa el código de retiro *${pkg.otp}* para reclamarlo.`;
    const link = WhatsAppService.generateWaMeLink(pkg.residentPhone, message);
    window.open(link, "_blank");
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background p-6">
      {/* Breadcrumbs y Título */}
      <div className="max-w-7xl mx-auto mb-10 animate-fade-in">
        <div className="flex items-center gap-2 text-outline font-body text-xs mb-3 uppercase tracking-wider font-semibold">
          <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors">
            Volver
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Detalle de Paquete #{pkg.id}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-title text-3xl font-bold text-on-surface">
              Detalles del Envío
            </h1>
            <p className="font-body text-on-surface-variant mt-2">
              Residente: <strong>{pkg.residentName}</strong> · Celular: <strong>{pkg.residentPhone}</strong> {pkg.trackingNumber ? `· Guía: ${pkg.trackingNumber}` : `· Código de Retiro: ${pkg.otp}`}
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            {pkg.residentPhone === residentPhone && (pkg.status === "recibido" || pkg.status === "inesperado") && (
              <button
                onClick={() => setActiveAuthPkg(pkg)}
                className="bg-secondary text-on-secondary px-5 py-2.5 rounded-full font-semibold hover:bg-secondary/90 transition-all flex items-center gap-2 text-sm shadow-md animate-pulse"
              >
                <span className="material-symbols-outlined text-lg">draw</span>
                Aprobar Recepción
              </button>
            )}
            <button
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm shadow-md"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              Compartir WhatsApp
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white/60 border border-primary text-primary px-5 py-2.5 rounded-full font-semibold hover:bg-primary/5 transition-all flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Descargar Comprobante
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Regresar al Panel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sección de Galería de Evidencia */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-title text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                Evidencia Fotográfica de Recepción
              </h3>
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">3 Fotos Guardadas</span>
            </div>

            {pkg.status === "pre_registrado" ? (
              <div className="h-[300px] flex flex-col items-center justify-center bg-white/30 border border-dashed border-outline/30 rounded-lg">
                <span className="material-symbols-outlined text-outline text-5xl opacity-40">photo_camera</span>
                <p className="text-on-surface-variant font-body text-sm mt-3">Las fotos serán cargadas cuando se reciba el paquete en recepción.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 h-[350px]">
                <div className="col-span-2 relative group rounded-lg overflow-hidden border border-white/50">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${photos.package})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider">Vista del Paquete Completo</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative group rounded-lg overflow-hidden border border-white/50">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${photos.label})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">Etiqueta</span>
                    </div>
                  </div>
                  <div className="flex-1 relative group rounded-lg overflow-hidden border border-white/50">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${photos.context})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">Lobby / Repartidor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bento Widgets de Detalles adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-2">Identificación de Entrega</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <h4 className="font-title text-base font-bold text-on-surface">
                    {pkg.trackingNumber ? `Guía: ${pkg.trackingNumber}` : "Envío sin Guía"}
                  </h4>
                  <p className="text-xs text-outline mt-1">ID Interno: {pkg.id}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-2">Código de Retiro</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">pin</span>
                </div>
                <div>
                  <h4 className="font-title text-xl font-bold text-secondary tracking-widest">{pkg.otp}</h4>
                  <p className="text-xs text-outline">Código para entrega en recepción</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de la Línea de Tiempo */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-title text-lg font-bold text-on-surface">Historial de Seguimiento</h3>
              <span className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                En Vivo
              </span>
            </div>

            <div className="space-y-0">
              {/* Evento 1: Pre-registro */}
              <div className="timeline-item pb-8 relative flex gap-4">
                <div className="timeline-line shrink-0 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${pkg.preRegisteredAt ? "bg-primary text-on-primary" : "bg-surface-container-highest text-outline"
                    }`}>
                    1
                  </div>
                </div>
                <div className="flex-1 -mt-1 text-sm font-body">
                  <p className="text-xs font-semibold text-outline">
                    {pkg.preRegisteredAt ? new Date(pkg.preRegisteredAt).toLocaleString() : "Sin aviso de llegada"}
                  </p>
                  <h4 className="font-title font-bold text-on-surface mt-1">Aviso de Llegada del Residente</h4>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                    El residente notificó al sistema la llegada esperada de este paquete.
                  </p>
                  {pkg.notes && (
                    <div className="mt-2 text-xs italic bg-white/30 p-2 rounded border border-white/40 text-on-surface-variant">
                      Nota: "{pkg.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Evento 2: Recibido en portería */}
              <div className="timeline-item pb-8 relative flex gap-4">
                <div className="timeline-line shrink-0 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${pkg.receivedAt ? "bg-primary text-on-primary" : "bg-surface-container-highest text-outline"
                    }`}>
                    2
                  </div>
                </div>
                <div className="flex-1 -mt-1 text-sm font-body">
                  <p className="text-xs font-semibold text-outline">
                    {pkg.receivedAt ? new Date(pkg.receivedAt).toLocaleString() : "Pendiente de llegada"}
                  </p>
                  <h4 className="font-title font-bold text-on-surface mt-1">
                    {pkg.status === "inesperado" ? "Entrada (Inesperado)" : "En Recepción"}
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                    {pkg.status === "inesperado"
                      ? `El personal de recepción (${pkg.guardName || "sistema"}) registró el paquete de forma condicional al no encontrar un aviso de llegada activo.`
                      : `El personal de recepción (${pkg.guardName || "sistema"}) verificó el ingreso físico del paquete y cargó la evidencia fotográfica de recepción.`}
                  </p>
                </div>
              </div>

              {/* Evento 3: Autorización */}
              <div className="timeline-item pb-8 relative flex gap-4">
                <div className="timeline-line shrink-0 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${pkg.authorizedAt ? (pkg.status === "rechazado" ? "bg-error text-on-error" : "bg-primary text-on-primary") : "bg-surface-container-highest text-outline"
                    }`}>
                    3
                  </div>
                </div>
                <div className="flex-1 -mt-1 text-sm font-body">
                  <p className="text-xs font-semibold text-outline">
                    {pkg.authorizedAt ? new Date(pkg.authorizedAt).toLocaleString() : "Esperando decisión"}
                  </p>
                  <h4 className="font-title font-bold text-on-surface mt-1">
                    {pkg.status === "rechazado"
                      ? pkg.preRegisteredAt === null
                        ? "Rechazado en Recepción"
                        : "Rechazado por Residente"
                      : "Aprobación / Confirmación Digital"}
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                    {pkg.status === "rechazado"
                      ? pkg.preRegisteredAt === null
                        ? `Ingreso rechazado y devuelto a la transportadora. Motivo: "${pkg.rejectReason || "No aprobado"}"`
                        : `Ingreso rechazado por el residente. Motivo: "${pkg.rejectReason}"`
                      : pkg.authorizedAt
                        ? "El residente aprobó formalmente el ingreso del paquete."
                        : "Esperando confirmación digital del residente mediante la aplicación."}
                  </p>
                  {pkg.status === "autorizado" && pkg.signature && (
                    <div className="mt-3 p-3 bg-white/40 rounded border border-primary/20 backdrop-blur-sm">
                      <p className="text-[10px] font-bold text-outline uppercase">Confirmación Digital Registrada</p>
                      {pkg.signature.startsWith('data:image') ? (
                        <img src={pkg.signature} alt="Firma" className="h-16 mt-2" />
                      ) : (
                        <p className="font-title text-base font-bold italic text-primary mt-1 opacity-70">
                          {pkg.signature}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Evento 4: Entrega final */}
              <div className="timeline-item relative flex gap-4">
                <div className="timeline-line shrink-0 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${pkg.deliveredAt ? "bg-tertiary text-on-tertiary" : "bg-surface-container-highest text-outline"
                    }`}>
                    4
                  </div>
                </div>
                <div className="flex-1 -mt-1 text-sm font-body">
                  <p className="text-xs font-semibold text-outline">
                    {pkg.deliveredAt ? new Date(pkg.deliveredAt).toLocaleString() : "Pendiente de retiro"}
                  </p>
                  <h4 className="font-title font-bold text-on-surface mt-1">Entrega Física Completa</h4>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                    {pkg.deliveredAt
                      ? "El paquete ha sido entregado en mano al residente. Código de retiro validado e historial cerrado."
                      : "Paquete en custodia. Esperando recolección mediante validación de código de retiro en recepción."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: APROBAR DIGITALMENTE */}
      <AnimatePresence>
      {activeAuthPkg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card max-w-2xl w-full p-6 rounded-lg shadow-2xl relative">
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
                    className="w-full bg-white/50 border border-white/40 rounded-lg px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-error/50 transition-all h-20 resize-none text-on-surface"
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
    </motion.div>
  );
}
