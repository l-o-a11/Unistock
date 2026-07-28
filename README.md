# 📦 UniStock

Sistema de gestión de inventario **full-stack** orientado a empresas de producción: maneja insumos, productos, categorías, proveedores, compras, producción, empleados, sedes, terceros, usuarios y roles con privilegios granulares.

Este repositorio contiene el **frontend** de UniStock, construido en React + Vite, que se conecta a una API REST (Node.js/Express/MongoDB) desarrollada en un repositorio backend independiente.

---

## 📑 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Stack tecnológico](#-stack-tecnológico)
- [Módulos funcionales](#-módulos-funcionales)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Rutas de la aplicación](#-rutas-de-la-aplicación)
- [Autenticación y roles](#-autenticación-y-roles)
- [Modo offline / fallback](#-modo-offline--fallback)
- [Exportación de datos](#-exportación-de-datos)
- [PWA](#-pwa)
- [Documentación adicional](#-documentación-adicional)
- [Convenciones de trabajo en equipo](#-convenciones-de-trabajo-en-equipo)

---

## 🧾 Descripción general

UniStock centraliza el control de inventario de una empresa de producción: desde el registro de insumos y proveedores, pasando por el proceso de producción de productos terminados, hasta la administración de usuarios, roles y sedes. La aplicación está pensada para ser usada por varios roles (administradores, encargados de producción, compras, etc.), cada uno con acceso restringido a los módulos que le corresponden.

## 🛠 Stack tecnológico

**Frontend (este repositorio)**
- [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- [React Router DOM 7](https://reactrouter.com/) para el enrutamiento
- [Tailwind CSS 4](https://tailwindcss.com/) para estilos
- [Axios](https://axios-http.com/) para llamadas HTTP
- [Recharts](https://recharts.org/) para gráficas del dashboard
- [FullCalendar](https://fullcalendar.io/) para el calendario de producción
- [ExcelJS](https://github.com/exceljs/exceljs) y [xlsx-js-style](https://www.npmjs.com/package/xlsx-js-style) para exportaciones a Excel
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) para exportaciones a PDF
- [Cloudinary](https://cloudinary.com/) para almacenamiento de imágenes
- [Lucide React](https://lucide.dev/) para iconografía
- [EmailJS](https://www.emailjs.com/) para envío de correos desde el cliente
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) para soporte PWA

**Backend (repositorio independiente)**
- Node.js + Express
- MongoDB (Mongoose)
- Autenticación basada en JWT

## 🧩 Módulos funcionales

| Módulo | Descripción |
|---|---|
| **Auth / Perfil** | Inicio de sesión, sesión persistida, página de perfil de usuario |
| **Dashboard** | Panel principal con indicadores generales |
| **Usuarios** | Gestión (CRUD) de usuarios del sistema |
| **Roles** | Creación, edición y asignación de roles con privilegios por módulo |
| **Sedes** | Administración de sedes/ubicaciones de la empresa |
| **Insumos** | Gestión de insumos con exportación a Excel/PDF |
| **Categorías de insumos** | Clasificación de insumos, con conteo de insumos por categoría |
| **Proveedores** | Gestión de proveedores |
| **Compras** | Registro y control de compras a proveedores |
| **Productos** | Gestión del catálogo de productos terminados |
| **Categorías de productos** | Clasificación de productos |
| **Producción** | Órdenes de producción, detalle de producción y calendario de producción |
| **Terceros** | Gestión de terceros relacionados con la operación |
| **Empleados** | Gestión de información de empleados |

## 📁 Estructura del proyecto

El proyecto sigue una arquitectura **feature-based** (organizada por dominio de negocio en lugar de por tipo de archivo), donde cada módulo bajo `src/features/` es autocontenido:

```
src/
├── App.jsx                  # Componente raíz
├── main.jsx                 # Punto de entrada de la app
├── App.css / index.css      # Estilos globales
├── layout/
│   └── AppLayout.jsx         # Layout principal (sidebar, header, outlet de rutas privadas)
├── routers/
│   └── routers.jsx           # Definición central de rutas (React Router)
├── assets/                   # Imágenes e íconos globales
└── features/
    ├── auth/                 # Login, perfil, sesión
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── types/
    ├── users/                # Usuarios
    ├── roles/                # Roles y privilegios
    ├── sedes/                # Sedes
    ├── supplies/              # Insumos
    ├── categoriesSupply/     # Categorías de insumos
    ├── suppliers/             # Proveedores
    ├── shopping/               # Compras
    ├── products/               # Productos
    ├── productCategories/     # Categorías de productos
    ├── production/             # Producción (incluye productionDetails/)
    ├── third_parties/          # Terceros
    ├── employees/               # Empleados
    ├── dashboard/               # Dashboard
    └── shared/                  # Código compartido entre módulos
        ├── components/          # Componentes reutilizables (PrivateRoute, modales, tablas, etc.)
        ├── hooks/
        ├── utils/
        │   └── httpClient.js    # Cliente HTTP centralizado
        └── assets/
```

Cada módulo típicamente contiene:
- **`pages/`** — vistas completas (páginas) enrutadas.
- **`components/`** — piezas de UI específicas del módulo (formularios, tablas, modales).
- **`hooks/`** — lógica de estado y llamadas a servicios (`useUsers`, `useAuth`, etc.).
- **`services/`** — funciones que consumen la API (`usersAPI.js`, `productAPI.js`, etc.), con manejo de errores y, en algunos casos, datos mock de respaldo.
- **`types/`** — definiciones/formas de datos usadas en el módulo.

## 🏗 Arquitectura

El flujo de datos sigue el patrón:

```
Página (UI) → Hook (estado) → Service/API (petición) → httpClient.js → Backend (Express) → MongoDB
```

- **`httpClient.js`** centraliza las peticiones HTTP: agrega la URL base, el timeout, el header `Authorization: Bearer {token}` a partir de la sesión guardada, y homogeniza el manejo de errores (GET, POST, PUT, PATCH, DELETE). Por defecto serializa las peticiones como JSON; para subir archivos (por ejemplo imágenes a Cloudinary) se usa un helper `fetchForm` con `fetch` nativo, sin tocar el cliente compartido.
- **Autenticación:** al iniciar sesión, el backend retorna un usuario junto con un JWT. Ese objeto se guarda en `sessionStorage` y se reutiliza en cada petición autenticada. Las rutas protegidas usan el componente `PrivateRoute`, que además puede restringir el acceso por `modulo` según los privilegios del rol del usuario.
- **Rutas privadas por módulo:** cada ruta bajo `/layout` está envuelta en `<PrivateRoute modulo="...">`, de forma que un usuario sin privilegios sobre ese módulo no puede acceder a la vista aunque conozca la URL.

Para un diagrama más detallado del flujo de una petición (ej. login) y del manejo de errores, ver [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## ✅ Requisitos previos

- **Node.js** 18 o superior (recomendado 20+)
- **npm** (incluido con Node.js)
- Backend de UniStock corriendo (por defecto en `http://localhost:3000`) para funcionalidad completa

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Unistock

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env   # y completar los valores (ver sección siguiente)

# 4. Levantar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

## 🔐 Variables de entorno

El proyecto usa variables con prefijo `VITE_` (requerido por Vite para exponerlas al cliente). Se definen en un archivo `.env` en la raíz:

```env
# URL base de la API backend
VITE_API_URL=http://localhost:3000/api

# Timeout de las peticiones HTTP (ms)
VITE_API_TIMEOUT=10000

# (Opcional) Client ID para inicio de sesión con Google
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

> ⚠️ El archivo `.env` no debe subirse al control de versiones (ya está contemplado en `.gitignore`). Cada desarrollador debe crear el suyo localmente.

## 📜 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo de Vite con hot-reload |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción para previsualizarlo |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto |

## 🧭 Rutas de la aplicación

Todas las rutas (excepto `/` y `/layout/perfil`) requieren sesión activa y, en la mayoría de los casos, un privilegio de módulo específico:

| Ruta | Módulo requerido | Página |
|---|---|---|
| `/` | — (pública) | Login |
| `/layout` o `/layout/dashboard` | `dashboard` | Dashboard |
| `/layout/usuarios` | `usuarios` | Gestión de usuarios |
| `/layout/roles` | `roles` | Listado de roles |
| `/layout/roles/crear` | `roles` | Crear rol |
| `/layout/roles/editar/:id` | `roles` | Editar rol |
| `/layout/sedes` | `sedes` | Gestión de sedes |
| `/layout/insumos` | `insumos` | Gestión de insumos |
| `/layout/categorias-insumos` | `categorias de insumos` | Categorías de insumos |
| `/layout/proveedores` | `proveedores` | Gestión de proveedores |
| `/layout/compras` | `compras` | Gestión de compras |
| `/layout/productos` | `productos` | Gestión de productos |
| `/layout/productos/crear` | `productos` | Crear producto |
| `/layout/categorias-productos` | `categorias de productos` | Categorías de productos |
| `/layout/produccion` | `produccion` | Listado de producción |
| `/layout/produccion/detalle/:id` | `produccion` | Detalle de una producción |
| `/layout/produccion/calendario` | `produccion` | Calendario de producción |
| `/layout/terceros` | `terceros` | Gestión de terceros |
| `/layout/empleados` | `empleados` | Gestión de empleados |
| `/layout/perfil` | — (siempre accesible con sesión) | Perfil del usuario |
| `*` | — | Redirige a `/layout` |

## 👤 Autenticación y roles

- El inicio de sesión se realiza contra `POST /api/auth/login`; el backend responde con los datos del usuario y un token JWT.
- La sesión se guarda en `sessionStorage` bajo la clave `session_user` y se limpia al cerrar sesión o si el token es rechazado por el backend.
- El sistema de **roles y privilegios** permite asignar a cada rol acceso granular a los distintos módulos (`usuarios`, `productos`, `produccion`, etc.); `PrivateRoute` valida ese privilegio antes de renderizar cada página.

## 🌐 Modo offline / fallback

Varios servicios (`usersAPI`, `productAPI`, etc.) están preparados para funcionar aunque el backend no esté disponible: si la petición al backend falla, capturan el error, muestran una advertencia en consola y devuelven datos mock locales para que la interfaz siga siendo funcional durante el desarrollo. Estos datos de respaldo **no persisten** (se pierden al recargar la página) y están pensados solo para desarrollo, no para producción.

## 📊 Exportación de datos

El módulo de insumos (y otros que lo requieran) permite exportar información a:
- **Excel**, generado con ExcelJS aplicando estilos personalizados.
- **PDF**, generado abriendo una ventana HTML con jsPDF/jspdf-autotable.

## 📱 PWA

El proyecto está configurado como **Progressive Web App** mediante `vite-plugin-pwa`, con manifest, íconos y estrategia de *service worker* con auto-actualización (`registerType: 'autoUpdate'`), lo que permite instalar la aplicación y usarla con soporte offline básico para los assets estáticos.

## 📚 Documentación adicional

Este repositorio incluye documentación complementaria generada durante el desarrollo, útil para profundizar en aspectos específicos:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — diagrama detallado de la arquitectura frontend-backend, flujo de peticiones y manejo de errores.
- [`DOCUMENTACION.md`](./DOCUMENTACION.md) — documentación general del proyecto.
- [`API_CONNECTION_GUIDE.md`](./API_CONNECTION_GUIDE.md) y [`API_INTEGRATION_GUIDE.md`](./API_INTEGRATION_GUIDE.md) — guías de conexión e integración con los endpoints del backend.
- [`CONNECTION_SUMMARY.md`](./CONNECTION_SUMMARY.md) — resumen del estado de conexión frontend-backend por módulo.
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) — guía de pruebas del proyecto.
- [`NEXT_STEPS.md`](./NEXT_STEPS.md) — próximos pasos pendientes de integración.
- [`CONSOLE_CLEANUP_GUIDE.md`](./CONSOLE_CLEANUP_GUIDE.md) — guía para limpieza de logs/consola.

## 👥 Convenciones de trabajo en equipo

Al tratarse de un proyecto desarrollado por varios integrantes trabajando en módulos distintos en paralelo, se recomienda:

- Mantener los cambios **aislados por módulo/feature** (`src/features/<módulo>`) para minimizar conflictos de merge.
- Reutilizar el `httpClient.js` compartido para cualquier llamada a la API en vez de crear clientes HTTP nuevos por módulo.
- Seguir el patrón existente de `services/` con manejo de errores y, cuando aplique, datos mock de fallback.
- Ejecutar `npm run lint` antes de subir cambios.

---

Desarrollado como proyecto de gestión de inventario **UniStock**.
