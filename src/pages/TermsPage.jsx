import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const termsData = [
  {
    id: "info-general",
    title: "1. Información General",
    icon: "info",
    color: "text-primary",
    bgColor: "bg-primary/10",
    content: (
      <div className="space-y-3">
        <p><strong>1.1 Identificación del Servicio:</strong> Nombre del Servicio: Portier.</p>
        <p><strong>1.2 Objeto del Servicio:</strong> Ofrecemos servicios digitales de registro, control, notificaciones y trazabilidad para la recepción, almacenamiento temporal y entrega de paquetes en edificios y conjuntos residenciales. El servicio incluye notificaciones por WhatsApp, y seguimiento en línea.</p>
        <p><strong>1.3 Aceptación de Términos:</strong> Al anunciar la llegada de un paquete o utilizar nuestros servicios, el residente acepta de manera expresa e inequívoca todos los términos aquí establecidos.</p>
      </div>
    )
  },
  {
    id: "definiciones",
    title: "2. Definiciones",
    icon: "menu_book",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Usuario/Cliente:</strong> Residente que utiliza la plataforma Portier.</li>
        <li><strong>Paquete:</strong> Encomienda o caja recibida en la recepción para su custodia temporal.</li>
        <li><strong>Código de Retiro:</strong> Identificador único (PIN de 4 dígitos) generado para retiro de paquetes sin número de guía.</li>
        <li><strong>Número de Guía:</strong> Código de rastreo de la transportadora (Servientrega, Coordinadora, etc.).</li>
        <li><strong>Anuncio:</strong> Registro previo que el residente hace en la app indicando qué espera recibir.</li>
      </ul>
    )
  },
  {
    id: "tarifas",
    title: "3. Tarifas, Dimensiones y Tipos de Paquetes",
    icon: "payments",
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
    content: (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/50 p-5 rounded-xl border-l-4 border-l-primary shadow-sm">
            <h4 className="font-bold text-primary mb-2">Paquete Normal</h4>
            <ul className="text-sm space-y-1 text-on-surface-variant">
              <li>Dimensiones: Hasta 30x30x30 cm</li>
              <li>Peso: Inferior a 5 kg</li>
              <li>Contenido: No frágil ni peligroso</li>
              <li className="font-bold text-on-surface mt-2">Tarifa Base: $1,500 COP</li>
            </ul>
          </div>
          <div className="bg-white/50 p-5 rounded-xl border-l-4 border-l-secondary shadow-sm">
            <h4 className="font-bold text-secondary mb-2">Paquete Extra Dimensionado</h4>
            <ul className="text-sm space-y-1 text-on-surface-variant">
              <li>Dimensiones: Superiores a la normal</li>
              <li>Peso: Superior a 5 kg</li>
              <li>Requiere manejo especial</li>
              <li className="font-bold text-on-surface mt-2">Tarifa Base: $2,000 COP</li>
            </ul>
          </div>
        </div>
        <div className="bg-error-container/20 p-5 rounded-xl border border-error/20">
          <h4 className="font-bold text-error mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Almacenamiento y Penalidad por Tiempo
          </h4>
          <p className="text-sm text-error-content leading-relaxed">
            El primer día de almacenamiento (24 horas) está incluido en la tarifa base. Después de las primeras 24 horas, se cobrará una tarifa de <strong>$1,000 COP por cada día adicional</strong> de bodegaje. El pago total se realiza al momento de recoger físicamente el paquete en recepción.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "proceso",
    title: "4. Proceso de Recepción y Entrega",
    icon: "verified_user",
    color: "text-primary",
    bgColor: "bg-primary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">Aprobación Digital</h4>
          <p className="text-sm">El destinatario tiene la obligación de revisar el registro fotográfico cargado por recepción y aprobar digitalmente el ingreso del paquete mediante Firma a Mano o Código de Retiro OTP. Una vez firmado o aprobado, Portier queda liberado de responsabilidad del contenido interno.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">Entrega Física</h4>
          <p className="text-sm">La entrega solo se hará al presentar el Código de Retiro (PIN) correcto o validando la firma digital presencial. Si desea que un tercero lo reciba, debe proporcionarle el Código de Retiro OTP. Cualquier entrega realizada con el PIN correcto se considerará válida y autorizada por el titular.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">4.2 Forma de Pago</h4>
          <p className="text-sm">El pago se realiza al momento de recoger el paquete. Aceptamos:<br />
            - <strong>Efectivo:</strong> Pago en moneda legal colombiana.<br />
            - <strong>Transferencia Electrónica:</strong> Nequi, Daviplata, Bancolombia.<br />
            - <strong>Transferencia Bancaria:</strong> A cuenta indicada por el personal.<br />
            <em className="text-error">No se aceptan tarjetas de crédito o débito, cheques, ni pagos en moneda extranjera.</em></p>
        </div>
        <div>
          <h4 className="font-bold mb-1">4.3 Política de Actualización de Tarifas</h4>
          <p className="text-sm">PORTIER se reserva el derecho de modificar las tarifas con previo aviso de 15 días calendario a través de notificación en el sitio web, aviso en las instalaciones físicas, o notificación a usuarios registrados (E-Mail, SMS, Whatsapp o llamada telefónica). Las tarifas vigentes al momento del anuncio del paquete serán las aplicables, independientemente de cambios posteriores.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">4.4 Facturación</h4>
          <p className="text-sm">Se emitirá comprobante de pago por cada transacción realizada, este será consultado por medio del código de consulta en la página de consultas, el cual incluirá la fecha y hora de la transacción, el desglose de tarifas aplicadas (ej. Tarifa Base, Almacenamiento), el total a pagar y el total pagado.</p>
        </div>
      </div>
    )
  },
  {
    id: "prohibidos",
    title: "5. Artículos Prohibidos y Limitaciones",
    icon: "gavel",
    color: "text-amber-600",
    bgColor: "bg-amber-500/20",
    content: (
      <div className="text-sm text-amber-900 leading-relaxed space-y-2">
        <p><strong>NO ACEPTADOS:</strong> Sustancias peligrosas, inflamables o tóxicas, armas, drogas, animales vivos, alimentos perecederos, dinero en efectivo, joyas sin declarar, o artículos ilegales.</p>
        <p><strong>Limitaciones:</strong> Portier y la administración del edificio no se hacen responsables por daños preexistentes ocultos, problemas con el contenido si el empaque exterior está intacto, causas de fuerza mayor, o información de contacto incorrecta proporcionada por el usuario.</p>
      </div>
    )
  },
  {
    id: "almacenamiento",
    title: "6. Almacenamiento y Custodia",
    icon: "inventory_2",
    color: "text-primary",
    bgColor: "bg-primary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">6.1 Condiciones de Almacenamiento</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Los paquetes se almacenan en área cerrada con acceso controlado.</li>
            <li>Se mantiene registro fotográfico de cada paquete.</li>
            <li>Se asigna posición física única para fácil localización.</li>
            <li>El área cuenta con medidas de seguridad básicas.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-1">6.2 Tiempo Máximo de Almacenamiento</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Tiempo recomendado: Recoger el paquete dentro de las primeras 24 horas.</li>
            <li>Tiempo máximo sin cargos adicionales: 24 horas.</li>
            <li>Almacenamiento prolongado: Se cobra $1,000 COP por cada día adicional.</li>
            <li>Tiempo máximo absoluto: 30 días calendario.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-1 text-error">6.3 Paquetes No Reclamados</h4>
          <p className="text-sm mb-2">Después de 30 días sin ser reclamado, se intentará contactar al destinatario por SMS, llamada, email o WhatsApp. Si no hay respuesta después de 45 días:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>El paquete será considerado abandonado y se procederá según la legislación colombiana.</li>
            <li>PORTIER podrá devolver el paquete al remitente, donarlo o disponer de él apropiadamente.</li>
            <li>El usuario será responsable de todas las tarifas de almacenamiento, costos administrativos y de devolución.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "responsabilidades",
    title: "7. Responsabilidades y Limitaciones",
    icon: "shield",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">7.1 Responsabilidades de PORTIER</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>Custodia Diligente:</strong> Mantener los paquetes seguros y llevar registro.</li>
            <li><strong>Notificaciones Oportunas:</strong> Enviar anuncios rápidamente y notificar cambios de estado.</li>
            <li><strong>Transparencia:</strong> Información clara sobre tarifas, seguimiento 24/7 y registro fotográfico hasta 30 días post-entrega.</li>
            <li><strong>Atención al Cliente:</strong> Resolver problemas y mantener comunicación clara.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-1">7.2 Limitaciones de Responsabilidad</h4>
          <p className="text-sm mb-2">PORTIER NO será responsable por:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>Daños Preexistentes:</strong> Daños desde el origen, en transporte o no evidentes.</li>
            <li><strong>Contenido:</strong> Pérdida de contenido interno con empaque intacto, artículos prohibidos.</li>
            <li><strong>Fuerza Mayor:</strong> Desastres naturales, pandemias, cortes de energía.</li>
            <li><strong>Actos de Terceros:</strong> Robos con violencia, acciones de transportadoras o autoridades.</li>
            <li><strong>Información Incorrecta:</strong> Entregas erróneas por datos mal proporcionados.</li>
          </ul>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg mt-3">
          <h4 className="font-bold mb-1">Valor Máximo de Responsabilidad</h4>
          <p className="text-sm">En caso de pérdida o daño atribuible a PORTIER, la responsabilidad estará limitada a máximo $200,000 COP por paquete, o 10 veces el valor de la tarifa cobrada (lo que sea menor).</p>
        </div>
        <div className="mt-4 pt-4 border-t border-outline/10">
          <h4 className="font-bold mb-1">7.3 Responsabilidades del Usuario</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>Información Veraz:</strong> Proporcionar datos correctos y actualizar si cambia.</li>
            <li><strong>Recogida Oportuna:</strong> Recoger rápido, pagar tarifas y verificar antes de firmar.</li>
            <li><strong>Contenido Permitido:</strong> No enviar prohibidos, declarar frágiles y empacar bien.</li>
            <li><strong>Cumplimiento:</strong> Respetar términos e instrucciones del personal.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "datos",
    title: "8. Protección de Datos Personales",
    icon: "security",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/20",
    content: (
      <div className="space-y-4 text-emerald-900">
        <div>
          <h4 className="font-bold mb-1">8.1 Recopilación de Datos</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Nombre, Teléfono, Dirección (opcional), Email (opcional).</li>
            <li>Fotografías del paquete (del exterior, no del contenido).</li>
            <li>Historial de transacciones.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-1">8.2 Uso y Protección (Ley 1581 de 2012)</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Gestión del servicio, notificaciones y mejora continua.</li>
            <li>Implementación de medidas de seguridad técnicas y organizativas.</li>
            <li>No compartimos datos con terceros sin consentimiento (excepto obligación legal).</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-1">8.4 Derechos del Usuario</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Conocer, actualizar, rectificar y revocar autorización.</li>
            <li>Presentar quejas ante la SIC. Contacto: PORTIER@soyportier.com.co</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "notificaciones",
    title: "9. Notificaciones y Comunicaciones",
    icon: "campaign",
    color: "text-primary",
    bgColor: "bg-primary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">9.1 Medios de Notificación</h4>
          <p className="text-sm mb-2">SMS, Email, WhatsApp, Sitio Web o Avisos en el local.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">9.2 Responsabilidad del Usuario</h4>
          <p className="text-sm">Mantener actualizado su teléfono, verificar estado de paquetes y leer notificaciones.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">9.3 Validez</h4>
          <p className="text-sm">Se considerará recibida cuando fue entregada exitosamente, el email no rebote, o pasen 24h de publicación web.</p>
        </div>
      </div>
    )
  },
  {
    id: "reclamaciones",
    title: "10. Reclamaciones y Conflictos",
    icon: "gavel",
    color: "text-error",
    bgColor: "bg-error/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">10.1 Procedimiento</h4>
          <p className="text-sm">Presentar dentro de 48 horas siguientes al evento, vía presencial, email o teléfono. Se requiere nombre, código de seguimiento, descripción y evidencias. PORTIER evaluará en máximo 5 días hábiles.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">10.2 Soluciones y Arbitraje</h4>
          <p className="text-sm">Soluciones: devolución total/parcial, compensación o disculpa. Mediación voluntaria, SIC o jurisdicción en Cartagena. Las reclamaciones prescriben a los 6 meses de la entrega o 1 año desde el anuncio si no se reclama.</p>
        </div>
      </div>
    )
  },
  {
    id: "modificaciones",
    title: "11. Modificaciones y 12. Horarios",
    icon: "event",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">Modificaciones y Suspensión</h4>
          <p className="text-sm">Cambios con 15 días de previo aviso. Suspensión temporal por mantenimiento (48h aviso), emergencias o festivos. No se cobra bodegaje en días de suspensión.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">Horario Regular</h4>
          <p className="text-sm">Lunes a Viernes de 9:30 AM a 7:00 PM (Hora de Colombia UTC-5). No laboramos sábados, domingos ni festivos nacionales o locales (Cartagena).</p>
        </div>
      </div>
    )
  },
  {
    id: "conducta",
    title: "13. Código de Conducta",
    icon: "front_hand",
    color: "text-amber-600",
    bgColor: "bg-amber-500/20",
    content: (
      <div className="text-sm text-amber-900 leading-relaxed">
        <p>Tratar al personal con respeto. Prohibido: lenguaje ofensivo, violencia, alcohol/drogas, fumar, grabar sin autorización. Consecuencias: advertencia, negación del servicio o prohibición permanente.</p>
      </div>
    )
  },
  {
    id: "finales",
    title: "14-17. Disposiciones Finales y Aceptación",
    icon: "policy",
    color: "text-primary",
    bgColor: "bg-primary/10",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold mb-1">14. Propiedad Intelectual</h4>
          <p className="text-sm">Nombre, sitio web, sistema, logos y software son propiedad de PORTIER. Prohibida su copia, distribución o ingeniería inversa.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">15. Disposiciones Finales</h4>
          <p className="text-sm">Regido por la ley de Colombia (Estatuto del Consumidor, Ley 1581 de 2012). Jurisdicción en Cartagena, Colombia.</p>
        </div>
        <div>
          <h4 className="font-bold mb-1">16. Información de Contacto</h4>
          <p className="text-sm">Cra. 91 #54-120, Local 12 - El Club Apartamentos. Tel: (333) 400-4007. Email: PORTIER@soyportier.com.co</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg mt-3 border border-primary/20">
          <h4 className="font-bold mb-1">17. Aceptación y Consentimiento</h4>
          <p className="text-sm">Al utilizar los servicios de PORTIER, el usuario declara que ha leído, comprendido y aceptado expresamente estos términos y condiciones en su totalidad.</p>
        </div>
      </div>
    )
  }
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className="min-h-screen bg-background p-4 md:p-6 font-body text-on-surface pb-20"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 sticky top-4 md:top-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-outline/20 flex items-center justify-center text-primary hover:bg-white hover:scale-105 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-outline/20 shadow-sm">
            <h1 className="font-title text-xl font-bold text-primary">Términos y Condiciones</h1>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-4 md:p-8 rounded-2xl space-y-6 shadow-xl border-t-4 border-t-primary">
          <div className="text-center pb-6 border-b border-outline/10">
            <h2 className="font-title text-2xl md:text-3xl font-bold text-on-surface mb-2">Servicio de Paquetería Portier</h2>
            <p className="text-on-surface-variant text-sm md:text-base font-semibold">Versión: 1.0 | Última Actualización: Junio 2026</p>
          </div>

          <div className="space-y-4">
            {termsData.map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div
                  key={section.id}
                  className={`border border-outline/20 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'shadow-md ring-2 ring-primary/20' : 'hover:border-primary/30'}`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${section.bgColor} ${section.color}`}>
                        <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                      </div>
                      <h3 className={`font-title text-base md:text-lg font-bold ${section.color}`}>
                        {section.title}
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-transparent text-outline'}`}>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="material-symbols-outlined"
                      >
                        expand_more
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 md:p-6 pt-0 md:pt-0 text-on-surface-variant">
                          <div className="pt-4 border-t border-outline/10">
                            {section.content}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-outline/10 text-center text-xs text-on-surface-variant">
            © 2025-2026 PORTIER. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
