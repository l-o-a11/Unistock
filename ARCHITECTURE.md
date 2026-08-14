# 🏗️ Arquitectura Frontend-Backend

> Documento actualizado según el estado real del proyecto (React + Vite + Express + MongoDB).

## Componentes del sistema

| Componente             | Tecnología                  | Puerto | Descripción                    |
| ---------------------- | --------------------------- | ------ | ------------------------------ |
| **Frontend**           | React + Vite                | `5173` | SPA de gestión (Unistock)      |
| **Backend principal**  | Node.js + Express + MongoDB | `3000` | API REST (Api_Unistock)        |
| **Backend secundario** | Node.js + Express + MongoDB | `3020` | Backend legado (back_unictock) |

---

## Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                       │
│                    http://localhost:5173                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Pages / Components                                       │ │
│  │  (LoginPage, UsersPage, ProductsPage, etc.)              │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Hooks / Context                                        │ │
│  │  (useAuth, useUsers, useProducts, etc.)                │ │
│  │                                                          │ │
│  │  ├─ AuthContext → Gestiona sesión y permisos           │ │
│  │  └─ Llama a servicios (APIs)                           │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Services / APIs (usersAPI, productAPI, etc.)          │ │
│  │                                                          │ │
│  │  ├─ Try: httpClient.get/post/put/patch/delete()       │ │
│  │  │         (Conecta al Backend /api)                   │ │
│  │  │                                                      │ │
│  │  └─ Catch: Manejo de errores                           │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  httpClient.js (Cliente HTTP Centralizado)             │ │
│  │                                                          │ │
│  │  ✓ GET, POST, PUT, PATCH, DELETE                       │ │
│  │  ✓ Autenticación con JWT (localStorage/sessionStorage) │ │
│  │  ✓ Headers: Authorization: Bearer {token}              │ │
│  │  ✓ URL Base: http://localhost:3000/api                │ │
│  │  ✓ /auth/* usa AUTH_API_URL, el resto BACKEND_API_URL  │ │
│  │  ✓ Timeout: VITE_API_TIMEOUT (default 10 seg)          │ │
│  │  ✓ Manejo de errores robusto + redirección en 401      │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      │ Fetch API
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Api_Unistock)                         │
│                   http://localhost:3000/api                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Express Server                                           │ │
│  │  CORS habilitado para http://localhost:5173 y 5000        │ │
│  │  Fail-fast: responde 503 si MongoDB no está conectado     │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Routes (infrastructure/routes/)                       │ │
│  │  /api/auth        /api/users      /api/proveedores     │ │
│  │  /api/terceros    /api/products   /api/product-categories│ │
│  │  /api/produccion  /api/compras    /api/insumos          │ │
│  │  /api/roles       /api/sites      /api/categorias-insumos│ │
│  │  /api/modules     /api/privileges /api/clients          │ │
│  │  /api/upload      /api/docs (Swagger)                  │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Controllers (infrastructure/controllers/)             │ │
│  │  → Traducen HTTP y delegan en use-cases/repositorios   │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Middlewares                                            │ │
│  │  ├─ requireAuth (JWT + usuario activo en BD)           │ │
│  │  ├─ requireRole (Gerente/Administrador)                │ │
│  │  ├─ validateSchema (Zod)                               │ │
│  │  └─ CORS / JSON limits                                 │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Base de datos (MongoDB / Mongoose)                     │ │
│  │  Colecciones: users, suppliers, products, production,   │ │
│  │  purchases, supplies, roles, sites, thirdparties, etc.  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos Actualizada

```
Unistock/
├── .env ────────────────────────── ✅ Variables de entorno
│   ├─ VITE_API_URL=http://localhost:3000/api
│   ├─ VITE_BACKEND_API_URL=http://localhost:3000/api
│   ├─ VITE_AUTH_API_URL=http://localhost:3000/api
│   ├─ VITE_API_TIMEOUT=10000
│   └─ VITE_GOOGLE_CLIENT_ID=xxx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
├── package.json
│
└── src/
    ├── main.jsx                    # Punto de entrada React
    ├── App.jsx
    ├── assets/                     # Imágenes e iconos SVG
    ├── layout/
    │   └── AppLayout.jsx           # Layout principal (sidebar + navbar)
    ├── routers/
    │   └── routers.jsx             # Definición de rutas (React Router v6)
    └── features/
        ├── auth/                   # Login, perfil, recuperación
        │   ├── services/AuthAPI.js
        │   ├── hooks/useAuth.js
        │   ├── pages/
        │   └── components/
        ├── users/                  # Usuarios
        ├── employees/              # Empleados
        ├── roles/                  # Roles y permisos
        ├── sedes/                  # Sedes
        ├── supplies/               # Insumos
        ├── categoriesSupply/       # Categorías de insumos
        ├── suppliers/              # Proveedores
        ├── third_parties/          # Terceros
        ├── products/               # Productos y fichas técnicas
        ├── productCategories/      # Categorías de productos
        ├── shopping/               # Compras
        ├── production/             # Producción
        ├── dashboard/              # Dashboard
        └── shared/                 # Compartido
            ├── AuthContext.jsx
            ├── PrivateRoute.jsx
            ├── utils/httpClient.js # Cliente HTTP centralizado
            ├── components/
            ├── hooks/
            └── services/clientAPI.js

```

Cada feature sigue el patrón: `components/`, `hooks/`, `pages/`, `services/`, `types/`.

---

## Flujo de una Petición HTTP (Ejemplo: Login)

```
1. Usuario hace login en LoginForm
   ├─ Ingresa correo/contraseña
   └─ Click en "Iniciar Sesión"

2. Component llama a useAuth hook
   └─ setLoading(true)

3. useAuth llama AuthAPI.login()
   └─ try { httpClient.post("/auth/login", { correo, password }, { skipAuth: true }) }

4. httpClient.js:
   ├─ Construye URL: http://localhost:3000/api/auth/login
   ├─ Headers: { Content-Type: application/json }
   ├─ Body: { correo: "...", password: "..." }
   └─ fetch() envía la petición

5. Backend responde:
   ├─ ✅ 200 OK: { success: true, data: { token, user } }
   ├─ 401 Unauthorized: { success: false, message: "Credenciales inválidas" }
   └─ 500 Error: { success: false, message: "Error interno del servidor" }

6. httpClient.js:
   ├─ ✅ Si 200: Retorna la respuesta parseada
   ├─ ❌ Si error: Lanza excepción con detalles (status, data)

7. AuthAPI.js:
   ├─ ✅ Si success: Lee token y decodifica rol del JWT
   │   └─ localStorage.setItem("session_user", JSON.stringify(session))
   └─ ❌ Si error: Relanza err.data

8. useAuth retorna:
   ├─ ✅ { user, error: null }
   └─ Component actualiza UI

9. Component/Context:
   ├─ ✅ Si login exitoso: ctxLogin(session) actualiza estado React
   └─ Redirige a Dashboard
```

---

## Autenticación y Control de Acceso

### Login

```
1. POST /api/auth/login  →  Backend genera JWT
   { token: "eyJhb...", user: { id, nombreCompleto, correo, rolId, sedeId } }

2. AuthAPI.javascript guarda en localStorage
   localStorage.setItem("session_user", JSON.stringify(session))

3. En peticiones posteriores:
   ├─ httpClient.get() → Lee token de session_user
   ├─ Agrega header: Authorization: Bearer eyJhb...
   └─ Backend verifica el token (requireAuth)
```

### Control de acceso por módulo

El frontend protege cada ruta con `PrivateRoute`:

```jsx
<Route
  path="produccion"
  element={
    <PrivateRoute modulo="produccion">
      <ProductionsPage />
    </PrivateRoute>
  }
/>
```

- **`PrivateRoute`**: verifica sesión activa y que el usuario tenga permiso al módulo indicado.
- **`AuthContext`**: provee `user`, `permisos` y `logout` a toda la app.
- **Módulos disponibles:** `dashboard`, `usuarios`, `roles`, `sedes`, `insumos`, `categorias de insumos`, `proveedores`, `compras`, `productos`, `categorias de productos`, `produccion`, `terceros`, `empleados`.

---

## Manejo de Errores

```
┌────────────────────────────────────────────┐
│  Backend retorna error                     │
│  Response: { success: false, message, ... }│
└──────────────┬───────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  httpClient.js detecta !response.ok         │
│  → Lanza Error personalizado                │
│  → error.message: "..."                    │
│  → error.status: 4xx/5xx                   │
│  → error.data: { message, errors, ... }    │
│  → Si errors[] existen, los formatea por    │
│    campo (Zod)                             │
└──────────────┬───────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  401 y !suppressAutoLogout                 │
│  → clearSessionAndRedirect()               │
│  → Limpia session_user                     │
│  → Muestra toast "Sesión finalizada"       │
│  → Redirige a /login (3s)                  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  Service (usersAPI, productAPI, etc.)      │
│  → try/catch                               │
│  → Relanza error para que el hook/UI lo    │
│    muestre al usuario                      │
└──────────────────────────────────────────┘
```

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
```

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
