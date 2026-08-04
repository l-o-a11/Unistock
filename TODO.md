<<<<<<< HEAD
# TODO: Fix - Alerta no aparece al confirmar etapa desde vista de empleado

## Problema
En `ProductionDetailsPage.jsx`, cuando un empleado hace clic en "Confirmar finalización ✓", el código ejecuta directamente `ProductionAPIClient.confirmarEtapa()` sin mostrar un modal de confirmación previo. Esto contrasta con el flujo del Gerente, donde todas las acciones pasan por `openProductionAlert()`.

## Plan

### Paso 1: Modificar el onClick del botón "Confirmar finalización ✓"
**Archivo:** `src/features/production/productionDetails/pages/ProductionDetailsPage.jsx`

Reemplazar la llamada directa a `ProductionAPIClient.confirmarEtapa()` con `openProductionAlert()` usando `type: "confirm"` y pasando la lógica de confirmación como `onConfirmOverride`.

**Detalle del cambio:**
- Estado actual: El `onClick` llama directamente `await ProductionAPIClient.confirmarEtapa(production.id)`
- Estado esperado: El `onClick` llama `openProductionAlert()` con `type: "confirm"` y un `onConfirmOverride` que ejecuta la confirmación

### Paso 2: Verificar
- Revisar que no haya otros lugares donde se omita la alerta de confirmación
- Confirmar que el modal aparece correctamente cuando el empleado hace clic

=======
# TODO: Fix Production Phase Confirmation Alert

## Issues

1. When employee clicks "Confirmar finalización ✓" the success/error toast doesn't show
2. Page needs manual reload to reflect changes

## Root Cause

- Inline callback functions in `<Alert>` component create new references every render
- `Alert.jsx` useEffect cleanup runs on every `onCancel` reference change, clearing timers prematurely
- State update batching issues in async handlers

## Steps

### Step 1: Fix Alert.jsx

- [x] Use `useRef` for `onCancel` and `onConfirm` to stabilize callback references inside effects
- [x] Change useEffect dependency from `[isAlertOpen, type, isToast, duration, onCancel]` to `[isAlertOpen]`
- [x] Add defensive check for `isOpen` transitions

### Step 2: Fix ProductionDetailsPage.jsx

- [x] Import `useCallback` from React (already imported)
- [x] Wrap `globalAlert` onConfirm/onCancel handlers with `useCallback` → created `handleAlertClose`
- [x] Add `key` prop to `<Alert>` component that changes on `globalAlert.open` for fresh mount

### Step 3: Test & Verify

- [x] Changes verified — Alert will now properly mount fresh on every open and timer won't be restarted by stale callback references
>>>>>>> c20ad5babb7ae4d53108351406b5064caf198b56
