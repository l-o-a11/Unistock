# Arquitectura frontend-backend

## Objetivo

Este documento describe la arquitectura real del proyecto, la forma en que el frontend comunica con el backend y la logica de acceso por modulo.

---

## Arquitectura utilizada

El proyecto aplica dos arquitecturas complementarias:

- Frontend: arquitectura de SPA orientada a features o módulos, con una organizacion por dominio (`src/features/...`). Cada módulo encapsula sus componentes, hooks, servicios, páginas y tipos, lo que facilita mantenimiento y escalabilidad.
- Backend: arquitectura por capas, inspirada en Clean Architecture, con separacion de responsabilidades en rutas, controladores, casos de uso, repositorios, entidades y modelos de base de datos.
- Integracion: el frontend consume la API REST del backend a través de un cliente HTTP centralizado (`httpClient`), autenticado con JWT y protegido por rutas privadas y permisos por módulo.

---

## Stack tecnológico y librerías utilizadas

### Frontend

- React 19 para la interfaz de usuario.
- Vite 8 como bundler y servidor de desarrollo.
- React Router DOM 7 para el enrutamiento.
- Tailwind CSS 4 + PostCSS para estilos y diseño visual.
- ESLint + plugin de React para revisión de calidad del código.
- Axios para peticiones HTTP.
- Recharts para gráficos del dashboard.
- FullCalendar (core, daygrid, timegrid, interaction) para calendarios de producción.
- ExcelJS y xlsx-js-style para exportación a Excel.
- jsPDF y jspdf-autotable para exportación a PDF.
- Cloudinary SDK para manejo de imágenes y uploads.
- Lucide React para iconografía.
- @emailjs/browser para envío de correos desde el cliente.
- vite-plugin-pwa para habilitar soporte PWA.
- npm como gestor de dependencias y scripts del proyecto.

### Backend

- Node.js como entorno de ejecución.
- Express 5 para la API REST.
- MongoDB + Mongoose para persistencia y acceso a datos.
- JWT (jsonwebtoken) para autenticación basada en tokens.
- bcryptjs para encriptación de contraseñas.
- dotenv para variables de entorno.
- CORS para control de accesos entre frontend y backend.
- Zod para validación de schemas y datos de entrada.
- Multer y Cloudinary para subida de archivos e imágenes.
- Nodemailer para envío de correos.
- Google APIs (Calendar y Gmail) para integraciones con servicios de Google.
- Swagger JSdoc + Swagger UI Express para documentación interactiva de la API.
- nodemon como herramienta de desarrollo para recarga automática.
- Playwright para pruebas e2e y validaciones automatizadas.

### Herramientas de desarrollo y despliegue

- VS Code como entorno de desarrollo.
- Git para control de versiones.
- npm scripts para iniciar, compilar y validar la aplicación.
- Vite dev server y preview para desarrollo y previsualización del frontend.
- MongoDB Atlas o servidor MongoDB local para persistencia.
- Swagger UI para probar endpoints de la API en desarrollo.

---

## Componentes del sistema

| Componente | Tecnologia                  | Puerto | Descripcion               |
| ---------- | --------------------------- | -----: | ------------------------- |
| Frontend   | React + Vite                |   5173 | Aplicacion principal      |
| Backend    | Node.js + Express + MongoDB |   3000 | API REST de negocio       |
| Swagger    | OpenAPI                     |   3000 | Documentacion interactiva |

---

## Flujo general de comunicacion

```text
Frontend (React)
  -> routes
  -> features/<modulo>
  -> hooks
  -> services
  -> httpClient
  -> API REST (/api)
  -> backend
  -> MongoDB
```

Ejemplo:

```text
LoginPage
  -> useAuth
  -> AuthAPI.login()
  -> httpClient.post('/auth/login')
  -> backend valida credenciales
  -> devuelve JWT y usuario
  -> se guarda session
```

---

## Estructura de carpetas

```text
Unistock/src/
├── App.jsx
├── main.jsx
├── layout/
│   └── AppLayout.jsx
├── routers/
│   └── routers.jsx
├── features/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── sedes/
│   ├── supplies/
│   ├── categoriesSupply/
│   ├── suppliers/
│   ├── shopping/
│   ├── products/
│   ├── productCategories/
│   ├── production/
│   ├── third_parties/
│   ├── employees/
│   ├── dashboard/
│   └── shared/
│       ├── AuthContext.jsx
│       ├── PrivateRoute.jsx
│       └── utils/httpClient.js
└── assets/
```

Cada feature normalmente incluye:

- components/
- hooks/
- pages/
- services/
- types/

---

## Departamento de la sesion y permisos

La autenticacion se gestiona desde AuthContext.jsx.

Responsabilidades:

- guardar user, permisos y loading
- cargar permisos con /api/auth/me/permissions
- identificar si un usuario puede entrar a una ruta
- decidir la ruta inicial visible segun el rol

La seguridad visual se hace con PrivateRoute.jsx, que verifica:

- si hay sesion activa
- si el modulo esta permitido para el usuario
- si la ruta es public o privada

---

## Rutas protegidas

El acceso esta definido en src/routers/routers.jsx.

Ejemplo:

```jsx
<Route
  path="usuarios"
  element={
    <PrivateRoute modulo="usuarios">
      <UsersPage />
    </PrivateRoute>
  }
/>
```

Esto significa que aunque el usuario conozca la URL, la vista solo se mostrara si el backend y el contexto de permisos lo permiten.

---

## Flujo de uso con el backend

### Login

```text
1. LoginPage hace submit
2. AuthAPI.login() usa httpClient.post('/auth/login')
3. Backend valida credenciales y firma JWT
4. El frontend guarda la sesion
5. El contexto carga permisos del usuario
6. El router envia a la ruta autorizada
```

### Consulta de datos

```text
1. El usuario entra a una pagina
2. El hook del modulo dispara la llamada al service
3. El service usa httpClient.get/post/put/delete
4. El backend responde en JSON
5. El componente actualiza tablas, formularios y estados
```

---

## Reglas de negocio del sistema

### Regla 1: permisos reales

La fuente de verdad de permisos es el backend. El frontend solo representa el estado y bloquea interfaces, pero el backend debe validar cada accion sensible.

### Regla 2: roles por modulo

Cada rol puede tener permisos sobre modulos como:

- dashboard
- usuarios
- roles
- sedes
- insumos
- proveedores
- compras
- productos
- produccion
- terceros
- empleados

### Regla 3: sesion no basta para operar

Un usuario autenticado sigue sin poder usar un modulo si no tiene el privilegio asignado.

### Regla 4: datos mock solo para desarrollo

En algunos servicios existen datos de respaldo para no bloquear desarrollo local. Eso no sustituye al backend ni debe usarse como fuente de verdad productiva.

---

## TODO y pendientes documentados

- Homogeneizar nombres de modulos y rutas entre backend y frontend.
- Revisar endpoints legacy o alias duplicados.
- Completar la documentacion de modulos secundarios.
- Alinear pruebas e2e con flujos criticos del negocio.
- Mantener la semilla de permisos sin drift con la UI.

---

## Resumen final

La aplicacion sigue una arquitectura cliente-servidor clara:

- frontend = experiencia de usuario, rutas, permisos y consumo de API
- backend = autenticacion, validacion, reglas del negocio y persistencia
- MongoDB = ubicacion de los datos reales

La secuencia correcta es:

```text
Ruta protegida
  -> PrivateRoute
  -> service
  -> httpClient
  -> backend
  -> MongoDB
  -> respuesta JSON
  -> UI
```

Esto es el flujo con el que se usa la app en desarrollo y en produccion.
│ campo (Zod) │
└──────────────┬───────────────────────────┘
│
▼
┌────────────────────────────────────────────┐
│ 401 y !suppressAutoLogout │
│ → clearSessionAndRedirect() │
│ → Limpia session_user │
│ → Muestra toast "Sesión finalizada" │
│ → Redirige a /login (3s) │
└──────────────┬───────────────────────────┘
│
▼
┌────────────────────────────────────────────┐
│ Service (usersAPI, productAPI, etc.) │
│ → try/catch │
│ → Relanza error para que el hook/UI lo │
│ muestre al usuario │
└──────────────────────────────────────────┘

````

> **Nota:** A diferencia de versiones anteriores, los servicios ya no dependen de `console.warn` + fallback mock en todos los casos. La mayoría usa la API real; solo algunos módulos (producción/empleados en modo demo) conservan datos mock locales.

---

## Variables de Entorno

### Frontend `.env`

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_API_URL=http://localhost:3000/api
VITE_AUTH_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Google OAuth (opcional)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
````

### Backend `.env` (Api_Unistock)

```env
# Server
PORT=3000
NODE_ENV=development

# Base de datos (MongoDB)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net
DATABASE_NAME=unistock

# JWT
JWT_SECRET=tu_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary (subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret

# Email (recuperación de contraseña)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña
```

---

## Endpoints principales (resumen)

| Módulo               | Rutas base                | Servicio frontend        |
| -------------------- | ------------------------- | ------------------------ |
| Autenticación        | `/api/auth/*`             | `AuthAPI.js`             |
| Usuarios             | `/api/users`              | `usersAPI.js`            |
| Roles                | `/api/roles`              | `RolesAPI.js`            |
| Sedes                | `/api/sites`              | `sedesAPI.js`            |
| Proveedores          | `/api/proveedores`        | `SuppliersAPIClient.js`  |
| Terceros             | `/api/terceros`           | `thirdPartyAPI.js`       |
| Productos            | `/api/products`           | `productAPI.js`          |
| Categorías productos | `/api/product-categories` | `productCategoryAPI.js`  |
| Insumos              | `/api/insumos`            | `supplyAPI.js`           |
| Categorías insumos   | `/api/categorias-insumos` | `categoryAPI.js`         |
| Compras              | `/api/compras`            | `shoppingAPI.js`         |
| Producción           | `/api/produccion`         | `ProductionAPIClient.js` |
| Clientes             | `/api/clients`            | `clientAPI.js`           |

---

## Checklist de Integración

- [x] Cliente HTTP configurado (`httpClient.js`)
- [x] Variables de entorno configuradas
- [x] Autenticación con backend (login, JWT, recuperación)
- [x] Usuarios con backend
- [x] Productos (incluye fichas técnicas y materiales)
- [x] Categorías de productos
- [x] Categorías de insumos
- [x] Sedes
- [x] Roles
- [x] Producción (órdenes, detalles, asignaciones, calendario, alertas)
- [x] Insumos (incluye catálogos y subida de imágenes)
- [x] Compras
- [x] Proveedores
- [x] Terceros
- [x] Empleados
- [x] CORS configurado en backend
- [x] JWT funcionando (requireAuth + requireRole)
- [x] Errores manejados consistentemente

---

## URLs de Desarrollo

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3000
API:       http://localhost:3000/api
Docs Swagger: http://localhost:3000/api/docs

DevTools:  F12
Network:   F12 → Network tab
Console:   F12 → Console tab
```

---

## Conclusión

✅ **El frontend está completamente integrado con el backend Api_Unistock.**

**Arquitectura en resumen:**

1. **Frontend SPA** (React + Vite) organizado por features, con un cliente HTTP centralizado.
2. **Backend REST** (Express + MongoDB) con Clean Architecture (rutas → controladores → use-cases → repositorios → modelos).
3. **Autenticación JWT** verificada contra la BD en cada request (`requireAuth`).
4. **Control de acceso por módulo** con `PrivateRoute` + `AuthContext`.
5. **Documentación de API** disponible en Swagger (`/api/docs`).

Para documentación detallada de endpoints y componentes, consultar:

- `Api_Unistock/DOCUMENTACION_API.md`
- `Unistock/DOCUMENTACION_FRONTEND.md`

---
