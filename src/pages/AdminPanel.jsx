import { useState, useEffect } from "react";
import { usePackages } from "../context/PackageContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const { packages, residents, toggleResidentStatus, addResident } = usePackages();
  const navigate = useNavigate();

  // Estados
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, residentes, auditoria, config
  const [modelType, setModelType] = useState("suscripcion"); // suscripcion, transaccion
  
  // Agregar residente
  const [newPhone, setNewPhone] = useState("+57");
  const [newResident, setNewResident] = useState("");

  // Configuración WhatsApp
  const [waChannel, setWaChannel] = useState("meta_api"); // wa_link, meta_api, twilio
  const [metaToken, setMetaToken] = useState("EAAGz8D8oZB6IBANQWpZC...[MOCK_TOKEN]...");
  const [metaPhoneId, setMetaPhoneId] = useState("10293847102938");
  const [whatsappLogs, setWhatsappLogs] = useState([]);

  // Cargar logs de WhatsApp
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("portier_whatsapp_logs") || "[]");
    setWhatsappLogs(logs);
  }, [activeTab]);

  const handleAddResidentSubmit = (e) => {
    e.preventDefault();
    if (!newPhone.trim() || !newResident.trim() || newPhone.trim() === "+57") return;
    const success = addResident(newResident.trim(), newPhone.trim());
    if (success) {
      setNewPhone("+57");
      setNewResident("");
      alert("Residente agregado exitosamente");
    } else {
      alert("El número de celular ya está registrado para otro residente");
    }
  };

  // Cálculos estadísticos generales
  const totalPkgs = packages.length;
  const deliveredPkgs = packages.filter(p => p.status === "entregado").length;
  const inBodegaPkgs = packages.filter(p => ["recibido", "autorizado", "inesperado"].includes(p.status)).length;
  const rejectedPkgs = packages.filter(p => p.status === "rechazado").length;

  // Promedio de tiempo de autorización (en minutos) simulado
  const avgAuthTime = 12.8; // minutos

  // Gráfico 1: Volumen de paquetes por día (Mock estructurado a partir del estado de paquetes)
  const volumeData = [
    { name: "Lunes", cantidad: packages.filter(p => p.preRegisteredAt?.includes("15") || p.receivedAt?.includes("15")).length + 3 },
    { name: "Martes", cantidad: 4 },
    { name: "Miércoles", cantidad: 6 },
    { name: "Jueves", cantidad: 5 },
    { name: "Viernes", cantidad: 8 },
    { name: "Sábado", cantidad: totalPkgs }
  ];

  // Gráfico 2: Tiempos de entrega promedio
  const speedData = [
    { hora: "08:00", minutos: 15 },
    { hora: "10:00", minutos: 20 },
    { hora: "12:00", minutos: 12 },
    { hora: "14:00", minutos: 14 },
    { hora: "16:00", minutos: 10 },
    { hora: "18:00", minutos: 8 }
  ];

  // Simulación de cobro (Modelo de Negocio COP)
  const subscriptionFee = 250000; // Suscripción mensual fija COP
  const perTxFee = 800; // Tarifa por transacción COP
  const simulatedCost = modelType === "suscripcion" ? subscriptionFee : totalPkgs * perTxFee;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className="min-h-screen bg-background p-4 md:p-6 font-body text-on-surface pb-20"
    >
      {/* Header del Administrador */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-title text-3xl font-bold text-on-surface">Administración Portier</h1>
          <p className="font-body text-on-surface-variant mt-1">
            Conserjería Digital Inteligente · Reportes y Gestión de Residentes
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
        </div>
      </div>

      {/* Tabs de Navegación del Panel de Administración */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 bg-white/40 p-1 rounded-2xl md:rounded-full border border-white/50 w-full md:w-fit justify-center md:justify-start">
        {[
          { id: "dashboard", label: "Estadísticas", icon: "insert_chart" },
          { id: "residentes", label: "Residentes", icon: "group" },
          { id: "auditoria", label: "Auditoría Global", icon: "history_edu" },
          { id: "config", label: "Canales y Negocio", icon: "payments" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER TAB: DASHBOARD / ESTADÍSTICAS */}
      {activeTab === "dashboard" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tarjetas Bento de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider">Paquetes Totales (Mes)</p>
              <h3 className="font-title text-3xl font-bold text-on-surface mt-2">{totalPkgs}</h3>
              <p className="text-xs text-tertiary font-semibold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span> +14.2% vs mes anterior
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider">En Recepción</p>
              <h3 className="font-title text-3xl font-bold text-primary mt-2">{inBodegaPkgs}</h3>
              <p className="text-xs text-on-surface-variant mt-2">Esperando entrega física</p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider">T. Promedio Aprobación</p>
              <h3 className="font-title text-3xl font-bold text-secondary mt-2">{avgAuthTime} min</h3>
              <p className="text-xs text-tertiary font-semibold mt-2">Ahorro en llamadas telefónicas</p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider">Tasa de Aprobación</p>
              <h3 className="font-title text-3xl font-bold text-tertiary mt-2">
                {totalPkgs > 0 ? Math.round(((totalPkgs - rejectedPkgs) / totalPkgs) * 100) : 100}%
              </h3>
              <p className="text-xs text-error font-semibold mt-2">
                {rejectedPkgs} paquete(s) rechazado(s) por seguridad
              </p>
            </div>
          </div>

          {/* Gráficos Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-lg h-[350px] flex flex-col">
              <h4 className="font-title text-base font-bold text-on-surface mb-6">Volumen Diario de Paquetes</h4>
              <div className="flex-1 w-full text-xs font-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#707884" />
                    <YAxis stroke="#707884" />
                    <Tooltip cursor={{ fill: "rgba(0,153,255,0.04)" }} />
                    <Bar dataKey="cantidad" fill="#0061a5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-lg h-[350px] flex flex-col">
              <h4 className="font-title text-base font-bold text-on-surface mb-6">Tiempos de Respuesta Promedio (Hora del Día)</h4>
              <div className="flex-1 w-full text-xs font-body">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="hora" stroke="#707884" />
                    <YAxis stroke="#707884" label={{ value: "minutos", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="minutos" stroke="#a73a15" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB: RESIDENTES */}
      {activeTab === "residentes" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario Agregar Residente */}
          <div className="lg:col-span-4 glass-card p-6 rounded-lg">
            <h3 className="font-title text-lg font-bold text-on-surface mb-6 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">person_add</span>
              Registrar Residente
            </h3>
            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Nombre del Residente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Clara Inés Ochoa"
                  value={newResident}
                  onChange={(e) => setNewResident(e.target.value)}
                  className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Número de Celular (Celular Único)</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +573001234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold font-title shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-[1px] transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Guardar Residente
              </button>
            </form>
          </div>

          {/* Listado de Residentes */}
          <div className="lg:col-span-8 glass-card p-6 rounded-lg">
            <h3 className="font-title text-lg font-bold text-on-surface mb-6 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">group</span>
              Gestión de Residentes Autorizados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline/10 text-outline text-xs uppercase font-semibold">
                    <th className="py-4 px-4">Celular (ID Único)</th>
                    <th className="py-4 px-4">Nombre del Residente</th>
                    <th className="py-4 px-4">Estado del Buzón</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((res) => (
                    <tr key={res.phone} className="border-b border-outline/5 hover:bg-white/30 transition-all font-body text-on-surface">
                      <td className="py-4 px-4 font-bold text-primary">{res.phone}</td>
                      <td className="py-4 px-4 font-semibold">{res.name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          res.active ? "bg-tertiary-container/20 text-tertiary" : "bg-error-container/20 text-error"
                        }`}>
                          {res.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleResidentStatus(res.phone)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            res.active
                              ? "bg-error-container/15 text-error hover:bg-error/15"
                              : "bg-tertiary-container/15 text-tertiary hover:bg-tertiary/15"
                          }`}
                        >
                          {res.active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB: AUDITORÍA */}
      {activeTab === "auditoria" && (
        <div className="max-w-7xl mx-auto glass-card p-6 rounded-lg">
          <h3 className="font-title text-lg font-bold text-on-surface mb-6 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary">history_edu</span>
            Registro Digital e Historial de Seguimiento
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline/10 text-outline text-xs uppercase font-semibold">
                  <th className="py-4 px-4">Ref</th>
                  <th className="py-4 px-4">Celular de Destino</th>
                  <th className="py-4 px-4">Destinatario</th>
                  <th className="py-4 px-4">Identificación / Guía</th>
                  <th className="py-4 px-4">Estado</th>
                  <th className="py-4 px-4">Firmado Por</th>
                  <th className="py-4 px-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-outline/5 hover:bg-white/30 transition-all font-body text-on-surface">
                    <td className="py-4 px-4 font-bold text-primary">{pkg.id}</td>
                    <td className="py-4 px-4 font-bold">{pkg.residentPhone}</td>
                    <td className="py-4 px-4 font-semibold">{pkg.residentName}</td>
                    <td className="py-4 px-4 font-semibold">
                      {pkg.trackingNumber ? `Guía: ${pkg.trackingNumber}` : `Retiro: ${pkg.otp}`}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        pkg.status === "entregado"
                          ? "bg-tertiary-container/20 text-tertiary"
                          : pkg.status === "rechazado"
                          ? "bg-error-container/20 text-error"
                          : pkg.status === "inesperado"
                          ? "bg-amber-500/20 text-amber-700"
                          : "bg-primary-container/20 text-primary"
                      }`}>
                        {pkg.status === "pre_registrado" ? "anunciado" : pkg.status === "recibido" ? "por aprobar" : pkg.status === "autorizado" ? "aprobado" : pkg.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 italic text-outline">
                      {pkg.signature || "Pendiente"}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => navigate(`/paquete/${pkg.id}`)}
                        className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all inline-flex items-center"
                        title="Ver Seguimiento Completo"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER TAB: CONFIG / NEGOCIO Y WHATSAPP */}
      {activeTab === "config" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Seccion WhatsApp Config */}
          <div className="glass-card p-8 rounded-lg">
            <h3 className="font-title text-xl font-bold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-500">chat</span>
              Configuración de Canales de WhatsApp e Historial de Auditoría
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Portier utiliza APIs para la automatización de notificaciones. Aquí puede simular el comportamiento de su pasarela de envíos oficiales.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { id: "wa_link", label: "WhatsApp Web Link (wa.me)", desc: "Envío indirecto abriendo pestaña en el navegador." },
                { id: "meta_api", label: "Meta Cloud API (Oficial)", desc: "Envío directo programático en segundo plano." },
                { id: "twilio", label: "Twilio API SMS/WA", desc: "Entrega confiable por pasarela SMS y WhatsApp." }
              ].map(chan => (
                <div
                  key={chan.id}
                  onClick={() => setWaChannel(chan.id)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    waChannel === chan.id ? "bg-emerald-500/5 border-emerald-500" : "bg-white/40 border-white/40 hover:bg-white/60"
                  }`}
                >
                  <div>
                    <h4 className="font-title text-sm font-bold text-on-surface">{chan.label}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">{chan.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-4">
                    {waChannel === chan.id ? "✓ Seleccionado" : "Usar este canal"}
                  </span>
                </div>
              ))}
            </div>

            {waChannel !== "wa_link" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/30 p-4 rounded-lg border border-white/20 mb-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">Bearer Token de API</label>
                  <input
                    type="text"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-emerald-500/50 text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-2">ID de Número de Teléfono (API ID)</label>
                  <input
                    type="text"
                    value={metaPhoneId}
                    onChange={(e) => setMetaPhoneId(e.target.value)}
                    className="w-full bg-white/50 border border-white/40 rounded-full px-4 py-2 text-xs font-body outline-none focus:ring-2 focus:ring-emerald-500/50 text-on-surface font-mono"
                  />
                </div>
              </div>
            )}

            {/* Historial de logs */}
            <div className="mt-8 border-t border-white/20 pt-6">
              <h4 className="font-title text-base font-bold text-on-surface mb-4">Registro de Notificaciones WhatsApp (Auditoría en Tiempo Real)</h4>
              
              {whatsappLogs.length === 0 ? (
                <div className="text-center py-6 bg-white/25 rounded-lg border border-dashed border-outline/10 text-xs text-on-surface-variant font-body">
                  No hay notificaciones enviadas registradas en el historial local.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline/10 text-outline uppercase font-semibold">
                        <th className="py-2.5 px-3">ID Log</th>
                        <th className="py-2.5 px-3">Hora</th>
                        <th className="py-2.5 px-3">Teléfono</th>
                        <th className="py-2.5 px-3">Plantilla</th>
                        <th className="py-2.5 px-3">Mensaje Transmitido</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatsappLogs.map(log => (
                        <tr key={log.id} className="border-b border-outline/5 hover:bg-white/20 transition-all font-body text-on-surface">
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">{log.id}</td>
                          <td className="py-2.5 px-3 text-outline">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-semibold">{log.phone}</td>
                          <td className="py-2.5 px-3"><span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{log.templateName}</span></td>
                          <td className="py-2.5 px-3 text-on-surface-variant truncate max-w-[200px]" title={log.message}>{log.message}</td>
                          <td className="py-2.5 px-3"><span className="bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase">{log.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modelo de Negocio */}
          <div className="glass-card p-8 rounded-lg">
            <h3 className="font-title text-xl font-bold text-on-surface mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">payments</span>
              Simulación de Modelo de Negocio (Viabilidad Operativa)
            </h3>
            <p className="text-sm text-on-surface-variant mb-8">
              Compara la rentabilidad y el cobro sugerido para las administraciones de los edificios según la volumen de paquetes mensual procesados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  modelType === "suscripcion"
                    ? "bg-primary/5 border-primary"
                    : "bg-white/40 border-white/40 hover:bg-white/60"
                }`}
                onClick={() => setModelType("suscripcion")}
              >
                <h4 className="font-title text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Suscripción Mensual Fija
                </h4>
                <p className="text-sm text-on-surface-variant mt-2">
                  Tarifa fija mensual ilimitada para el edificio. Ideal para simplificar la facturación.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-outline uppercase">$</span>
                  <span className="text-3xl font-title font-bold text-primary">250.000</span>
                  <span className="text-xs font-semibold text-outline">COP / Mes</span>
                </div>
              </div>

              <div
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  modelType === "transaccion"
                    ? "bg-primary/5 border-primary"
                    : "bg-white/40 border-white/40 hover:bg-white/60"
                }`}
                onClick={() => setModelType("transaccion")}
              >
                <h4 className="font-title text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  Tarifa por Transacción
                </h4>
                <p className="text-sm text-on-surface-variant mt-2">
                  Cobro basado estrictamente en el número de paquetes registrados en la recepción.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-outline uppercase">$</span>
                  <span className="text-3xl font-title font-bold text-primary">800</span>
                  <span className="text-xs font-semibold text-outline">COP / Paquete</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-title text-base font-bold text-primary">Liquidación de Cobro Simulada</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Basada en un volumen de <strong className="text-on-surface">{totalPkgs} paquetes</strong> registrados este mes.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-outline uppercase">Total a Facturar:</span>
                <h2 className="text-4xl font-title font-extrabold text-primary mt-1">
                  ${simulatedCost.toLocaleString("es-CO")} <span className="text-xs font-bold text-outline">COP</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
