# 📖 Documentación del Frontend Unistock

> **Frontend de Unistock** — aplicación **React + Vite** (puerto `5173`).

Esta documentación cubre la arquitectura del frontend: estructura de carpetas, flujo de datos, cliente HTTP, enrutado, servicios/APIs por módulo, hooks, componentes, páginas y sistema de autenticación.

---

## 📑 Tabla de contenidos

1. [Visión general](#-visión-general)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura de carpetas](#-estructura-de-carpetas)
4. [Flujo de datos](#-flujo-de-datos)
5. [Cliente HTTP centralizado](#-cliente-http-centralizado)
6. [Enrutado y control de acceso](#-enrutado-y-control-de-acceso)
7. [Autenticación](#-autenticación)
8. [Módulos (features)](#-módulos-features)
   - [Auth](#-auth)
   - [Dashboard](#-dashboard)
   - [Usuarios](#-usuarios)
   - [Roles](#-roles)
   - [Sedes](#-sedes)
   - [Insumos](#-insumos)
   - [Categorías de insumos](#-categorías-de-insumos)
   - [Proveedores](#-proveedores)
   - [Terceros](#-terceros)
   - [Productos](#-productos)
   - [Categorías de productos](#-categorías-de-productos)
   - [Compras](#-compras-shopping)
   - [Producción](#-producción)
   - [Empleados](#-empleados)
   - [Shared (compartido)](#-shared-compartido)
9. [Servicios/APIs por feature](#-serviciosapis-por-feature)
10. [Hooks por feature](#-hooks-por-feature)
11. [Componentes y páginas](#-componentes-y-páginas)
12. [Utilidades compartidas](#-utilidades-compartidas)
13. [Variables de entorno](#-variables-de-entorno)

---

## 🚀 Visión general

Unistock es un sistema de gestión para una empresa de confección de lencería. El frontend es una **SPA (Single Page Application)** construida con **React + Vite + Tailwind CSS**, organizada por características (`features/`).

Cada feature sigue un patrón consistente:

```
features/<modulo>/
├── components/       # Componentes UI (Formularios, Tablas, Modales, etc.)
├── hooks/            # Lógica reutilizable (useProducts, useUsers, etc.)
├── pages/            # Páginas de la feature
├── services/         # Clientes API (conectan al backend)
└── types/            # Constantes y tipos
```

---

## ⚛️ Stack tecnológico

| Tecnología                        | Uso                            |
| --------------------------------- | ------------------------------ |
| **React 18**                      | Librería UI                    |
| **Vite**                          | Bundler / dev server           |
| **React Router v6**               | Enrutado (`react-router-dom`)  |
| **Tailwind CSS**                  | Estilos                        |
| **Fetch API**                     | Cliente HTTP (`httpClient.js`) |
| **sessionStorage / localStorage** | Persistencia de sesión         |

---

## 📁 Estructura de carpetas

```
Unistock/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── package.json
└── src/
    ├── main.jsx                 # Punto de entrada React
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── assets/                  # Imágenes e iconos SVG
    ├── layout/
    │   └── AppLayout.jsx        # Layout principal (sidebar + navbar)
    ├── routers/
    │   └── routers.jsx          # Definición de rutas
    └── features/
        ├── auth/                # Login, perfil, recuperación
        ├── dashboard/           # Dashboard
        ├── users/               # Usuarios
        ├── employees/           # Empleados
        ├── roles/               # Roles y permisos
        ├── sedes/               # Sedes
        ├── supplies/            # Insumos
        ├── categoriesSupply/    # Categorías de insumos
        ├── suppliers/           # Proveedores
        ├── third_parties/       # Terceros
        ├── products/            # Productos y fichas técnicas
        ├── productCategories/   # Categorías de productos
        ├── shopping/            # Compras
        ├── production/          # Producción
        └── shared/              # Compartido (AuthContext, httpClient, componentes)
```

---

## 🔄 Flujo de datos

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                     http://localhost:5173                   │
│                                                             │
│  Pages / Components                                        │
│  (LoginPage, UsersPage, ProductsPage, ...)                 │
│         │                                                   │
│         ▼                                                   │
│  Hooks / Context                                           │
│  (useAuth, useUsers, useProducts, ...)                     │
│  ├─ AuthContext → sesión del usuario                       │
│  └─ Llama a servicios (APIs)                                │
│         │                                                   │
│         ▼                                                   │
│  Services / APIs (usersAPI, productAPI, ...)               │
│  ├─ try: httpClient.get/post/put/delete()                  │
│  └─ catch: manejo de errores                               │
│         │                                                   │
│         ▼                                                   │
│  httpClient.js (Cliente HTTP centralizado)                 │
│  ✓ GET, POST, PUT, PATCH, DELETE                           │
│  ✓ Autenticación JWT                                       │
│  ✓ URL base: http://localhost:3000/api                     │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTP/REST
          ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (Api_Unistock)                       │
│                 http://localhost:3000/api                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧰 Cliente HTTP centralizado

**Archivo:** `src/features/shared/utils/httpClient.js`

Es el punto único de acceso al backend. Expone:

| Función                            | Descripción       |
| ---------------------------------- | ----------------- |
| `httpRequest(endpoint, options)`   | Petición genérica |
| `get(endpoint, options)`           | GET               |
| `post(endpoint, body, options)`    | POST              |
| `put(endpoint, body, options)`     | PUT               |
| `patch(endpoint, body, options)`   | PATCH             |
| `deleteRequest(endpoint, options)` | DELETE            |

### Características

- **URL base:** `VITE_BACKEND_API_URL` o `VITE_API_URL` o `http://localhost:3000/api`.
- **Separación de URLs:** los endpoints `/auth/*` usan `AUTH_API_URL`; el resto usan `BACKEND_API_URL`.
- **Timeout:** `VITE_API_TIMEOUT` (default `10000` ms).
- **Autenticación:** lee el token de `session_user` y agrega `Authorization: Bearer <token>`.
- **Flags:**
  - `skipAuth` → no envía token.
  - `suppressAutoLogout` → no cierra sesión en 401 (para errores de negocio esperados).
- **Manejo de errores:**
  - Componer mensajes legibles con `errorData.errors` (validación Zod).
  - `401` → limpia sesión y redirige a `/login` (con toast visual).
  - Solo loguea errores inesperados (sin status o 5xx).
- **Respuestas:** parsea JSON automáticamente; `204` devuelve `null`.

---

## 🧭 Enrutado y control de acceso

**Archivo:** `src/routers/routers.jsx`

Usa **React Router v6**. Rutas principales:

| Ruta                             | Página                 | Módulo requerido          |
| -------------------------------- | ---------------------- | ------------------------- |
| `/`                              | LoginPage              | Público                   |
| `/layout`                        | AppLayout (protegido)  | —                         |
| `/layout`                        | DashboardPage          | `dashboard`               |
| `/layout/dashboard`              | DashboardPage          | `dashboard`               |
| `/layout/usuarios`               | UsersPage              | `usuarios`                |
| `/layout/roles`                  | RolesPage              | `roles`                   |
| `/layout/roles/crear`            | CreateRolPage          | `roles`                   |
| `/layout/roles/editar/:id`       | EditRolPage            | `roles`                   |
| `/layout/sedes`                  | SedesPage              | `sedes`                   |
| `/layout/insumos`                | SuppliesPage           | `insumos`                 |
| `/layout/categorias-insumos`     | CategoriesSupplyPage   | `categorias de insumos`   |
| `/layout/proveedores`            | SuppliersPage          | `proveedores`             |
| `/layout/compras`                | ShoppingsPage          | `compras`                 |
| `/layout/productos`              | ProductsPage           | `productos`               |
| `/layout/categorias-productos`   | ProductCategoriesPage  | `categorias de productos` |
| `/layout/productos/crear`        | ProductForm            | `productos`               |
| `/layout/produccion`             | ProductionPage         | `produccion`              |
| `/layout/produccion/detalle/:id` | ProductionDetailsPage  | `produccion`              |
| `/layout/produccion/calendario`  | ProductionCalendarPage | `produccion`              |
| `/layout/terceros`               | ThirdPartiesPage       | `terceros`                |
| `/layout/empleados`              | EmployeesPage          | `empleados`               |
| `/layout/perfil`                 | ProfilePage            | Siempre accesible         |
| `*`                              | Redirige a `/layout`   | —                         |

### Control de acceso

- **`PrivateRoute`** (`src/features/shared/PrivateRoute.jsx`): protege rutas; verifica sesión y, opcionalmente, el módulo al que el usuario tiene permiso (`modulo="produccion"`, etc.).
- **`AuthContext`** (`src/features/shared/AuthContext.jsx`): provee la sesión y los permisos del usuario en toda la app.

---

## 🔐 Autenticación

**Archivo:** `src/features/auth/services/AuthAPI.js`

| Método                          | Endpoint                     | Descripción                         |
| ------------------------------- | ---------------------------- | ----------------------------------- |
| `login`                         | POST `/auth/login`           | Inicia sesión, guarda sesión        |
| `logout`                        | —                            | Limpia `session_user`               |
| `getCurrentUser` / `getSession` | —                            | Lee sesión de localStorage          |
| `getProfile`                    | GET `/auth/profile`          | Obtiene perfil                      |
| `updateProfile`                 | PUT `/auth/profile`          | Actualiza perfil                    |
| `prepareWelcome`                | POST `/auth/prepare-welcome` | Genera contraseña temporal          |
| `sendWelcomeEmail`              | —                            | No-op (el backend envía el correo)  |
| `savePersonalPassword`          | PUT `/auth/change-password`  | Guarda contraseña personal          |
| `sendRecoveryCode`              | POST `/auth/forgot-password` | Envía código de recuperación        |
| `verifyCode`                    | POST `/auth/verify-code`     | Verifica código                     |
| `changePassword`                | POST `/auth/reset-password`  | Restablece contraseña               |
| `verifyPassword`                | POST `/auth/verify-password` | Verifica contraseña del autenticado |

**Hook:** `src/features/auth/hooks/useAuth.js` — maneja login, modales de recuperación, cambio de contraseña y alertas.

**Páginas:** `LoginPage.jsx`, `ProfilePage.jsx`
**Componentes:** `LoginForm`, `RecoverPasswordModal`, `VerifyCodeModal`, `ChangePasswordModal`

---

## 📦 Módulos (features)

### 🔐 Auth

- **Servicio:** `auth/services/AuthAPI.js`
- **Hook:** `auth/hooks/useAuth.js`
- **Páginas:** `LoginPage.jsx`, `ProfilePage.jsx`
- **Componentes:** `LoginForm`, `RecoverPasswordModal`, `VerifyCodeModal`, `ChangePasswordModal`
- **Tipos:** `auth/types/constants.js` (`AUTH_MODALS`, etc.)

### 📊 Dashboard

- **Página:** `features/dashboard/dashboard.jsx`
- Vista principal post-login con resumen del sistema.

### 👤 Usuarios

- **Servicio:** `users/services/usersAPI.js`
- **Hooks:** `useUsers.js`, `useUserDetail.js`, `useUserSearch.js`, `useCatalogs.js`
- **Página:** `users/pages/UsersPage.jsx`
- **Componentes:** `UserTable`, `UserForm`, `AddUserButton`
- **Tipos:** `users/types/constantsUsers.js`

### 🎭 Roles

- **Servicio:** `roles/services/RolesAPI.js`
- **Hooks:** `useRoles.js`, `useRolDetail.js`, `useRolSearch.js`
- **Páginas:** `RolesPage.jsx`, `CreateRolPage.jsx`, `EditRolPage.jsx`, `RolDetailPage.jsx`
- **Componentes:** `RolTable`, `RolForm`, `RolSearch`, `RolDetail`, `AddRolButton`, `Alert`

### 🏢 Sedes

- **Servicio:** `sedes/services/sedesAPI.js`
- **Hooks:** `useSedes.js`, `useSedesSearch.js`
- **Página:** `sedes/pages/sedesPage.jsx`
- **Componentes:** `SedesTable`, `SedesForm`, `SedesSearch`, `AddSedesButton`

### 🧵 Insumos

- **Servicio:** `supplies/services/supplyAPI.js`
- **Hooks:** `useSupplies.js`, `useSupplyDetail.js`, `useSupplySearch.js`
- **Página:** `supplies/pages/SuppliesPage.jsx`
- **Componentes:** `SupplyTable`, `SupplyForm`, `SupplySearch`, `SupplyDetail`, `AddSupplyButton`, `SupplyCategoriesModal`

### 🗂️ Categorías de insumos

- **Servicio:** `categoriesSupply/services/categoryAPI.js`
- **Hook:** `categoriesSupply/hooks/useCategories.js`
- **Página:** `categoriesSupply/pages/CategoriesSupplyPage.jsx`
- **Componentes:** `CategoryTable`, `CategoryForm`, `CategorySearch`, `AddCategorySupplyButton`

### 🏭 Proveedores

- **Servicio:** `suppliers/services/SuppliersAPIClient.js`
- **Hooks:** `useSupplierDetail.js`, `useSupplierSearch.js` (+ `mockSuppliers.js`)
- **Página:** `suppliers/pages/SuppliersPage.jsx`
- **Componentes:** `SupplierTable`, `SupplierForm`, `SupplierSearch`, `SupplierDetail`, `AddSupplierButton`, `HoverCard`

### 🧑🤝🧑 Terceros

- **Servicio:** `third_parties/services/thirdPartyAPI.js`
- **Hooks:** `useThird_partiesDetail.js`, `useThird_partiesSearch.js` (+ `mockThird_parties.js`)
- **Página:** `third_parties/pages/Third_partiesPage.jsx`
- **Componentes:** `Third_partiesTable`, `Third_partiesForm`, `Third_partiesSearch`, `Third_partiesDetail`, `AddThird_partiesButton`, `HoverCard`
- **Utils:** `third_parties/utils/produccionesLocal.js`

### 📦 Productos

- **Servicio:** `products/services/productAPI.js`
- **Hooks:** `useProducts.js`, `useProductDetail.js`, `useProductSearch.js`, `useTechnicalSheet.js`
- **Página:** `products/pages/ProductsPage.jsx`
- **Componentes:** `ProductTable`, `ProductForm`, `ProductSearch`, `ProductDetail`, `AddProductButton`, `TechnicalSheet`, `TechnicalSheetModal`, `VersionHistory`

### 🗂️ Categorías de productos

- **Servicio:** `productCategories/services/productCategoryAPI.js`
- **Hook:** `productCategories/hooks/useProductCategories.js`
- **Página:** `productCategories/pages/ProductCategoriesPage.jsx`
- **Componentes:** `ProductCategoryTable`, `ProductCategoryForm`, `ProductCategorySearch`, `AddProductCategoryButton`

### 🛒 Compras (Shopping)

- **Servicio:** `shopping/services/shoppingAPI.js`
- **Hooks:** `useShoppings.js`, `useShoppingSearch.js`
- **Página:** `shopping/pages/ShoppingsPage.jsx`
- **Componentes:** `ShoppingTable`, `ShoppingForm`, `ShoppingSearch`, `ShoppingDetail`, `AddShoppingButton`

### 🏭 Producción

- **Servicios:** `production/services/ProductionAPI.js`, `production/services/ProductionAPIClient.js`, `production/hooks/ProductionAPI.js`
- **Hooks:** `useProduction.js`, `useTechnicalSheet.js`
- **Páginas:** `production/pages/ProductionPage.jsx`, `production/pages/ProductionCalendarPage.jsx`, `production/productionDetails/pages/ProductionDetailsPage.jsx`
- **Componentes:** `ProductionTable`, `ProductionForm`, `ProductionSearch`, `ProductionToolbar`, `ProductionCalender`, `TechnicalSheet`, `TechnicalSheetModal`, `DamagedProductsModal`

### 👥 Empleados

- **Servicio:** `employees/services/employeesAPI.js`
- **Hooks:** `useEmployeeDetail.js`, `useEmployeeSearch.js` (+ `mockEmployees.js`)
- **Página:** `employees/pages/EmployeesPage.jsx`
- **Componentes:** `AddEmployeeButton`, `EmployeeForm`, `EmployeeTable`
- **Tipos:** `employees/types/constantsEmployees.js`

### 🧰 Shared (compartido)

- **AuthContext:** `shared/AuthContext.jsx`
- **PrivateRoute:** `shared/PrivateRoute.jsx`
- **Cliente HTTP:** `shared/utils/httpClient.js`
- **Utilidades:** `shared/utils/blockInput.js`, `shared/utils/validators.js`, `shared/utils/validationStyles.jsx`
- **Hooks:** `shared/hooks/useFormValidation.js`, `shared/hooks/useMediaQuery.js`, `shared/hooks/useSedeScope.js`
- **Servicios:** `shared/services/clientAPI.js`
- **Componentes:** `Alert.jsx`, `Button.jsx`, `HoverCart.jsx`, `Input.jsx`, `LoadingState.jsx`, `Modal.jsx`, `Search.jsx`, `SearchInput.jsx`, `Table.jsx`, `TableSkeleton.jsx` + `components/layout/`

---

## 📡 Servicios/APIs por feature

Cada servicio normaliza datos entre el formato del backend (snake_case) y el del frontend (camelCase).

| Servicio                  | Archivo                                            | Endpoints consumidos                                  |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| `authService` / `AuthAPI` | `auth/services/AuthAPI.js`                         | `/auth/*`                                             |
| `userAPI`                 | `users/services/usersAPI.js`                       | `/users`, `/roles`, `/sites`, `/auth/verify-password` |
| `RolesAPI`                | `roles/services/RolesAPI.js`                       | `/roles`, `/roles/:id`                                |
| `sedesAPI`                | `sedes/services/sedesAPI.js`                       | `/sites`                                              |
| `supplyAPI`               | `supplies/services/supplyAPI.js`                   | `/insumos`, `/categorias-insumos`                     |
| `categoryAPI`             | `categoriesSupply/services/categoryAPI.js`         | `/categorias-insumos`                                 |
| `SuppliersAPIClient`      | `suppliers/services/SuppliersAPIClient.js`         | `/proveedores`                                        |
| `thirdPartyAPI`           | `third_parties/services/thirdPartyAPI.js`          | `/terceros`                                           |
| `productAPI`              | `products/services/productAPI.js`                  | `/products`, `/products/:id/tecnicas`                 |
| `productCategoryAPI`      | `productCategories/services/productCategoryAPI.js` | `/product-categories`                                 |
| `shoppingAPI`             | `shopping/services/shoppingAPI.js`                 | `/compras`, `/compras/detalle-purchase`               |
| `ProductionAPIClient`     | `production/services/ProductionAPIClient.js`       | `/produccion/*`                                       |
| `ProductionAPI`           | `production/services/ProductionAPI.js`             | Mock local (producción)                               |
| `employeesAPI`            | `employees/services/employeesAPI.js`               | Mock local                                            |
| `clientAPI`               | `shared/services/clientAPI.js`                     | `/clients`                                            |

> **Nota:** Algunos servicios (producción, empleados) usan **datos mock locales** cuando el backend no está disponible, siguiendo el patrón de "modo offline".

---

## 🪝 Hooks por feature

| Feature               | Hooks                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| **auth**              | `useAuth.js`                                                                           |
| **users**             | `useUsers.js`, `useUserDetail.js`, `useUserSearch.js`, `useCatalogs.js`                |
| **roles**             | `useRoles.js`, `useRolDetail.js`, `useRolSearch.js`                                    |
| **sedes**             | `useSedes.js`, `useSedesSearch.js`                                                     |
| **supplies**          | `useSupplies.js`, `useSupplyDetail.js`, `useSupplySearch.js`                           |
| **categoriesSupply**  | `useCategories.js`                                                                     |
| **productCategories** | `useProductCategories.js`                                                              |
| **products**          | `useProducts.js`, `useProductDetail.js`, `useProductSearch.js`, `useTechnicalSheet.js` |
| **suppliers**         | `useSupplierDetail.js`, `useSupplierSearch.js`, `mockSuppliers.js`                     |
| **third_parties**     | `useThird_partiesDetail.js`, `useThird_partiesSearch.js`, `mockThird_parties.js`       |
| **shopping**          | `useShoppings.js`, `useShoppingSearch.js`                                              |
| **production**        | `useProduction.js`, `useTechnicalSheet.js`, `ProductionAPI.js`                         |
| **employees**         | `useEmployeeDetail.js`, `useEmployeeSearch.js`, `mockEmployees.js`                     |
| **shared**            | `useFormValidation.js`, `useMediaQuery.js`, `useSedeScope.js`                          |

---

## 🧩 Componentes y páginas

### Componentes compartidos (`shared/components/`)

| Componente          | Descripción           |
| ------------------- | --------------------- |
| `Alert.jsx`         | Alertas/toasts        |
| `Button.jsx`        | Botón reutilizable    |
| `HoverCart.jsx`     | Tarjeta con hover     |
| `Input.jsx`         | Campo de entrada      |
| `LoadingState.jsx`  | Estado de carga       |
| `Modal.jsx`         | Modal reutilizable    |
| `Search.jsx`        | Barra de búsqueda     |
| `SearchInput.jsx`   | Input de búsqueda     |
| `Table.jsx`         | Tabla genérica        |
| `TableSkeleton.jsx` | Skeleton para tablas  |
| `layout/`           | Componentes de layout |

### Páginas principales

| Página                       | Ruta                             |
| ---------------------------- | -------------------------------- |
| `LoginPage.jsx`              | `/`                              |
| `ProfilePage.jsx`            | `/layout/perfil`                 |
| `dashboard.jsx`              | `/layout`, `/layout/dashboard`   |
| `UsersPage.jsx`              | `/layout/usuarios`               |
| `RolesPage.jsx`              | `/layout/roles`                  |
| `sedesPage.jsx`              | `/layout/sedes`                  |
| `SuppliesPage.jsx`           | `/layout/insumos`                |
| `CategoriesSupplyPage.jsx`   | `/layout/categorias-insumos`     |
| `SuppliersPage.jsx`          | `/layout/proveedores`            |
| `Third_partiesPage.jsx`      | `/layout/terceros`               |
| `ProductsPage.jsx`           | `/layout/productos`              |
| `ProductCategoriesPage.jsx`  | `/layout/categorias-productos`   |
| `ShoppingsPage.jsx`          | `/layout/compras`                |
| `ProductionPage.jsx`         | `/layout/produccion`             |
| `ProductionDetailsPage.jsx`  | `/layout/produccion/detalle/:id` |
| `ProductionCalendarPage.jsx` | `/layout/produccion/calendario`  |
| `EmployeesPage.jsx`          | `/layout/empleados`              |

---

## 🧰 Utilidades compartidas

### `shared/utils/httpClient.js`

Cliente HTTP centralizado (ver [sección](#-cliente-http-centralizado)).

### `shared/utils/blockInput.js`

Bloquea caracteres no deseados en inputs (ej. NIT solo dígitos y guiones).

### `shared/utils/validators.js`

Funciones de validación de formularios (regex, campos requeridos, etc.).

### `shared/utils/validationStyles.jsx`

Estilos de validación para inputs.

### `shared/hooks/`

- `useFormValidation.js` — validación de formularios.
- `useMediaQuery.js` — media queries responsive.
- `useSedeScope.js` — alcance por sede.

---

## ⚙️ Variables de entorno

Archivo `.env` en la raíz del frontend:

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_API_URL=http://localhost:3000/api
VITE_AUTH_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Google OAuth (opcional)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 📌 Notas finales

- **URL desarrollo:** `http://localhost:5173`
- **Backend:** `http://localhost:3000/api`
- **Autenticación:** JWT almacenado en `session_user` (localStorage/sessionStorage).
- **Modo offline:** varios servicios usan datos mock cuando el backend no responde.
- **Estado de sesión:** `AuthContext` + `PrivateRoute` controlan el acceso por módulo.

**Última actualización:** 2026

---
