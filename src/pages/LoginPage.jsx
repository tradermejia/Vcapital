import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePackages } from "../context/PackageContext";
import { WhatsAppService } from "../lib/WhatsAppService";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { residents, packages, preRegisterPackage } = usePackages();
  const [role, setRole] = useState("residente");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados del Residente
  const [resMode, setResMode] = useState("preregistro"); // preregistro, seguimiento
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("+57");
  const [pkgNotes, setPkgNotes] = useState("");
  const [pkgTracking, setPkgTracking] = useState(""); // Número de guía opcional
  const [hasTracking, setHasTracking] = useState("no"); // yes / no

  // Estado para el código de seguimiento en la búsqueda
  const [trackingCode, setTrackingCode] = useState("");

  // Estados para el Popup de Éxito y Confirmación
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdPkg, setCreatedPkg] = useState(null);
  const [showConfirmPreRegister, setShowConfirmPreRegister] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handlePhoneChange = (val) => {
    setResPhone(val);
    // Buscar si existe un residente registrado con este teléfono
    const cleanInput = val.replace(/[^\d]/g, "");
    if (cleanInput.length >= 7) {
      const matched = residents.find(r => {
        const cleanPhone = r.phone.replace(/[^\d]/g, "");
        return cleanPhone === cleanInput || cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone);
      });
      if (matched) {
        setResName(matched.name);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "residente" && resMode === "preregistro") {
      if (!resName.trim() || !resPhone.trim() || resPhone.trim() === "+57") {
        alert("Por favor ingrese su Nombre y Celular completo.");
        return;
      }
      setAcceptTerms(false);
      setShowConfirmPreRegister(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      if (role === "residente") {
        // Modo seguimiento: Buscar por ID, PIN (OTP), Guía o Celular
        if (!trackingCode.trim()) {
          alert("Ingrese el código de seguimiento, PIN, Número de Guía o Celular");
          return;
        }

        const searchVal = trackingCode.trim().toLowerCase();
        const found = packages.find(
          p => p.id.toLowerCase() === searchVal ||
            p.otp === trackingCode.trim() ||
            (p.trackingNumber && p.trackingNumber.toLowerCase() === searchVal) ||
            p.residentPhone.toLowerCase() === searchVal
        );

        if (found) {
          // Guardamos sesión simulada del residente
          localStorage.setItem("Portier_logged_resident_name", found.residentName);
          localStorage.setItem("Portier_logged_resident_phone", found.residentPhone);

          // Navegamos directo al detalle del paquete consultado
          navigate(`/paquete/${found.id}`);
        } else {
          alert("No se encontró ningún paquete asociado a ese código, código de retiro, guía o celular.");
        }
      } else if (role === "vigilante" || role === "recepcion") {
        navigate("/recepcion");
      } else {
        navigate("/administrador");
      }
    }, 800);
  };

  const handleConfirmPreRegister = () => {
    setLoading(true);
    setShowConfirmPreRegister(false);

    setTimeout(() => {
      setLoading(false);
      const trackingVal = hasTracking === "yes" ? pkgTracking.trim() : "";
      const pkg = preRegisterPackage(resPhone.trim(), resName.trim(), trackingVal, pkgNotes);

      // Guardar sesión para el dashboard posterior del residente
      localStorage.setItem("Portier_logged_resident_name", resName.trim());
      localStorage.setItem("Portier_logged_resident_phone", resPhone.trim());

      // Generar y abrir enlace real a WhatsApp
      const message = `Hola *${pkg.residentName}*. Tu aviso de llegada de paquete con código *${pkg.id}* ha sido creado. Detalle: ${pkg.notes || "Sin notas"}. ${pkg.trackingNumber ? `Guía: *${pkg.trackingNumber}*` : `Código de retiro: *${pkg.otp}*`}.`;
      const link = WhatsAppService.generateWaMeLink(resPhone.trim(), message);
      window.open(link, "_blank");

      // Configurar paquete creado y mostrar el modal flotante
      setCreatedPkg(pkg);
      setShowSuccessPopup(true);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Círculos ambientales para el fondo dinámico */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full filter blur-[80px] pointer-events-none bg-primary/20 z-0 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full filter blur-[80px] pointer-events-none bg-secondary/15 z-0"></div>

      <div className="glass-card max-w-lg w-full p-8 rounded-lg relative z-10 transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-primary-container rounded-full mx-auto flex items-center justify-center text-white font-title text-3xl font-extrabold shadow-lg shadow-primary/25 mb-3">
            P
          </div>
          <h1 className="font-title text-3xl font-bold text-on-surface">Portier</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1.5">
            Recibimos y cuidamos por ti.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Selector de Rol */}
          <div>
            <label className="block font-body text-xs font-bold text-outline mb-2 uppercase tracking-wider text-center">
              Seleccionar Rol de Acceso
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "residente", label: "Residente", icon: "home" },
                { id: "recepcion", label: "Recepción", icon: "shield" },
                { id: "admin", label: "Admin", icon: "admin_panel_settings" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === item.id
                      ? "bg-primary text-on-primary border-primary shadow-md shadow-primary/25"
                      : "bg-white/40 border-white/40 text-on-surface-variant hover:bg-white/60"
                    }`}
                >
                  <span className="material-symbols-outlined mb-1">{item.icon}</span>
                  <span className="text-[10px] font-bold tracking-wide uppercase">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* VISTA RESIDENTE (Sin contraseña, Preregistro / Consulta por PIN) */}
          {role === "residente" && (
            <div className="space-y-4 border-t border-white/20 pt-4">
              <div className="flex gap-2 bg-white/40 p-1 rounded-full border border-white/50 w-full mb-2">
                <button
                  type="button"
                  onClick={() => setResMode("preregistro")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase transition-all ${resMode === "preregistro" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                    }`}
                >
                  Avisar Llegada
                </button>
                <button
                  type="button"
                  onClick={() => setResMode("seguimiento")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase transition-all ${resMode === "seguimiento" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
                    }`}
                >
                  Seguimiento
                </button>
              </div>

              {resMode === "preregistro" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-outline uppercase">Número de Celular</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: +573001234567"
                        value={resPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-outline uppercase">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Camila Gómez"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase font-body">Notas Especiales / Indicaciones</label>
                    <input
                      type="text"
                      placeholder="Ej: Caja de regalo, frágil, dejar en portería..."
                      value={pkgNotes}
                      onChange={(e) => setPkgNotes(e.target.value)}
                      className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                    />
                  </div>

                  <div className="bg-white/30 p-3.5 rounded-lg border border-white/20">
                    <label className="block text-[11px] font-bold text-outline uppercase mb-2">¿Tiene número de guía / tracking?</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-1.5 text-xs text-on-surface font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="hasTracking"
                          value="yes"
                          checked={hasTracking === "yes"}
                          onChange={() => setHasTracking("yes")}
                          className="text-primary focus:ring-primary"
                        />
                        Sí tengo guía
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-on-surface font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="hasTracking"
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
                        <label className="block text-[10px] font-bold text-primary uppercase mb-1">Nº Guía / Tracking de la Transportadora</label>
                        <input
                          type="text"
                          required={hasTracking === "yes"}
                          placeholder="Ej: AMZN-92841"
                          value={pkgTracking}
                          onChange={(e) => setPkgTracking(e.target.value)}
                          className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface uppercase font-bold"
                        />
                      </div>
                    ) : (
                      <p className="text-[10px] text-outline mt-2 italic leading-relaxed">
                        * Se generará un código de retiro de 4 dígitos para que en recepción validen el paquete al recibirlo y para su posterior entrega.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase mb-2">Ingresar Código de Seguimiento, Guía, Celular o Código de Retiro</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">tag</span>
                      <input
                        type="text"
                        required
                        placeholder="Ej: AMZN-99221, NX-88219, 8821 o +573001234567"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="w-full bg-white/50 border border-white/40 rounded-full pl-10 pr-4 py-2.5 text-xs font-body outline-none focus:ring-2 focus:ring-primary/50 text-on-surface uppercase font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-outline mt-2 leading-relaxed">
                      Puede ingresar el <strong>Número de Guía</strong> del transportador (si lo registró), el <strong>Código Interno</strong>, el <strong>Código de Retiro</strong> de 4 dígitos o su número de <strong>Celular</strong> registrado.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTAS RECEPCIÓN / ADMIN (Login simulado rápido) */}
          {role !== "residente" && (
            <div className="space-y-4 border-t border-white/20 pt-4">
              <div>
                <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                  Usuario del Sistema
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                  <input
                    type="text"
                    disabled
                    value={role === "recepcion" ? "recepcion.portier@edificio.com" : "administrador@edificio.com"}
                    className="w-full bg-white/50 border border-white/40 rounded-full pl-10 pr-4 py-2 text-xs font-body text-on-surface opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••"
                    className="w-full bg-white/50 border border-white/40 rounded-full pl-10 pr-4 py-2 text-xs font-body text-on-surface opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-2.5 rounded-full font-semibold font-title shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                Cargando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                {role === "residente" && resMode === "preregistro" ? "Anunciar y Acceder" : "Iniciar Sesión"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/20 pt-4">
          <p className="text-[10px] text-outline tracking-wider font-semibold uppercase">
            Portier Concierge v2.4 · Licencia Activa
          </p>
        </div>
      </div>

      {/* POPUP DE ÉXITO: REGISTRO Y CÓDIGO DE RETIRO/GUÍA DE SEGUIMIENTO */}
      <AnimatePresence>
      {showSuccessPopup && createdPkg && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-card max-w-md w-full p-6 rounded-lg shadow-2xl relative text-center"
          >
            <div className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>

            <h3 className="font-title text-xl font-bold text-on-surface mb-2">
              ¡Paquete Anunciado!
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 font-body">
              Se ha configurado el seguimiento para tu paquete. Conserva las siguientes llaves de búsqueda:
            </p>

            {/* Credenciales en grande */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6 space-y-3">
              {createdPkg.trackingNumber ? (
                <div>
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Número de Guía (Consulta)</p>
                  <p className="font-title text-xl font-black text-primary tracking-wide mt-0.5">{createdPkg.trackingNumber}</p>
                  <p className="text-[9px] text-outline mt-1 italic">Ingresado por usted</p>
                </div>
              ) : (
                <div>
                  <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Código de Retiro Generado (Consulta y Entrega)</p>
                  <p className="font-title text-2xl font-black text-primary tracking-wide mt-0.5">{createdPkg.otp}</p>
                  <p className="text-[9px] text-outline mt-1 italic">Código asignado por el sistema</p>
                </div>
              )}
              <div className="border-t border-primary/10 pt-2">
                <p className="text-[9px] font-bold text-outline uppercase tracking-wider">ID Interno de Portier</p>
                <p className="font-title text-xs font-bold text-on-surface-variant mt-0.5">{createdPkg.id}</p>
              </div>
            </div>

            {/* Simulación visual de WhatsApp */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-lg text-left mb-6 relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-emerald-500 text-base">chat</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">WhatsApp (Simulado)</span>
              </div>
              <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                💬 <strong>Portier:</strong> Hola {createdPkg.residentName}, registramos tu aviso de llegada de paquete. Puedes rastrearlo en la app con: <strong>{createdPkg.trackingNumber || `Código ${createdPkg.otp}`}</strong> (Ref: {createdPkg.id}).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const copyVal = createdPkg.trackingNumber || createdPkg.otp;
                  navigator.clipboard.writeText(copyVal);
                  alert(`Copiado: ${copyVal}`);
                }}
                className="flex-1 px-4 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copiar Llave
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate("/residente");
                }}
                className="flex-1 px-4 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-xs font-title font-semibold shadow-md shadow-primary/10"
              >
                Ir a Mi Panel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL: CONFIRMACIÓN DE AVISO DE LLEGADA EN ACCESO */}
      <AnimatePresence>
      {showConfirmPreRegister && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-card max-w-md w-full p-6 rounded-lg shadow-2xl relative text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>

            <h3 className="font-title text-xl font-bold text-on-surface mb-2">
              ¿Confirmar Aviso de Llegada?
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 font-body">
              Verifica los datos ingresados antes de proceder. Se guardará el aviso de llegada y se abrirá WhatsApp para enviar la confirmación.
            </p>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6 text-left space-y-2.5">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Destinatario</p>
                <p className="text-sm font-semibold text-on-surface">{resName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Celular</p>
                <p className="text-sm font-semibold text-primary">{resPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Detalles / Notas</p>
                <p className="text-sm font-body text-on-surface-variant italic">"{pkgNotes || 'Sin detalles'}"</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Seguimiento</p>
                <p className="text-sm font-semibold text-secondary">
                  {hasTracking === "yes" ? `Guía: ${pkgTracking.toUpperCase()}` : "Se generará código de retiro de 4 dígitos"}
                </p>
              </div>
            </div>

            {/* Checkbox de Términos y Condiciones */}
            <div className="flex items-start gap-2 mb-6 bg-white/10 p-3 rounded-lg border border-white/20 text-left">
              <input
                type="checkbox"
                id="acceptTermsLogin"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary bg-white/50 border-white/40 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="acceptTermsLogin" className="text-xs text-on-surface-variant leading-tight">
                He leído y acepto los <button type="button" onClick={() => window.open("/terminos", "_blank")} className="text-primary hover:underline font-bold">Términos y Condiciones</button> del servicio de paquetería.
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPreRegister(false);
                  setAcceptTerms(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-full border border-outline/20 text-on-surface-variant hover:bg-white/45 transition-all text-xs font-semibold"
              >
                Volver a Editar
              </button>
              <button
                type="button"
                onClick={handleConfirmPreRegister}
                disabled={!acceptTerms}
                className="flex-1 px-4 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/95 transition-all text-xs font-title font-semibold shadow-md shadow-primary/10 disabled:opacity-50"
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
