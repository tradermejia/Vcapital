# 📦 Portier — Conserje Digital Inteligente

> **Sistema de gestión inteligente de paquetería residencial** con trazabilidad completa, notificaciones por WhatsApp, firma digital y pagos automatizados vía Bancolombia.

**Nombre interno:** `Vcapital` / `Portier`  
**Producto:** Portier Concierge v2.4  
**Arquitectura:** Clean Architecture (Domain-Driven)  
**Estado:** ✅ MVP en producción

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura y Estructura de Carpetas](#-arquitectura-y-estructura-de-carpetas)
- [Modelo de Dominio](#-modelo-de-dominio)
- [Roles y Rutas](#-roles-y-rutas)
- [Flujo de Paquetes (Ciclo de Vida)](#-flujo-de-paquetes-ciclo-de-vida)
- [Integraciones Externas](#-integraciones-externas)
- [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue](#-despliegue)
- [Protocolo de Agente IA](#-protocolo-de-agente-ia)

---

## 🏢 Descripción General

**Portier** es una aplicación PWA (Progressive Web App) diseñada para la gestión integral de paquetería en conjuntos residenciales y edificios. Cubre el ciclo completo desde que un residente pre-registra un envío hasta su entrega final con evidencia fotográfica, firma digital y notificación automatizada.

### Características Principales

| Funcionalidad | Descripción |
|---|---|
| 🏠 **Pre-registro de paquetes** | El residente anticipa la llegada de su envío desde la app |
| 🛡️ **Recepción por vigilante** | El vigilante registra el paquete con fotos de evidencia (etiqueta, paquete, contexto) |
| ✍️ **Autorización con firma** | El residente autoriza digitalmente el retiro del paquete |
| 🚚 **Entrega con trazabilidad** | El vigilante marca la entrega final; el ciclo queda cerrado |
| 🔐 **PIN de retiro (OTP)** | Código de 4 dígitos generado automáticamente cuando no hay número de guía |
| 💬 **Notificaciones WhatsApp** | Generación de enlaces `wa.me` y logs de mensajes simulados |
| 💳 **Pagos Bancolombia** | Integración con la API Button Payment (Sandbox) |
| 📱 **PWA Offline-Ready** | Instalable como app nativa con service worker (vite-plugin-pwa) |

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 19.x |
| Build tool | Vite | 8.x |
| Routing | React Router DOM | 7.x |
| Animaciones | Framer Motion | 12.x |
| Iconografía | Lucide React + Material Symbols | — |
| Gráficas | Recharts | 3.x |
| Estilos | TailwindCSS v4 + CSS custom (glassmorphism) | 4.x |
| Tipografía | Google Fonts (Montserrat + Inter) | — |
| PWA | vite-plugin-pwa | 0.21.x |
| Persistencia | LocalStorage (sin backend) | — |
| Pagos | Bancolombia API (Sandbox) | v2 |

---

## 🏗 Arquitectura y Estructura de Carpetas

El proyecto sigue **Clean Architecture** con separación estricta en 3 capas:

```
c:\Vcapital\
├── index.html                    # Entry point HTML (lang=es)
├── vite.config.js                # Vite + React + Tailwind + PWA config
├── netlify.toml                  # Deploy config Netlify (SPA redirect)
├── vercel.json                   # Deploy config Vercel (SPA rewrite)
├── package.json                  # Dependencias y scripts
├── .env.example                  # Variables de entorno requeridas
├── instrucciones_agente.md       # Protocolo militar para agentes IA
│
└── src/
    ├── main.jsx                  # Bootstrap: BrowserRouter + PWA register
    ├── App.jsx                   # Router principal con rutas por rol
    ├── index.css                 # Design tokens + glassmorphism + animaciones
    │
    ├── domain/                   # 🧠 CAPA DE DOMINIO (Reglas de negocio puras)
    │   ├── entities/
    │   │   ├── Package.js        # Entidad Paquete (17 propiedades, OTP auto)
    │   │   └── Resident.js       # Entidad Residente (name, phone, active)
    │   ├── repositories/
    │   │   ├── PackageRepository.js   # Contrato abstracto (getAll, save, update)
    │   │   └── ResidentRepository.js  # Contrato abstracto (getAll, saveAll)
    │   └── usecases/
    │       ├── PreRegisterPackage.js   # Crear paquete con status pre_registrado
    │       ├── ReceivePackage.js       # Vigilante recibe paquete existente
    │       ├── ReceiveDirectPackage.js # Vigilante crea y recibe sin pre-registro
    │       ├── AuthorizePackage.js     # Residente autoriza con firma digital
    │       ├── RejectPackage.js        # Residente rechaza con razón
    │       ├── DeliverPackage.js       # Vigilante marca entrega final
    │       └── ManageResidents.js      # CRUD de residentes (add, toggleStatus)
    │
    ├── data/                     # 💾 CAPA DE DATOS (Implementaciones concretas)
    │   └── repositories/
    │       ├── LocalStoragePackageRepository.js  # Persistencia en localStorage
    │       └── LocalStorageResidentRepository.js # Persistencia en localStorage
    │
    ├── context/                  # 🔌 CAPA DE PRESENTACIÓN - Estado global
    │   └── PackageContext.jsx    # React Context: instancia use cases, provee acciones
    │
    ├── pages/                    # 📄 CAPA DE PRESENTACIÓN - Vistas por rol
    │   ├── LoginPage.jsx         # Acceso + Pre-registro + Seguimiento por PIN/guía
    │   ├── ResidentDashboard.jsx # Dashboard completo del residente
    │   ├── GuardPanel.jsx        # Panel del vigilante (recepción, fotos, entrega)
    │   ├── AdminPanel.jsx        # Panel administrador (gestión, métricas, residentes)
    │   └── PackageDetail.jsx     # Vista de trazabilidad y timeline del paquete
    │
    ├── components/               # 🧩 Componentes reutilizables
    │   └── BancolombiaPaymentButton.jsx  # Botón de pago con estados (idle/loading/success/error)
    │
    ├── services/                 # 🌐 Servicios externos
    │   └── bancolombiaService.js # OAuth2 + Button Payment API
    │
    ├── lib/                      # 📚 Utilidades
    │   ├── WhatsAppService.js    # Generador de enlaces wa.me + logs simulados
    │   └── icons.jsx             # Re-export centralizado de Lucide React icons
    │
    └── assets/                   # 🎨 Recursos estáticos
        ├── hero.png
        ├── react.svg
        └── vite.svg
```

### Flujo de Dependencias (Clean Architecture)

```
┌──────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                      │
│  pages/ ──→ context/PackageContext ──→ components/   │
└───────────────────────┬──────────────────────────────┘
                        │ usa
┌───────────────────────▼──────────────────────────────┐
│                      DOMINIO                         │
│  usecases/ ──→ entities/ ──→ repositories/ (contratos)│
└───────────────────────┬──────────────────────────────┘
                        │ implementa
┌───────────────────────▼──────────────────────────────┐
│                       DATOS                          │
│  data/repositories/ (LocalStorage implementations)   │
└──────────────────────────────────────────────────────┘
```

---

## 🧠 Modelo de Dominio

### Entidad `Package`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Código interno (formato: `NX-XXXXX`) |
| `title` | `string` | Descripción del contenido (default: `"Envío"`) |
| `residentName` | `string` | Nombre completo del destinatario |
| `residentPhone` | `string` | Celular con código de país (`+57...`) |
| `trackingNumber` | `string` | Número de guía del transportador (opcional) |
| `status` | `enum` | `pre_registrado` → `recibido` → `autorizado` → `entregado` / `rechazado` |
| `notes` | `string` | Indicaciones especiales del residente |
| `preRegisteredAt` | `ISO string` | Timestamp del pre-registro |
| `receivedAt` | `ISO string` | Timestamp de recepción en portería |
| `authorizedAt` | `ISO string` | Timestamp de autorización o rechazo |
| `deliveredAt` | `ISO string` | Timestamp de entrega final |
| `guardName` | `string` | Nombre del vigilante que recibió |
| `rejectReason` | `string` | Motivo de rechazo (si aplica) |
| `otp` | `string` | PIN de 4 dígitos (generado cuando no hay guía) |
| `signature` | `string` | Firma digital del residente |
| `photos` | `object` | `{ label, package, context }` — URLs de evidencia fotográfica |

### Entidad `Resident`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Nombre completo |
| `phone` | `string` | Celular con código de país |
| `active` | `boolean` | Si puede recibir paquetes |

### Transportadoras Colombianas Soportadas

`Servientrega` · `Envía` · `Interrapidísimo` · `Coordinadora` · `Deprisa` · `TCC` · `4-72` · `Mensajeros Urbanos` · `Rappi` · `FedEx` · `DHL` · `Amazon` · `MercadoLibre` · `Particular`

---

## 🔐 Roles y Rutas

| Rol | Ruta | Funcionalidades |
|---|---|---|
| **Residente** | `/` `/login` → `/residente` | Pre-registro de paquetes, seguimiento por PIN/guía/celular, autorizar/rechazar, ver timeline |
| **Vigilante (Recepción)** | `/vigilante` | Recibir paquetes (con fotos), recepción directa (sin pre-registro), entregar paquetes autorizados |
| **Administrador** | `/administrador` | Gestión de residentes (CRUD), métricas y estadísticas, auditoría de todos los paquetes |
| **Detalle** | `/paquete/:id` | Timeline visual, fotos de evidencia, datos de trazabilidad completa |

> **Autenticación:** Simulada. Los roles de vigilante y admin usan credenciales pre-llenadas. Los residentes acceden por celular.

---

## 🔄 Flujo de Paquetes (Ciclo de Vida)

```
┌─────────────┐    ┌───────────┐    ┌─────────────┐    ┌────────────┐
│ pre_registrado│───→│  recibido  │───→│  autorizado  │───→│  entregado  │
│  (Residente) │    │ (Vigilante)│    │  (Residente) │    │ (Vigilante) │
└─────────────┘    └───────────┘    └──────┬──────┘    └────────────┘
                         │                 │
                         │            ┌────▼─────┐
                         │            │ rechazado │
                         │            │(Residente)│
                         │            └──────────┘
                         │
                    ┌────▼──────────┐
                    │ Recep. Directa│ (Sin pre-registro)
                    │  (Vigilante)  │
                    └───────────────┘
```

**Estados posibles:** `pre_registrado` · `recibido` · `autorizado` · `rechazado` · `entregado`

---

## 🌐 Integraciones Externas

### 1. WhatsApp (`lib/WhatsAppService.js`)
- **Generación de enlaces** `wa.me` con código de país Colombia (+57)
- **Templates de mensaje:** `delivery_alert`, `preregister_confirm`
- **Logs simulados** en `localStorage` bajo la key `portier_whatsapp_logs`

### 2. Bancolombia Button Payment (`services/bancolombiaService.js`)
- **OAuth2** Client Credentials para obtener token
- **Button Payment API** (Sandbox QA) para pagos automáticos
- **Headers de trazabilidad:** device fingerprint, geolocalización, UUID por transacción
- ⚠️ **Nota de seguridad:** El `CLIENT_SECRET` debe moverse a un backend en producción

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tradermejia/Vcapital.git
cd Vcapital

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Build de producción
npm run build

# 6. Preview del build
npm run preview
```

---

## 🔑 Variables de Entorno

| Variable | Descripción |
|---|---|
| `VITE_BANCOLOMBIA_CLIENT_ID` | Client ID de la API Bancolombia |
| `VITE_BANCOLOMBIA_CLIENT_SECRET` | Client Secret de la API Bancolombia |
| `VITE_BANCOLOMBIA_OAUTH_URL` | URL del endpoint OAuth2 (default: Sandbox QA) |
| `VITE_BANCOLOMBIA_API_URL` | URL del endpoint Button Payment (default: Sandbox QA) |

---

## ☁️ Despliegue

La aplicación está configurada para despliegue en **Netlify** y **Vercel** con manejo de SPA (redirección `/* → /index.html`).

| Plataforma | Config | Comando |
|---|---|---|
| **Netlify** | `netlify.toml` | `npm run build` → `dist/` |
| **Vercel** | `vercel.json` | `npm run build` → `dist/` |

---

## 🎖️ Protocolo de Agente IA

Este repositorio está sujeto a directrices operativas de comportamiento militar para agentes de IA. Para los detalles completos del protocolo de comunicación, desarrollo y diseño, consulte el archivo de [Instrucciones de Agente](instrucciones_agente.md).

### Resumen del Protocolo

- 🗣️ **Idioma:** Exclusivamente español
- 🎖️ **Saludo:** Iniciar cada respuesta con `"Señor,"`
- 📐 **Estilo:** Directo, estructurado, pedagógico con analogías claras
- ✅ **Plan obligatorio:** Crear plan en Markdown y solicitar aprobación antes de ejecutar
- 🚫 **Prohibido:** Suponer infraestructura, APIs o configuraciones no documentadas
- 🔍 **Prioridad:** Análisis y diagnóstico sobre generación masiva de código

---

## 🗄️ Persistencia (LocalStorage)

| Key | Contenido |
|---|---|
| `portier_packages` | Array JSON de todos los paquetes |
| `portier_residents` | Array JSON de todos los residentes |
| `portier_whatsapp_logs` | Array JSON de logs de mensajes WhatsApp |
| `Portier_logged_resident_name` | Nombre del residente logueado (sesión) |
| `Portier_logged_resident_phone` | Teléfono del residente logueado (sesión) |

---

## 🎨 Sistema de Diseño

- **Paleta Material Design 3** con tokens personalizados en `index.css`
- **Glassmorphism:** Clases `.glass-card` y `.glass-nav` con `backdrop-filter: blur(20px)`
- **Animaciones:** `fade-in` y `pulse-glow` definidas como keyframes
- **Timeline visual:** Línea de progreso CSS (`.timeline-line::after`)
- **Tipografía:** `Montserrat` (títulos) + `Inter` (cuerpo)
- **Colores primarios:** `#0061a5` (primary), `#0099ff` (primary-container), `#a73a15` (secondary)

---

*Portier Concierge v2.4 · Vcapital · 2026*
