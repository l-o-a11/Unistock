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

