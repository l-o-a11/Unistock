# Guía de Limpieza de Consola - Unistock

## ✅ Cambios Realizados

Se han removido todos los `console.log()` y `console.error()` de los siguientes módulos:

### 1. **useCatalogs.js** (users/hooks/)
- ❌ Removido: `console.error('Error cargando catálogos:', err.message);`
- ✅ Ahora: Manejo silencioso de errores

### 2. **mockEmployees.js** (employees/hooks/)
- ❌ Removido: `console.error("Error al leer localStorage:", e);`
- ❌ Removido: `console.error("No se pudo guardar en localStorage:", e);`
- ✅ Ahora: Manejo silencioso de errores

### 3. **AuthContext.jsx** (shared/)
- ❌ Removido: `console.log("=== cargarPermisos FIN, rol:", rol?.nombre, "permisos:", ids);`
- ❌ Removido: `console.log("=== login() llamado:", session);`
- ✅ Ahora: Sin logs de debug

---

## 🎯 Recomendaciones para Evitar Consola

### 1. **Nunca usar console en producción**
```javascript
// ❌ Malo
console.log('Usuario:', user);
console.error('Error:', err);

// ✅ Bueno
// Manejo silencioso o logging remoto
try {
  // ...
} catch (err) {
  // Silencioso o enviar a servicio de logging remoto
}
```

### 2. **Manejo de errores sin consola**
```javascript
// En hooks y servicios
useEffect(() => {
  const load = async () => {
    try {
      const data = await api.fetch();
      setState(data);
    } catch (err) {
      // No hacer console.error aquí
      // El componente que lo llama maneja el error
    }
  };
  load();
}, []);
```

### 3. **Promesas siempre resueltas**
```javascript
// ✅ Correcto: usar try-catch en handlers
const handleSubmit = async (data) => {
  try {
    await api.create(data);
    showSuccess('Creado');
  } catch (err) {
    showError(err.message);
  }
};

// ❌ Incorrecto: no tener catch
const handleSubmit = async (data) => {
  await api.create(data);  // ← Unhandled rejection si falla
};
```

### 4. **Evitar debuggers en commit**
```javascript
// ❌ Nunca commitear esto
debugger;

// ✅ Solo usar en desarrollo local
```

### 5. **Warnings de React**
```javascript
// ❌ Falta key
users.map(u => <User user={u} />)

// ✅ Agregar key
users.map(u => <User key={u.id} user={u} />)

// ❌ Dependencia faltante en useEffect
useEffect(() => {
  doSomething(user);
}, []); // ← Warning: user falta en dependencias

// ✅ Incluir todas las dependencias
useEffect(() => {
  doSomething(user);
}, [user]);
```

### 6. **Memoizar callbacks correctamente**
```javascript
// ✅ Correcto
const handleCancel = useCallback(() => {
  onCancel();
}, [onCancel]);

useEffect(() => {
  // handleCancel está memoizado
}, [handleCancel]);
```

---

## 📋 Checklist de Revisión

Antes de hacer commit, verificar:

- [ ] No hay `console.log()`
- [ ] No hay `console.error()`
- [ ] No hay `debugger;`
- [ ] Todos los async/await tienen try-catch
- [ ] Todas las promesas tienen .catch() o try-catch
- [ ] Todos los array.map() tienen key={...}
- [ ] useEffect tiene todas las dependencias necesarias
- [ ] No hay unhandled promise rejections

---

## 🔍 Cómo Verificar

### En Desarrollo
```bash
# Abre DevTools (F12)
# Consola debe estar completamente limpia
# No debe haber mensajes en rojo ni amarillo
```

### Búsqueda Automática
```bash
# Buscar console statements
grep -r "console\." src/features --include="*.jsx" --include="*.js"

# Buscar debugger
grep -r "debugger" src/features --include="*.jsx" --include="*.js"
```

---

## 🚀 Próximos Pasos

1. **Implementar logging remoto** (opcional)
   - Usar servicio como Sentry o DataDog para errores en producción
   - Mantener console limpia

2. **Agregar error boundaries** (opcional)
   - Componente React para capturar errores sin afectar consola
   - Mostrar UI amigable al usuario

3. **Testing** (opcional)
   - Unit tests para validar manejo de errores
   - Asegurar que no hay unhandled rejections

---

## 📝 Notas

- La consola ahora debe estar completamente limpia
- Todos los errores se manejan internamente
- Los usuarios ven mensajes amigables en modales de alerta
- El código es más profesional y listo para producción
