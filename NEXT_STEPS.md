# 🚀 Próximos Pasos - Integración Frontend/Backend

## ✅ Lo que Ya Está Hecho

1. **Cliente HTTP Centralizado** → `src/features/shared/utils/httpClient.js`
   - Maneja todas las peticiones HTTP
   - Gestión automática de tokens JWT
   - Error handling robusto
   - Fallback a datos mock

2. **Servicios Actualizados** (con fallback offline)
   - ✅ Autenticación (`auth/services/AuthAPI.js`)
   - ✅ Usuarios (`users/services/usersAPI.js`)
   - ✅ Productos (`products/services/productAPI.js`)

3. **Documentación Completa** → `API_INTEGRATION_GUIDE.md`
   - Todos los endpoints requeridos documentados
   - Formatos de request/response
   - Ejemplos de uso

---

## 📋 Servicios Pendientes de Actualizar

Sigue el mismo patrón que hicimos con Usuarios y Productos:

### 1. **Categorías** - `src/features/categories/services/`
```javascript
// Agregar al inicio
import httpClient from "../../shared/utils/httpClient";

// En cada método: try httpClient.get/post/put/delete, catch fallback
```

### 2. **Categorías de Suministros** - `src/features/categoriesSupply/services/`

### 3. **Producción** - `src/features/production/services/`

### 4. **Suministros/Supplies** - `src/features/supplies/services/`

### 5. **Empleados/Employees** - `src/features/employees/services/`

### 6. **Compras/Shopping** - `src/features/shopping/services/`

### 7. **Proveedores/Suppliers** - `src/features/suppliers/services/`

### 8. **Terceros/Third Parties** - `src/features/third_parties/services/`

### 9. **Sedes** - `src/features/sedes/services/`

### 10. **Roles** - `src/features/roles/services/`

---

## 🧪 Cómo Probar la Conexión

### **Paso 1: Verificar que el Backend esté corriendo**
```bash
# En la terminal del backend
npm run dev
# o
npm start

# Debe estar en: http://localhost:3000
```

### **Paso 2: Iniciar el Frontend**
```bash
cd frontend/Unistock
npm run dev
# Debe estar en: http://localhost:5173 (o el puerto que Vite asigne)
```

### **Paso 3: Prueba el Login**
1. Abre la app en `http://localhost:5173`
2. Intenta hacer login
3. **Abre la Consola** (F12 → Console) para ver mensajes:
   - ✅ Si ve "Backend no disponible" → El backend no responde
   - ✅ Si login funciona → ¡La conexión está bien!

### **Paso 4: Revisa la Red** (Network tab)
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Haz click en "Login"
4. Busca una petición a `localhost:3000/api/auth/login`
5. Verifica el Status: debe ser `200` si es exitoso

---

## 🛠️ Checklist para tu Backend

Asegúrate de que tu backend implemente:

### Autenticación
- [ ] `POST /api/auth/login` → Retorna `{ user: { id, nombre, correo, rolId, sedeId, token } }`
- [ ] `POST /api/auth/logout`
- [ ] `POST /api/auth/recovery-code`
- [ ] `POST /api/auth/verify-code`
- [ ] `POST /api/auth/change-password`

### Usuarios
- [ ] `GET /api/users` → Lista de usuarios
- [ ] `GET /api/users/:id` → Usuario individual
- [ ] `POST /api/users` → Crear usuario
- [ ] `PUT /api/users/:id` → Actualizar usuario
- [ ] `DELETE /api/users/:id`
- [ ] `PATCH /api/users/:id/toggle-status` → Cambiar estado

### Productos
- [ ] `GET /api/products` → Lista de productos
- [ ] `GET /api/products/:id`
- [ ] `POST /api/products`
- [ ] `PUT /api/products/:id`
- [ ] `DELETE /api/products/:id`
- [ ] `PATCH /api/products/:id/toggle-active`

### Otros (ver `API_INTEGRATION_GUIDE.md`)
- [ ] Categorías
- [ ] Sedes
- [ ] Roles
- [ ] Producción
- [ ] Etc...

---

## 🔐 CORS - Si obtienes error de CORS

Si ves un error como:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS
```

**En tu backend Express**, agrega CORS:

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 🔑 JWT Token - Configurar en el Backend

### El Frontend espera:
```json
{
  "user": {
    "id": "1",
    "nombre": "Juan",
    "correo": "juan@example.com",
    "rolId": 1,
    "sedeId": 1,
    "token": "eyJhbGciOiJIUzI1NiIs..." // JWT
  }
}
```

### El token se guarda en `sessionStorage`:
```javascript
sessionStorage.getItem("session_user")
// → {"id":"1","nombre":"Juan","correo":"juan@example.com",...,"token":"eyJhb..."}
```

### Los headers posteriores incluyen:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📊 Variables de Entorno

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (`.env` típico)
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=unistock
JWT_SECRET=tu_secret_key_aqui
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 🐛 Debugging

### Ver qué endpoints se están llamando:
```javascript
// En Chrome DevTools → Network tab
// Filtrar por: fetch/xhr
// Ver las peticiones a localhost:3000/api/*
```

### Ver qué hay en sessionStorage:
```javascript
// En Console:
sessionStorage.getItem("session_user")
```

### Ver logs del httpClient:
```javascript
// Los logs automáticos aparecen en la consola:
// "Backend no disponible, usando datos locales:"
// o error detallado si falla
```

---

## 🎯 Orden Recomendado para Actualizar Servicios

1. Entiende el patrón con **Usuarios** y **Productos** ✅
2. Actualiza los más críticos:
   - Categorías
   - Sedes
   - Roles
3. Luego los de negocio:
   - Producción
   - Suministros
   - Compras
4. Finalmente los auxiliares:
   - Terceros
   - Empleados
   - Etc.

---

## 📝 Patrón a Seguir

Para cada servicio:

```javascript
import httpClient from "../../shared/utils/httpClient";

export const serviceAPI = {
  getAll: async () => {
    try {
      return await httpClient.get("/endpoint");
    } catch (error) {
      console.warn("Backend no disponible:", error.message);
      // Aquí va tu fallback con datos mock
      return mockData;
    }
  },
  
  // Igual con create, update, delete, etc.
};
```

---

## ✨ Una Vez Todo Esté Conectado

1. **Elimina los datos mock** si el backend es confiable
2. **Configura base de datos** en el backend
3. **Agrega validaciones** en ambos lados
4. **Implementa logging** para debugging
5. **Configura errores** consistentes entre frontend y backend

---

**¿Preguntas?** Revisa `API_INTEGRATION_GUIDE.md` para más detalles.
