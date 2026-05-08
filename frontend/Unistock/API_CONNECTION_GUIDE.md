# 🔌 Conexión Backend - Frontend - API

## Estado: ✅ CONECTADO

Tu aplicación ahora tiene **conexión real** entre el frontend, backend y API. Aquí está la configuración:

---

## 📋 Resumen de Cambios

### 1️⃣ **Backend** (Node.js + Express)

📍 **Ubicación:** `c:\Users\share\Desktop\Backend`

- **URL Base:** `http://localhost:3000/api`
- **Rutas Activas:**
  - `GET /api/produccion/ordenes` → Obtener órdenes
  - `POST /api/produccion/ordenes` → Crear orden
  - `GET /api/proveedores` → Obtener proveedores
  - `POST /api/proveedores` → Crear proveedor
  - Más rutas en `src/infrastructures/routes/`

- **Autenticación:** JWT (requiere token en header `Authorization: Bearer {token}`)
- **BD:** MongoDB Atlas (configurado en `.env`)

---

### 2️⃣ **Frontend** (React + Vite)

📍 **Ubicación:** `c:\Users\share\Desktop\Unistock\frontend\Unistock`

#### Configuración (.env)

```
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

#### Clientes API Creados ✨

1. **ProductionAPIClient** (`src/features/production/services/ProductionAPIClient.js`)
   - `getOrders()` - Obtener órdenes
   - `createOrder()` - Crear orden
   - `changeOrderStatus()` - Cambiar estado
   - `cancelOrder()` - Anular orden
   - `getCalendario()` - Obtener eventos del calendario
   - `getAlertas()` - Obtener alertas

2. **SuppliersAPIClient** (`src/features/suppliers/services/SuppliersAPIClient.js`)
   - `getSuppliers()` - Obtener proveedores
   - `createSupplier()` - Crear proveedor
   - `updateSupplier()` - Actualizar proveedor
   - `deleteSupplier()` - Eliminar proveedor
   - `toggleSupplier()` - Activar/Inactivar

#### Hooks Actualizados ✨

1. **useProductions** (`src/features/production/hooks/useProduction.js`)
   - Conectado al `ProductionAPIClient`
   - Mapea respuestas backend ↔ formato frontend

2. **useSuppliers** (`src/features/suppliers/hooks/mockSuppliers.js`)
   - Conectado al `SuppliersAPIClient`
   - Mapea respuestas backend ↔ formato frontend

#### Cliente HTTP Centralizado ✨

**httpClient** (`src/features/shared/utils/httpClient.js`)

- Maneja autenticación automáticamente
- Obtiene token JWT de `sessionStorage`
- Configurable con variables de entorno

---

## 🚀 Cómo Funciona el Flujo

### Ejemplo: Obtener Órdenes de Producción

```
React Component (ProductionPage.jsx)
    ↓
useProductions Hook
    ↓
ProductionAPIClient.getOrders()
    ↓
httpClient.httpRequest('/produccion/ordenes')
    ↓ (+ Token JWT automáticamente)
Backend API (http://localhost:3000/api/produccion/ordenes)
    ↓
MongoDB (datos)
    ↓ (respuesta JSON)
httpClient (mapea respuesta)
    ↓
ProductionAPIClient (parsea datos)
    ↓
useProductions Hook (actualiza estado)
    ↓
React Component (renderiza UI)
```

---

## 📝 Mapeo de Campos

### Órdenes de Producción

| Frontend            | Backend         | Tipo             |
| ------------------- | --------------- | ---------------- |
| `id`                | `_id`           | MongoDB ObjectId |
| `orderNumber`       | `numero_orden`  | String           |
| `client`            | `cliente`       | String           |
| `status` / `estado` | `estado`        | String           |
| `deliveryDate`      | `fecha_entrega` | Date             |
| `history`           | `historial`     | Array            |

### Proveedores

| Frontend            | Backend               | Tipo             |
| ------------------- | --------------------- | ---------------- |
| `id`                | `_id`                 | MongoDB ObjectId |
| `nit`               | `nit`                 | String           |
| `nombreEmpresa`     | `nombre_de_empresa`   | String           |
| `nombreContacto`    | `nombre_del_contacto` | String           |
| `email` / `correo`  | `correo`              | String           |
| `sitioweb`          | `sitio_web`           | String           |
| `estado` / `activo` | `activo`              | Boolean          |

---

## ✅ Verificación

### 1. Backend Corriendo

```bash
cd c:\Users\share\Desktop\Backend
npm run dev
# Output: Server running on http://localhost:3000
```

### 2. Frontend Corriendo

```bash
cd c:\Users\share\Desktop\Unistock\frontend\Unistock
npm run dev
# Output: Local: http://localhost:5173
```

### 3. Probar Conexión (curl)

```bash
# Obtener órdenes (requiere token)
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:3000/api/produccion/ordenes

# Health check (sin autenticación)
curl http://localhost:3000/health
# Response: { "status": "OK", "timestamp": "..." }
```

---

## 🔐 Autenticación JWT

El frontend obtiene el token automáticamente desde `sessionStorage` bajo la clave `session_user`:

```javascript
{
  "id": "user_id",
  "nombreCompleto": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Todos los requests al backend incluyen automáticamente:

```
Authorization: Bearer {token}
```

---

## 🛠️ Archivos Modificados

✅ **Creados:**

- `src/features/production/services/ProductionAPIClient.js`
- `src/features/suppliers/services/SuppliersAPIClient.js`

✅ **Actualizados:**

- `src/features/production/hooks/useProduction.js` (ahora usa API real)
- `src/features/suppliers/hooks/mockSuppliers.js` (ahora usa API real)

---

## 📋 Próximos Pasos (Opcional)

- [ ] Actualizar componentes para mostrar mensajes de carga/error
- [ ] Implementar paginación en tablas
- [ ] Agregar filtros en tiempo real
- [ ] Manejo de estados de red (offline mode)
- [ ] Validación de formularios en frontend

---

## 🆘 Solución de Problemas

### Error: "Network Error" o "Can't reach server"

1. Verifica que el backend está corriendo: `http://localhost:3000/health`
2. Verifica que el `.env` del frontend tiene `VITE_API_URL=http://localhost:3000/api`
3. Reinicia el servidor del frontend

### Error: "Unauthorized" (401)

1. Asegúrate de que el usuario está autenticado
2. Verifica que el token está en `sessionStorage`
3. Revisar que el token no expiró

### Error: "CORS"

1. El backend ya tiene CORS habilitado (`src/app.js`)
2. Si persiste, verifica que `app.use(cors())` esté antes de las rutas

---

## 📚 Documentación de API

Ver archivos de documentación en el backend:

- `Backend/README.md` (si existe)
- `Backend/src/infrastructures/routes/productionRoutes.js`
- `Backend/src/infrastructures/routes/suppliersRoutes.js`
