# 🧪 Guía de Prueba Rápida

## Verificar que Todo Está Conectado

### Paso 1: Inicia el Backend

```bash
cd c:\Users\share\Desktop\Backend
npm run dev
```

**Esperado:**

```
Server running on http://localhost:3000
Health: http://localhost:3000/health
Protected: http://localhost:3000/api/produccion/ordenes (requires JWT)
```

### Paso 2: Inicia el Frontend

```bash
cd c:\Users\share\Desktop\Unistock\frontend\Unistock
npm run dev
```

**Esperado:**

```
Local: http://localhost:5173
```

### Paso 3: Abre el Frontend en el Navegador

```
http://localhost:5173
```

---

## 🔍 Pruebas de Funcionalidad

### Test 1: Obtener Órdenes de Producción

**Qué debe pasar:**

1. Abre la pestaña **Producción** en el frontend
2. Deberías ver una lista de órdenes cargada del backend (puede estar vacía inicialmente)
3. No debe haber errores en la consola del navegador

**Verificación en Console:**

```javascript
// En la consola del navegador (F12 → Console)
// Deberías ver logs como:
// "✓ Órdenes cargadas: [...]"
```

---

### Test 2: Obtener Proveedores

**Qué debe pasar:**

1. Abre la pestaña **Proveedores** en el frontend
2. Deberías ver una lista de proveedores cargada del backend
3. No debe haber errores en la consola

---

### Test 3: Crear una Nueva Orden

**Qué debe pasar:**

1. En la pestaña **Producción**, haz clic en **+ Crear Orden**
2. Completa el formulario (cliente, fecha de entrega)
3. Haz clic en **Guardar**
4. La nueva orden debe aparecer en la lista

**Network Tab (F12 → Network):**

- Deberías ver un POST a `http://localhost:3000/api/produccion/ordenes`
- Status: **201 Created**

---

### Test 4: Crear un Nuevo Proveedor

**Qué debe pasar:**

1. En la pestaña **Proveedores**, haz clic en **+ Agregar Proveedor**
2. Completa el formulario
3. Haz clic en **Guardar**
4. El nuevo proveedor debe aparecer en la lista

**Network Tab:**

- POST a `http://localhost:3000/api/proveedores`
- Status: **201 Created**

---

### Test 5: Cambiar Estado de una Orden

**Qué debe pasar:**

1. En la lista de órdenes, cambia el estado de alguna
2. El estado debe actualizarse en el frontend

**Network Tab:**

- PATCH a `http://localhost:3000/api/produccion/ordenes/{id}/estado`

---

## 🐛 Debugging

### Abrir DevTools (F12)

#### 1. **Console Tab**

- Busca mensajes de error rojo
- Busca logs de carga de datos
- Copia todo los errores que veas

#### 2. **Network Tab**

- Filtra por `XHR` (XMLHttpRequest)
- Mira las peticiones al backend
- Verifica que el status sea 200, 201, etc. (no 400, 401, 500)
- Si hay error, haz clic en la petición y mira la sección **Response**

#### 3. **Storage Tab**

- Busca `sessionStorage`
- Verifica que exista `session_user` con el token JWT

---

## ✅ Checklist de Verificación

- [ ] Backend corre en `http://localhost:3000`
- [ ] Frontend corre en `http://localhost:5173`
- [ ] `.env` del frontend tiene `VITE_API_URL=http://localhost:3000/api`
- [ ] No hay errores CORS en la consola
- [ ] Las órdenes se cargan en la página de Producción
- [ ] Los proveedores se cargan en la página de Proveedores
- [ ] Puedes crear una nueva orden
- [ ] Puedes crear un nuevo proveedor
- [ ] No hay errores 401 (Unauthorized)

---

## 📊 Requests Esperados

### Producción

```
GET /api/produccion/ordenes?page=1&limit=100
POST /api/produccion/ordenes
PATCH /api/produccion/ordenes/{id}/estado
PATCH /api/produccion/ordenes/{id}/anular
```

### Proveedores

```
GET /api/proveedores?page=1&limit=100&sortBy=nombre_de_empresa
POST /api/proveedores
PUT /api/proveedores/{id}
DELETE /api/proveedores/{id}
PATCH /api/proveedores/{id}/toggle
```

---

## 🎯 Si Algo No Funciona

### Paso 1: Verifica que ambos servidores estén corriendo

```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd Unistock\frontend\Unistock && npm run dev
```

### Paso 2: Revisa la consola del backend

- ¿Hay errores al conectar a MongoDB?
- ¿Hay errores en las rutas?

### Paso 3: Revisa la consola del frontend (F12)

- ¿Hay errores de conexión?
- ¿El httpClient está enviando el token?

### Paso 4: Verifica el .env

```
# Backend: c:\Users\share\Desktop\Backend\.env
MONGO_URI=mongodb+srv://ospinalauraa:Unistock123@cluster0.xjktzap.mongodb.net/
JWT_SECRET=supersecretkey

# Frontend: c:\Users\share\Desktop\Unistock\frontend\Unistock\.env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

---

## 🆘 Mensajes de Error Comunes

### "Cannot reach server"

- ✓ Verifica que el backend está corriendo en puerto 3000
- ✓ Intenta `http://localhost:3000/health` en el navegador

### "Unauthorized (401)"

- ✓ El usuario no está autenticado
- ✓ Verifica que hay un token válido en `sessionStorage`

### "CORS error"

- ✓ El backend ya tiene CORS habilitado
- ✓ Si persiste, reinicia ambos servidores

### MongoDB error

- ✓ Verifica que `MONGO_URI` en `.env` es correcto
- ✓ Verifica que tienes internet (conexión a MongoDB Atlas)

---

¡Listo! 🎉 Si todo esto funciona, tu aplicación está **100% conectada**. 🚀
