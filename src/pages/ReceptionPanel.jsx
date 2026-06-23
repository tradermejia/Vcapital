import { useState, useRef, useEffect } from "react";
import { usePackages } from "../context/PackageContext";
import { useNavigate } from "react-router-dom";
import { WhatsAppService } from "../lib/WhatsAppService";
import { motion, AnimatePresence } from "framer-motion";

export default function ReceptionPanel() {
  const { packages, residents, receivePackage, receiveDirectPackage, deliverPackage } = usePackages();
  const navigate = useNavigate();

  const operatorName = "Rodrigo M.";

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos"); // todos, pre_registrado (anunciado), recibido (en recepcion), autorizado (aprobado), entregado

  // Estados para Registro de Paquete
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPrePkg, setSelectedPrePkg] = useState(null); // Si viene de aviso de llegada
  const [isDirect, setIsDirect] = useState(false); // Entrada directa sin aviso previo

  // Formulario de Registro
  const [selectedResidentPhone, setSelectedResidentPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [photosSimulated, setPhotosSimulated] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [hasTracking, setHasTracking] = useState("no"); // yes / no

  // Nuevos estados para búsqueda de avisos de llegada y protocolos
  const [preRegisterSearch, setPreRegisterSearch] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [matchedPrePkg, setMatchedPrePkg] = useState(null);
  const [directProtocol, setDirectProtocol] = useState("recibido"); // recibido, inesperado, rechazado
  const [directRejectReason, setDirectRejectReason] = useState("");

  // Estados de Entrega Física
  const [activeDeliveryPkg, setActiveDeliveryPkg] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("otp"); // otp (codigo de retiro), firma (confirmacion digital)
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);

  // Referencia para firma en Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Estado para notificar entrega
  const [notifyDelivery, setNotifyDelivery] = useState(true);

  // Filtrar paquetes
  const filteredPackages = packages.filter(pkg => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      pkg.id.toLowerCase().includes(query) ||
      pkg.residentName.toLowerCase().includes(query) ||
      pkg.residentPhone.includes(searchQuery) ||
      (pkg.trackingNumber && pkg.trackingNumber.toLowerCase().includes(query)) ||
      (pkg.otp && pkg.otp.includes(searchQuery));

    if (filterStatus === "todos") return matchesSearch;
    return matchesSearch && pkg.status === filterStatus;
  });

  // Limpiar formulario de registro
  const resetRegisterForm = () => {
    setSelectedResidentPhone("");
    setNotes("");
    setPhotosSimulated(false);
    setSelectedPrePkg(null);
    setIsDirect(false);
    setTrackingNumber("");
    setHasTracking("no");
    setPreRegisterSearch("");
    setSearchError(false);
    setMatchedPrePkg(null);
    setDirectProtocol("recibido");
    setDirectRejectReason("");
  };

  const handlePreRegisterSearch = () => {
    setSearchError(false);
    const query = preRegisterSearch.trim().toLowerCase();
    if (!query) return;

    const found = packages.find(
      pkg => pkg.status === "pre_registrado" && (
        pkg.id.toLowerCase() === query ||
        pkg.otp === query ||
        (pkg.trackingNumber && pkg.trackingNumber.toLowerCase() === query)
      )
    );

    if (found) {
      setMatchedPrePkg(found);
      setIsDirect(false);
      setSelectedPrePkg(found);
      setSelectedResidentPhone(found.residentPhone);
      setNotes(found.notes);
      setTrackingNumber(found.trackingNumber);
      setHasTracking(found.trackingNumber ? "yes" : "no");
    } else {
      setSearchError(true);
      setMatchedPrePkg(null);
    }
  };

  // Enviar registro de paquete
  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (isDirect) {
      const selectedRes = residents.find(r => r.phone === selectedResidentPhone);
      if (!selectedRes) return alert("Por favor seleccione un residente válido.");
      const trackingVal = hasTracking === "yes" ? trackingNumber.trim() : "";
      
      const newPkg = receiveDirectPackage(
        selectedResidentPhone,
        selectedRes.name,
        trackingVal,
        notes,
        operatorName,
        null, // fotos por defecto
        directProtocol,
        directProtocol === "rechazado" ? directRejectReason : ""
      );

      // Notificar por WhatsApp de manera programática si el paquete es ingresado (estándar o inesperado)
      if (directProtocol !== "rechazado" && newPkg) {
        WhatsAppService.sendProgrammaticMessage(selectedResidentPhone, "delivery_alert", {
          residentName: selectedRes.name,
          trackingNumber: trackingVal,
          packageId: newPkg.id,
          otp: newPkg.otp
        });
      }
    } else if (selectedPrePkg) {
      receivePackage(selectedPrePkg.id, operatorName, null);
      // Notificar por WhatsApp de manera programática la llegada física
      WhatsAppService.sendProgrammaticMessage(selectedPrePkg.residentPhone, "delivery_alert", {
        residentName: selectedPrePkg.residentName,
        trackingNumber: selectedPrePkg.trackingNumber,
        packageId: selectedPrePkg.id,
        otp: selectedPrePkg.otp
      });
    }

    resetRegisterForm();
    setShowRegisterModal(false);
  };

  // Iniciar firma en Canvas
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

  // Configurar Canvas cuando se activa método "firma"
  useEffect(() => {
    if (deliveryMethod === "firma" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#0061a5";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
    }
  }, [deliveryMethod, activeDeliveryPkg]);

  // Completar entrega
  const handleDeliverSubmit = () => {
    let delivered = false;

    if (deliveryMethod === "otp") {
      if (otpInput === activeDeliveryPkg.otp) {
        deliverPackage(activeDeliveryPkg.id);
        delivered = true;
      } else {
        setOtpError(true);
      }
    } else {
      // Método Firma (Confirmación Digital): validamos que haya firmado (no validación estricta, solo confirmar)
      deliverPackage(activeDeliveryPkg.id);
      delivered = true;
    }

    if (delivered) {
      if (notifyDelivery) {
        const message = `Hola *${activeDeliveryPkg.residentName}*. Queríamos confirmarte que tu paquete con código *${activeDeliveryPkg.id}* ha sido entregado en tus manos exitosamente. ¡Gracias!`;
        const link = WhatsAppService.generateWaMeLink(activeDeliveryPkg.residentPhone, message);
        window.open(link, "_blank");
      }
      
      setActiveDeliveryPkg(null);
      setOtpInput("");
      setOtpError(false);
      setNotifyDelivery(true); // reset state
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className="min-h-screen bg-background p-4 md:p-6 font-body text-on-surface"
    >
      {/* Header de Recepción */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-title text-3xl font-bold text-on-surface">Panel de Recepción</h1>
          <p className="font-body text-on-surface-variant mt-1">
            Personal de Recepción activo: <strong className="text-primary">{operatorName}</strong> · Conserje Digital Portier
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-white/60 border border-outline/20 text-on-surface-variant px-5 py-2.5 rounded-full font-semibold hover:bg-white/95 transition-all flex items-center gap-2 shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
          <button
            onClick={() => {
              resetRegisterForm();
              setIsDirect(true);
              setShowRegisterModal(true);
            }}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-title font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">photo_camera</span>
            Registrar Entrada de Paquete
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="max-w-7xl mx-auto glass-card p-6 rounded-lg mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar por celular, destinatario, código de retiro o ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 border border-white/40 rounded-full pl-10 pr-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "todos", label: "Todos" },
            { id: "pre_registrado", label: "Anunciados" },
            { id: "recibido", label: "Por Aprobar" },
            { id: "autorizado", label: "Aprobados" },
            { id: "entregado", label: "Entregados" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-white/40 hover:bg-white/60 text-on-surface-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Envíos del Edificio */}
      <div className="max-w-7xl mx-auto glass-card rounded-lg p-6">
        <h3 className="font-title text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">warehouse</span>
          Control de Recepciones
        </h3>

        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-outline text-6xl opacity-30">inbox</span>
            <p className="text-on-surface-variant font-body text-sm mt-3">No hay paquetes que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Versión Escritorio (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/10 text-outline text-xs uppercase font-semibold">
                    <th className="py-4 px-4">Ref</th>
                    <th className="py-4 px-4">Celular de Destino</th>
                    <th className="py-4 px-4">Destinatario</th>
                    <th className="py-4 px-4">Código / Identificación</th>
                    <th className="py-4 px-4">Detalle / Notas</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-outline/5 hover:bg-white/30 transition-all text-sm font-body text-on-surface">
                      <td className="py-4 px-4 font-bold text-primary">{pkg.id}</td>
                      <td className="py-4 px-4 font-bold text-on-surface">{pkg.residentPhone}</td>
                      <td className="py-4 px-4 font-semibold">{pkg.residentName}</td>
                      <td className="py-4 px-4 font-semibold text-on-surface">
                        <div className="flex flex-col">
                          {pkg.trackingNumber ? (
                            <span className="text-xs font-bold text-primary">
                              Guía: {pkg.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-secondary">
                              Retiro: {pkg.otp}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant max-w-[180px] truncate" title={pkg.notes}>
                        {pkg.notes || <span className="text-outline italic">Sin notas</span>}
                      </td>
                      <td className="py-4 px-4">
                        {pkg.status === "pre_registrado" ? (
                          <span className="bg-white/50 text-outline border border-outline/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                            Anunciado
                          </span>
                        ) : pkg.status === "recibido" ? (
                          <span className="bg-secondary-container/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                            Por Aprobar
                          </span>
                        ) : pkg.status === "inesperado" ? (
                          <span className="bg-amber-500/20 text-amber-700 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Inesperado (Alerta)
                          </span>
                        ) : pkg.status === "autorizado" ? (
                          <span className="bg-primary-container/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            En Recepción (Aprobado)
                          </span>
                        ) : pkg.status === "rechazado" ? (
                          <span className="bg-error-container/20 text-error border border-error/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit" title={pkg.rejectReason}>
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            Rechazado {pkg.rejectReason ? `(${pkg.rejectReason})` : ""}
                          </span>
                        ) : (
                          <span className="bg-tertiary-container/20 text-tertiary border border-tertiary/30 px-3 py-1 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            Entregado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/paquete/${pkg.id}`)}
                            className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all inline-flex items-center"
                            title="Ver Seguimiento"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          {pkg.status === "pre_registrado" && (
                            <button
                              onClick={() => {
                                setSelectedPrePkg(pkg);
                                setIsDirect(false);
                                setSelectedResidentPhone(pkg.residentPhone);
                                setNotes(pkg.notes);
                                setShowRegisterModal(true);
                              }}
                              className="bg-secondary text-on-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-secondary/95 transition-all flex items-center gap-1 shadow-sm"
                              title="Registrar Entrada"
                            >
                              <span className="material-symbols-outlined text-sm">photo_camera</span>
                              Registrar Entrada
                            </button>
                          )}
                          {pkg.status === "autorizado" && (
                            <button
                              onClick={() => setActiveDeliveryPkg(pkg)}
                              className="bg-tertiary text-on-tertiary px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-tertiary/95 transition-all flex items-center gap-1 shadow-sm"
                              title="Entregar Paquete"
                            >
                              <span className="material-symbols-outlined text-sm">handshake</span>
                              Entregar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Versión Móvil (Cards) */}
            <div className="md:hidden space-y-4">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white/40 border border-white/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Referencia</p>
                      <p className="font-title font-bold text-primary text-base">{pkg.id}</p>
                    </div>
                    <div>
                      {pkg.status === "pre_registrado" ? (
                        <span className="bg-white/50 text-outline border border-outline/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          Anunciado
                        </span>
                      ) : pkg.status === "recibido" ? (
                        <span className="bg-secondary-container/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                          Por Aprobar
                        </span>
                      ) : pkg.status === "inesperado" ? (
                        <span className="bg-amber-500/20 text-amber-700 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Inesperado
                        </span>
                      ) : pkg.status === "autorizado" ? (
                        <span className="bg-primary-container/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          En Recepción (Aprobado)
                        </span>
                      ) : pkg.status === "rechazado" ? (
                        <span className="bg-error-container/20 text-error border border-error/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          Rechazado
                        </span>
                      ) : (
                        <span className="bg-tertiary-container/20 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          Entregado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">Destinatario</p>
                      <p className="text-sm font-semibold">{pkg.residentName}</p>
                      <p className="text-xs text-outline">{pkg.residentPhone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">Código / ID</p>
                      <p className="text-sm">
                        {pkg.trackingNumber ? (
                          <span className="font-bold text-primary">Guía: {pkg.trackingNumber}</span>
                        ) : (
                          <span className="font-bold text-secondary">Retiro: {pkg.otp}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">Notas</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {pkg.notes || <span className="text-outline italic">Sin notas</span>}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/30">
                    <button
                      onClick={() => navigate(`/paquete/${pkg.id}`)}
                      className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-full transition-all inline-flex items-center"
                      title="Ver Seguimiento"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                    
                    <div className="flex gap-2">
                      {pkg.status === "pre_registrado" && (
                        <button
                          onClick={() => {
                            setSelectedPrePkg(pkg);
                            setIsDirect(false);
                            setSelectedResidentPhone(pkg.residentPhone);
                            setNotes(pkg.notes);
                            setShowRegisterModal(true);
                          }}
                          className="bg-secondary text-on-secondary px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-secondary/95 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                          Recibir
                        </button>
                      )}
                      {pkg.status === "autorizado" && (
                        <button
                          onClick={() => setActiveDeliveryPkg(pkg)}
                          className="bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-tertiary/95 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[14px]">handshake</span>
                          Entregar
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

      {/* MODAL: REGISTRAR PAQUETE (ENTRADA DE ANUNCIADO O ENTRADA DIRECTA) */}
      <AnimatePresence>
      {showRegisterModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="glass-card max-w-xl w-full p-6 rounded-lg shadow-2xl relative">
            <h3 className="font-title text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              {isDirect ? "Registrar Entrada Directa (Sin Aviso de Llegada)" : "Registrar Entrada de Paquete Anunciado"}
            </h3>

            {/* Buscador de Aviso de Llegada */}
            {!selectedPrePkg && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4 animate-fade-in">
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  ¿El residente anunció este paquete? Buscar por Guía o Código de Retiro:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Ej: AMZN-99221 o 8821"
                      value={preRegisterSearch}
                      onChange={(e) => {
                        setPreRegisterSearch(e.target.value);
                        setSearchError(false);
                      }}
                      className="w-full bg-white/50 border border-white/40 rounded-full pl-9 pr-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface uppercase font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePreRegisterSearch}
                    className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-1"
                  >
                    Buscar
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-error font-semibold mt-2">
                    ⚠️ No se encontró ningún aviso de llegada activo con ese código de retiro o guía.
                  </p>
                )}
              </div>
            )}

            {/* Alerta de Aviso de Llegada Encontrado */}
            {matchedPrePkg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between mb-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Aviso de llegada encontrado para {matchedPrePkg.residentName} ({matchedPrePkg.residentPhone})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetRegisterForm();
                    setIsDirect(true);
                  }}
                  className="text-xs text-error underline hover:text-error/80 font-semibold"
                >
                  Limpiar Búsqueda
                </button>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Selector de residente si es directo */}
              {isDirect && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Destinatario / Residente</label>
                    <select
                      required
                      value={selectedResidentPhone}
                      onChange={(e) => setSelectedResidentPhone(e.target.value)}
                      className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                    >
                      <option value="">Seleccione...</option>
                      {residents.filter(r => r.active).map(res => (
                        <option key={res.phone} value={res.phone}>
                          {res.name} ({res.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Descripción del Paquete / Notas</label>
                    <input
                      type="text"
                      placeholder="Ej: Amazon MacBook, sobre de correo, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-on-surface"
                    />
                  </div>
                </div>
              )}

              {!isDirect && (
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Notas de Observación</label>
                  <input
                     type="text"
                     placeholder="Ej: Recibido con caja abollada, dejar en recepción, etc."
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-on-surface"
                  />
                </div>
              )}

              {isDirect && (
                <div className="space-y-4">
                  <div className="bg-white/30 p-4 rounded-lg border border-white/20">
                    <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">¿Tiene número de guía / tracking?</label>
                    <div className="flex gap-6 mb-3">
                      <label className="flex items-center gap-1.5 text-sm text-on-surface font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="guardHasTracking"
                          value="yes"
                          checked={hasTracking === "yes"}
                          onChange={() => setHasTracking("yes")}
                          className="text-primary focus:ring-primary"
                        />
                        Sí tiene guía
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-on-surface font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="guardHasTracking"
                          value="no"
                          checked={hasTracking === "no"}
                          onChange={() => setHasTracking("no")}
                          className="text-primary focus:ring-primary"
                        />
                        No tiene guía (Código de Retiro)
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
                          className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase font-bold text-on-surface"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-outline mt-2 italic leading-relaxed">
                        * El sistema generará un código de retiro único de 4 dígitos para que el residente retire el paquete en la recepción.
                      </p>
                    )}
                  </div>

                  {/* Protocolo de Recepción Directo */}
                  <div className="bg-white/30 p-4 rounded-lg border border-white/20 space-y-3">
                    <label className="block text-xs font-semibold text-outline uppercase tracking-wider">
                      Protocolo de Recepción en Entrada
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "recibido", label: "Estándar", desc: "Confirmado", icon: "check_circle" },
                        { id: "inesperado", label: "Inesperado", desc: "Alerta Apto", icon: "warning" },
                        { id: "rechazado", label: "Rechazar", desc: "Devolver", icon: "block" }
                      ].map((proto) => (
                        <button
                          key={proto.id}
                          type="button"
                          onClick={() => setDirectProtocol(proto.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all ${
                            directProtocol === proto.id
                              ? proto.id === "rechazado"
                                ? "bg-error text-on-error border-error shadow-sm"
                                : proto.id === "inesperado"
                                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                : "bg-primary text-on-primary border-primary shadow-sm"
                              : "bg-white/40 border-white/40 text-on-surface-variant hover:bg-white/60"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg mb-1">{proto.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{proto.label}</span>
                        </button>
                      ))}
                    </div>

                    {directProtocol === "rechazado" && (
                      <div className="mt-2 animate-fade-in">
                        <label className="block text-[10px] font-bold text-error uppercase mb-1">Motivo del Rechazo / Retorno</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Destinatario no reside, paquete dañado, no autorizado..."
                          value={directRejectReason}
                          onChange={(e) => setDirectRejectReason(e.target.value)}
                          className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-error/50 text-on-surface font-semibold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isDirect && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/30 px-4 py-3 rounded-lg border border-white/20">
                    <p className="text-[11px] font-bold text-outline uppercase">Destinatario</p>
                    <p className="text-sm font-semibold mt-1">{selectedPrePkg?.residentName}</p>
                  </div>
                  <div className="bg-white/30 px-4 py-3 rounded-lg border border-white/20">
                    <p className="text-[11px] font-bold text-outline uppercase">Celular de Destino</p>
                    <p className="text-sm font-bold text-primary mt-1">{selectedPrePkg?.residentPhone}</p>
                  </div>
                </div>
              )}

              {/* Evidencia fotográfica */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-title text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Protocolo de Evidencia Fotográfica
                  </h4>
                  <span className="text-[10px] font-bold text-outline uppercase">3 Capturas de Seguridad</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "foto-etiqueta", label: "1. Etiqueta" },
                    { id: "foto-paquete", label: "2. Paquete" },
                    { id: "foto-remitente", label: "3. Repartidor" }
                  ].map((foto) => (
                    <div
                      key={foto.id}
                      className={`h-24 rounded-lg flex flex-col items-center justify-center border transition-all ${
                        photosSimulated
                          ? "bg-primary-container/10 border-primary/40 text-primary"
                          : "bg-white/40 border-dashed border-outline/30 text-on-surface-variant hover:bg-white/60 cursor-pointer"
                      }`}
                      onClick={() => setPhotosSimulated(true)}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {photosSimulated ? "check_circle" : "photo_camera"}
                      </span>
                      <span className="text-[10px] font-bold tracking-wide uppercase mt-1">{foto.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-outline mt-2 text-center">
                  {photosSimulated ? "✓ Evidencia fotográfica cargada con éxito." : "Haz clic en cualquier cámara para simular la captura de fotos requeridas."}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-5 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={directProtocol !== "rechazado" && !photosSimulated}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-sm font-title font-semibold shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {directProtocol === "rechazado" ? "Confirmar Rechazo y Registrar" : "Confirmar Ingreso y Notificar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL: ENTREGA FÍSICA A RESIDENTE */}
      <AnimatePresence>
      {activeDeliveryPkg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="glass-card max-w-xl w-full p-6 rounded-lg shadow-2xl relative">
            <h3 className="font-title text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">handshake</span>
              Cerrar Ciclo de Entrega
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Entregando el paquete <strong className="text-primary">{activeDeliveryPkg.id}</strong> para {activeDeliveryPkg.residentName} ({activeDeliveryPkg.residentPhone}).
            </p>

            {/* Selector de Método de Verificación */}
            <div className="flex gap-2 mb-6 bg-white/40 p-1 rounded-full border border-white/50 w-fit">
              <button
                type="button"
                onClick={() => setDeliveryMethod("otp")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  deliveryMethod === "otp" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                Código de Retiro
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("firma")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  deliveryMethod === "firma" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                Confirmación Digital
              </button>
            </div>

            {deliveryMethod === "otp" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Ingresar Código de Retiro</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Ej: 8821"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value);
                      setOtpError(false);
                    }}
                    className="w-40 text-center bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-lg font-title font-bold text-primary tracking-widest outline-none focus:ring-2 focus:ring-primary/50 transition-all mx-auto block text-on-surface"
                  />
                  {otpError && (
                    <p className="text-xs text-error font-semibold text-center mt-2">Código incorrecto. Inténtelo nuevamente.</p>
                  )}
                  <p className="text-[11px] text-outline text-center mt-2">
                    Código de simulación: <strong className="text-secondary">{activeDeliveryPkg.otp}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Firme en el recuadro gris</label>
                <div className="bg-surface-container-low rounded-lg overflow-hidden border border-outline/20 relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full bg-white/40 cursor-crosshair block"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute right-3 bottom-3 bg-white/80 hover:bg-white text-on-surface-variant px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">mop</span>
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox Notificar */}
            <div className="mt-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyDelivery"
                checked={notifyDelivery}
                onChange={(e) => setNotifyDelivery(e.target.checked)}
                className="w-4 h-4 text-primary bg-white/50 border-white/40 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="notifyDelivery" className="text-sm font-semibold text-on-surface cursor-pointer flex items-center gap-1.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" />
                Notificar entrega por WhatsApp
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/20 mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveDeliveryPkg(null);
                  setOtpInput("");
                  setOtpError(false);
                }}
                className="px-5 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeliverSubmit}
                className="px-6 py-2.5 rounded-full bg-tertiary text-on-tertiary hover:bg-tertiary/95 transition-all text-sm font-title font-semibold shadow-md shadow-tertiary/10"
              >
                Registrar Entrega Física
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
