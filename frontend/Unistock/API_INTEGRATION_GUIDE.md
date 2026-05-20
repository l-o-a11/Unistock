# 📡 Guía de Integración Frontend-Backend

## Configuración General

El frontend está configurado para conectarse al backend en:
- **URL Base**: `http://localhost:3000/api`
- **Timeout**: 10 segundos
- **Autenticación**: Bearer Token (JWT)

### Variables de Entorno

Editar `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEVITE_GOOGLE_CLIENT_IDOUT=10000
=xxx.apps.googleusercontent.com
```

## Cliente HTTP

Ubicación: [src/features/shared/utils/httpClient.js](src/features/shared/utils/httpClient.js)

### Uso en servicios:

```javascript
import httpClient from "../../shared/utils/httpClient";

// GET
const data = await httpClient.get("/users");

// POST
const result = await httpClient.post("/users", { name: "Juan" });

// PUT
await httpClient.put("/users/1", { name: "Juan Actualizado" });

// DELETE
await httpClient.delete("/users/1");

// Sin autenticación
await httpClient.post("/auth/login", credentials, { skipAuth: true });
```

## Endpoints Requeridos del Backend

### 🔐 Autenticación

#### POST `/auth/login`
**Descripción**: Autenticar usuario
**Body**:
```json
{
  "username": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200)**:
```json
{
  "user": {
    "id": "1",
    "nombre": "Juan Pérez",
    "correo": "usuario@example.com",
    "rolId": 1,
    "sedeId": 1,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST `/auth/logout`
**Descripción**: Cerrar sesión
**Response (200)**: `{ "success": true }`

#### POST `/auth/recovery-code`
**Descripción**: Enviar código de recuperación
**Body**:
```json
{
  "email": "usuario@example.com"
}
```

#### POST `/auth/verify-code`
**Descripción**: Verificar código de recuperación
**Body**:
```json
{
  "email": "usuario@example.com",
  "code": "123456"
}
```

#### POST `/auth/change-password`
**Descripción**: Cambiar contraseña
**Body**:
```json
{
  "email": "usuario@example.com",
  "code": "123456",
  "newPassword": "newPassword123"
}
```

---

### 👥 Usuarios

#### GET `/users`
**Headers**: `Authorization: Bearer {token}`
**Response (200)**:
```json
[
  {
    "id": "1",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com",
    "rolId": 1,
    "sedeId": 1,
    "estado": true,
    "phone": "3001234567"
  }
]
```

#### GET `/users/:id`
**Response (200)**: Usuario individual

#### POST `/users`
**Body**:
```json
{
  "nombreCompleto": "Nuevo Usuario",
  "correo": "nuevo@example.com",
  "phone": "3001234567",
  "rolId": 2,
  "sedeId": 1
}
```

#### PUT `/users/:id`
**Body**: Mismos campos a actualizar
**Response (200)**: Usuario actualizado

#### DELETE `/users/:id`
**Response (204)**: Sin contenido

---

### 📦 Productos

#### GET `/products`
**Query params**: `?page=1&limit=10&category=Crop%20Top`
**Response (200)**:
```json
[
  {
    "id": "772",
    "reference": "772",
    "name": "Crop Top Negro",
    "category": "Crop Top",
    "price": 33000,
    "stock": 5,
    "active": true,
    "technicalSheetVersions": 2,
    "lastVersionDate": "2026-02-10"
  }
]
```

#### GET `/products/:id`
**Response (200)**: Producto completo

#### POST `/products`
**Body**:
```json
{
  "reference": "NEW001",
  "name": "Nuevo Producto",
  "category": "Crop Top",
  "price": 50000,
  "stock": 10
}
```

#### PUT `/products/:id`
**Body**: Campos a actualizar

#### DELETE `/products/:id`

---

### 📋 Categorías

#### GET `/categories`
**Response (200)**:
```json
[
  { "id": 1, "name": "Crop Top" },
  { "id": 2, "name": "Vestidos" }
]
```

#### POST `/categories`
**Body**: `{ "name": "Nueva Categoría" }`

#### PUT `/categories/:id`
**Body**: `{ "name": "Nombre Actualizado" }`

#### DELETE `/categories/:id`

---

### 🏢 Sedes

#### GET `/sedes`
**Response (200)**:
```json
[
  {
    "id": 1,
    "nombre": "Sede Principal",
    "ubicacion": "Bogotá",
    "telefono": "601234567"
  }
]
```

---

### 🛠️ Roles

#### GET `/roles`
**Response (200)**:
```json
[
  { "id": 1, "nombre": "Gerente" },
  { "id": 2, "nombre": "Operario" }
]
```

---

### 📊 Producción

#### GET `/production`
**Query params**: `?status=EnProduccion&page=1`

#### POST `/production`
**Body**:
```json
{
  "productId": "772",
  "quantity": 10,
  "startDate": "2026-05-04",
  "estimatedEndDate": "2026-05-10"
}
```

---

## Manejo de Errores

El cliente HTTP maneja errores automáticamente. Estructura de error esperada:

**Response (400+)**:
```json
{
  "message": "Descripción del error",
  "code": "ERROR_CODE"
}
```

Los errores se lanzan con:
```javascript
try {
  await httpClient.post("/users", data);
} catch (error) {
  console.error(error.message); // "Descripción del error"
  console.error(error.status);  // 400, 401, 500...
  console.error(error.data);    // { message, code }
}
```

---

## Modo Fallback (Offline)

Si el backend no está disponible:
- **Login**: Usa datos almacenados localmente
- **Otros endpoints**: Retornan datos simulados

Esto permite desarrollo sin backend disponible.

---

## Próximos Pasos

1. ✅ Cliente HTTP configurado
2. ✅ Autenticación con fallback
3. 📝 Actualizar servicios de:
   - Usuarios
   - Productos
   - Categorías
   - Sedes
   - Producción
4. 📝 Actualizar hooks de cada módulo
5. ✅ Probar conexión

---

## Checklist Backend

Asegúrate de que tu backend implemente:

- [ ] POST `/auth/login` - Autenticación
- [ ] POST `/auth/logout` - Cerrar sesión
- [ ] POST `/auth/recovery-code` - Código de recuperación
- [ ] GET `/users` - Listar usuarios
- [ ] POST `/users` - Crear usuario
- [ ] GET `/products` - Listar productos
- [ ] POST `/products` - Crear producto
- [ ] GET `/categories` - Listar categorías
- [ ] GET `/sedes` - Listar sedes
- [ ] GET `/roles` - Listar roles
- [ ] GET `/production` - Listar producciones
- [ ] Middleware de autenticación con JWT
- [ ] Manejo de errores con estructura consistente

---

**Última actualización**: 4 de mayo de 2026
