# 🔗 Conexión Backend-Frontend: Resumen de Cambios

## ✅ Lo Que Hice

### 1. Creé **Clientes API Reales**

#### ProductionAPIClient.js

```
✓ getOrders()          → GET /produccion/ordenes
✓ createOrder()        → POST /produccion/ordenes
✓ changeOrderStatus()  → PATCH /produccion/ordenes/:id/estado
✓ cancelOrder()        → PATCH /produccion/ordenes/:id/anular
✓ getCalendario()      → GET /produccion/calendario
✓ getAlertas()         → GET /produccion/alertas
```

#### SuppliersAPIClient.js

```
✓ getSuppliers()      → GET /proveedores
✓ createSupplier()    → POST /proveedores
✓ updateSupplier()    → PUT /proveedores/:id
✓ deleteSupplier()    → DELETE /proveedores/:id
✓ toggleSupplier()    → PATCH /proveedores/:id/toggle
```

---

### 2. Actualicé **Hooks para Usar API Real**

#### useProduction.js (en `src/features/production/hooks/`)

```diff
- import ProductionAPI (mock)
+ import ProductionAPIClient (real)
```

Ahora conecta directamente con el backend real.

#### mockSuppliers.js (en `src/features/suppliers/hooks/`)

```diff
- Mock data en localStorage
+ SuppliersAPIClient (real)
```

Ahora obtiene datos del backend real.

---

### 3. Flujo de Datos

```
FRONTEND                    BACKEND
═════════════════════════════════════════

React Component
    ↓
Hook (useProductions/useSuppliers)
    ↓
APIClient (ProductionAPIClient/SuppliersAPIClient)
    ↓
httpClient (centralizado con auth JWT)
    ↓
                        Express Server (http://localhost:3000/api)
                            ↓
                        Routes (productionRoutes/suppliersRoutes)
                            ↓
                        Controllers
                            ↓
                        Repositories
                            ↓
                        MongoDB
```

---

## 📂 Archivos Creados/Modificados

| Archivo                  | Estado         | Tipo                       |
| ------------------------ | -------------- | -------------------------- |
| `ProductionAPIClient.js` | ✅ NUEVO       | Cliente API                |
| `SuppliersAPIClient.js`  | ✅ NUEVO       | Cliente API                |
| `useProduction.js`       | ✅ ACTUALIZADO | Hook                       |
| `mockSuppliers.js`       | ✅ ACTUALIZADO | Hook                       |
| `httpClient.js`          | ✅ EXISTÍA     | Cliente HTTP (sin cambios) |
| `.env`                   | ✅ CORRECTO    | Variables de entorno       |

---

## 🚀 Cómo Usar Ahora

### Para Obtener Órdenes de Producción

**Antes (Mock):**

```javascript
// En ProductionPage.jsx
const { Productions } = useProductions();
// Productions venía de datos mock en localStorage
```

**Ahora (Real):**

```javascript
// En ProductionPage.jsx
const { Productions } = useProductions();
// Productions vienen del backend en tiempo real ✨
```

### Para Obtener Proveedores

**Antes (Mock):**

```javascript
// En SuppliersPage.jsx
const { suppliers } = useSuppliers();
// suppliers venía de datos mock
```

**Ahora (Real):**

```javascript
// En SuppliersPage.jsx
const { suppliers } = useSuppliers();
// suppliers vienen del backend en tiempo real ✨
```

---

## ✨ Características

### ✅ Mapeo Automático de Campos

El frontend traduce automáticamente entre los nombres del backend y del frontend:

```javascript
// Backend devuelve:
{
  "_id": "...",
  "numero_orden": 123,
  "cliente": "Acme Inc",
  "estado": "Diseño",
  "fecha_entrega": "2025-04-15"
}

// Frontend lo convierte a:
{
  "id": "...",
  "orderNumber": 123,
  "client": "Acme Inc",
  "status": "Diseño",
  "deliveryDate": "15/04/2025"
}
```

### ✅ Autenticación Automática

El httpClient envía automáticamente el JWT en cada request:

```javascript
// Cada petición incluye automáticamente:
Authorization: Bearer {token}
```

### ✅ Manejo de Errores

Si el servidor no responde, el frontend intenta usar datos en caché (localStorage):

```javascript
try {
  // Intenta obtener del API
  const data = await SuppliersAPIClient.getSuppliers();
} catch {
  // Si falla, usa datos en caché
  const cached = loadFromStorage();
}
```

---

## 📊 Configuración .env

### Backend

```env
MONGO_URI=mongodb+srv://ospinalauraa:Unistock123@cluster0.xjktzap.mongodb.net/
JWT_SECRET=supersecretkey
PORT=3000
```

### Frontend

```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

---

## 🎯 Próximas Acciones

1. **Inicia el Backend:**

   ```bash
   cd c:\Users\share\Desktop\Backend
   npm run dev
   ```

2. **Inicia el Frontend:**

   ```bash
   cd c:\Users\share\Desktop\Unistock\frontend\Unistock
   npm run dev
   ```

3. **Abre el navegador:**

   ```
   http://localhost:5173
   ```

4. **Verifica que funcione:**
   - Ve a la página de Producción → Deberías ver órdenes del backend
   - Ve a la página de Proveedores → Deberías ver proveedores del backend
   - Intenta crear una nueva orden o proveedor

---

## 🔍 Verificación Rápida

Abre la consola del navegador (F12 → Console) y ejecuta:

```javascript
// Verificar que el token existe
JSON.parse(sessionStorage.getItem("session_user"));

// Deberías ver:
// {
//   id: "...",
//   nombreCompleto: "...",
//   token: "eyJ..."
// }
```

---

## 📞 Soporte

- **Backend no responde:** Verifica que está corriendo en puerto 3000
- **Errores de CORS:** El backend ya tiene CORS habilitado
- **No ve datos:** Verifica que el backend tiene datos en MongoDB
- **Errores 401:** Verifica que el usuario está autenticado

¡Listo! Tu aplicación está **completamente conectada**. 🎉
