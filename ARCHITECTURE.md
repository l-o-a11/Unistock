# 🏗️ Arquitectura Frontend-Backend

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
│  │  ├─ AuthContext → Gestiona sesión del usuario          │ │
│  │  └─ Llama a servicios (APIs)                           │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Services / APIs (usersAPI, productAPI, etc.)          │ │
│  │                                                          │ │
│  │  ├─ Try: httpClient.get/post/put/delete()             │ │
│  │  │         (Conecta al Backend)                        │ │
│  │  │                                                      │ │
│  │  └─ Catch: Retorna datos mock (Offline Mode)          │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  httpClient.js (Cliente HTTP Centralizado)             │ │
│  │                                                          │ │
│  │  ✓ GET, POST, PUT, PATCH, DELETE                       │ │
│  │  ✓ Autenticación con JWT (sessionStorage)              │ │
│  │  ✓ Headers: Authorization: Bearer {token}              │ │
│  │  ✓ URL Base: http://localhost:3000/api                │ │
│  │  ✓ Timeout: 10 segundos                               │ │
│  │  ✓ Error handling robusto                              │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      │ Fetch API
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                    │
│                   http://localhost:3000                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Express Server                                           │ │
│  │  CORS habilitado para http://localhost:5173              │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Routes / Controllers                                  │ │
│  │  /api/auth/login                                       │ │
│  │  /api/auth/logout                                      │ │
│  │  /api/users (GET, POST, PUT, DELETE)                 │ │
│  │  /api/products (GET, POST, PUT, DELETE)              │ │
│  │  /api/categories (GET, POST, PUT, DELETE)            │ │
│  │  etc...                                                │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Middleware                                             │ │
│  │  ├─ CORS                                               │ │
│  │  ├─ JWT Verification                                  │ │
│  │  └─ Error Handling                                    │ │
│  └──────────────────┬──────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │  Database                                               │ │
│  │  (PostgreSQL, MySQL, MongoDB, etc.)                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos Actualizada

```
frontend/Unistock/
├── .env ────────────────────────── ✅ Variables de entorno
│   ├─ VITE_API_URL=http://localhost:3000/api
│   ├─ VITE_API_TIMEOUT=10000
│   └─ VITE_GOOGLE_CLIENT_ID=xxx
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   │   └─ AuthAPI.js ────── ✅ Conecta al backend
│   │   │   ├── hooks/
│   │   │   │   └─ useAuth.js
│   │   │   └── pages/
│   │   │       └─ LoginPage.jsx
│   │   │
│   │   ├── users/
│   │   │   ├── services/
│   │   │   │   └─ usersAPI.js ───── ✅ Con fallback
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   │
│   │   ├── products/
│   │   │   ├── services/
│   │   │   │   └─ productAPI.js ── ✅ Con fallback
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   │
│   │   ├── categories/
│   │   ├── production/
│   │   ├── supplies/
│   │   ├── shared/
│   │   │   └── utils/
│   │   │       └─ httpClient.js ─── ✅ Cliente HTTP centralizado
│   │   └── ... (otros módulos)
│   │
│   └── App.jsx
│
├── API_INTEGRATION_GUIDE.md ─────── 📖 Documentación de endpoints
├── NEXT_STEPS.md ───────────────── 📝 Próximos pasos
└── package.json
```

---

## Flujo de una Petición HTTP (Ejemplo: Login)

```
1. Usuario hace login en LoginForm
   ├─ Ingresa email/contraseña
   └─ Click en "Iniciar Sesión"

2. Component llama a useAuth hook
   └─ setLoading(true)

3. useAuth llama AuthAPI.login()
   └─ try { httpClient.post("/auth/login", credentials) }

4. httpClient.js:
   ├─ Construye URL: http://localhost:3000/api/auth/login
   ├─ Headers: { Content-Type: application/json }
   ├─ Body: { username: "...", password: "..." }
   └─ fetch() envía la petición

5. Backend responde:
   ├─ ✅ 200 OK: { user: { id, nombre, correo, rolId, token } }
   ├─ 401 Unauthorized: { message: "Credenciales inválidas" }
   └─ 500 Error: { message: "Error interno del servidor" }

6. httpClient.js:
   ├─ ✅ Si 200: Retorna la respuesta parseada
   ├─ ❌ Si error: Lanza excepción con detalles

7. AuthAPI.js:
   ├─ ✅ Si success: Guarda sesión en sessionStorage
   │   └─ sessionStorage.setItem("session_user", JSON.stringify(response.user))
   └─ ❌ Si error: Fallback a datos mock (development)

8. useAuth retorna:
   ├─ ✅ { user, error: null }
   └─ Component actualiza UI

9. Component:
   ├─ ✅ Si login exitoso: Redirige a Dashboard
   └─ ❌ Si error: Muestra mensaje de error
```

---

## Modo Offline (Fallback)

```
┌──────────────────────────────────────────┐
│  Backend NO está disponible              │
└─────────────┬──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│  httpClient intenta fetch()              │
│  → Timeout o conexión rechazada          │
└─────────────┬──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│  Catch en AuthAPI/usersAPI/productAPI    │
│  → console.warn("Backend no disponible")│
└─────────────┬──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│  Retorna datos mock locales              │
│  (mockUsers, mockProducts, etc.)         │
│                                          │
│  ✓ App funciona sin internet             │
│  ✓ Perfecto para desarrollo              │
│  ✓ Cambios se pierden al recargar        │
└──────────────────────────────────────────┘
```

---

## Autenticación con JWT

```
1. Login → Backend genera JWT
   { user: { id, nombre, correo, rolId, sedeId, token: "eyJhb..." } }

2. httpClient guarda en sessionStorage
   sessionStorage.setItem("session_user", JSON.stringify(user))

3. En peticiones posteriores:
   ├─ httpClient.get() → Lee token de sessionStorage
   ├─ Agrega header: Authorization: Bearer eyJhb...
   └─ Backend verifica el token

4. Si token es inválido/expirado:
   ├─ Backend retorna 401 Unauthorized
   ├─ Frontend debería limpiar sessionStorage
   └─ Redirige a login
```

---

## Manejo de Errores

```
┌────────────────────────────────────────────┐
│  Backend retorna error                     │
│  Response: { status: 400, message: "..." } │
└──────────────┬───────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  httpClient.js detecta !response.ok         │
│  → Lanza Error personalizado                │
│  → error.message: "..."                    │
│  → error.status: 400                       │
│  → error.data: { message, ... }            │
└──────────────┬───────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  Service (usersAPI, etc.) lo captura       │
│  → try/catch                               │
│  → console.warn("Backend no disponible")  │
│  → Retorna fallback mock data              │
└────────────────────────────────────────────┘
```

---

## Variables de Entorno

### Frontend `.env`
```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Google OAuth (opcional)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend `.env` (típico)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=unistock

# JWT
JWT_SECRET=tu_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (si usas)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña
```

---

## Checklist de Integración

- [x] Cliente HTTP configurado
- [x] Variables de entorno setup
- [x] Autenticación con backend
- [x] Usuarios con backend
- [x] Productos con backend
- [ ] Categorías
- [ ] Sedes
- [ ] Roles
- [ ] Producción
- [ ] Suministros
- [ ] Compras
- [ ] Empleados
- [ ] Terceros
- [ ] Testing completo
- [ ] CORS configurado en backend
- [ ] JWT funcionando
- [ ] Errores manejados consistentemente

---

## URLs de Desarrollo

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3000
API:       http://localhost:3000/api

DevTools:  F12
Network:   F12 → Network tab
Console:   F12 → Console tab
```

---

## Conclusión

✅ **Ahora tu frontend está listo para conectarse con tu backend.**

**Próximo paso**: 
1. Asegúrate de que tu backend tenga los endpoints en `API_INTEGRATION_GUIDE.md`
2. Configura CORS
3. Implementa JWT
4. Prueba el login
5. Actualiza los demás servicios siguiendo el patrón

**¿Todo funciona?** 🎉 ¡Felicidades! Tu app ya está integrada.
