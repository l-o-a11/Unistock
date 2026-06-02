import { useState, useEffect } from 'react';
import { ProductionAPIClient } from '../services/ProductionAPIClient';
import { getCurrentUser } from '../services/ProductionAPI';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (raw) =>
  raw
    ? new Date(raw).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

/**
 * Mapea un array de documentos de detalle del backend al formato del frontend.
 * Cada detalle tiene: id, id_producto, cantidad, color, estado, createdAt
 */
const mapDetails = (rawDetails, ordenEstado, statusDate) =>
  (rawDetails || []).map((d) => ({
    id:         d.id || d._id || '',
    refCorte:   d.id_producto || '',   // código de referencia del artículo
    ref:        d.id_producto || '',
    quantity:   Number(d.cantidad) || 0,
    color:      d.color || '—',
    status:     ordenEstado || 'Diseño',
    statusDate: statusDate || fmtDate(d.updatedAt || d.createdAt),
    estado:     d.estado !== false,
  }));

/**
 * Dado un array de detalles ya mapeados, calcula los campos resumen
 * que se muestran directamente en la fila de la tabla.
 */
const summarizeDetails = (details) => {
  const totalQty    = details.reduce((s, d) => s + (d.quantity || 0), 0);
  const uniqueColors = [...new Set(details.map((d) => d.color).filter((c) => c && c !== '—'))];
  const firstRef    = details[0]?.ref || '';
  return { totalQty, uniqueColors, firstRef };
};

/**
 * Mapea un documento de orden del backend (sin detalles) al formato frontend.
 * Los campos de detalle (referencia, cantidad, color, details) se rellenan
 * después con mergeDetails().
 */
const mapOrder = (order) => ({
  id:           order._id  || order.id,
  orderNumber:  order.numero_orden,
  cliente:      order.cliente,
  cliente_name: order.cliente,
  client:       order.cliente,
  status:       order.estado,
  estado:       order.estado,
  deliveryDate: fmtDate(order.fecha_entrega),
  statusDate:   fmtDate(order.updatedAt || order.createdAt),
  history: (order.historial || []).map((h) => ({
    status: h.estado,
    date:   fmtDate(h.fecha),
    user:   h.id_usuario || 'Sistema',
    motivo: h.motivo,
  })),
  // Campos de artículo — se rellenan tras cargar detalles
  referencia: '',
  producto:   '',
  quantity:   0,
  color:      '',
  details:    [],
  rawData:    order,
});

/**
 * Fusiona los detalles cargados en un objeto de producción ya mapeado.
 */
const mergeDetails = (prod, rawDetails) => {
  const details = mapDetails(rawDetails, prod.status, prod.statusDate);
  const { totalQty, uniqueColors, firstRef } = summarizeDetails(details);
  return {
    ...prod,
    details,
    quantity:   totalQty,
    color:      uniqueColors[0] || '',
    referencia: firstRef,
    producto:   firstRef || `Orden #${prod.orderNumber}`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useProductions = () => {
  const [Productions, setProductions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => { loadProductions(); }, []);

  // ── Carga inicial: órdenes + sus detalles en paralelo ─────────────────────
  const loadProductions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductionAPIClient.getOrders({ page: 1, limit: 100 });

      // Normalizar shape de respuesta
      const raw =
        response?.data?.data    ??
        response?.data?.orders  ??
        response?.data          ??
        response?.orders        ??
        response                ??
        [];
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

      // 1. Mapear órdenes base (sin detalles)
      const baseProducciones = list.map(mapOrder);

      // 2. Cargar detalles de todas las órdenes en paralelo
      const detailsArray = await Promise.all(
        baseProducciones.map((p) =>
          ProductionAPIClient.getOrderDetails(p.id).catch(() => [])
        )
      );

      // 3. Fusionar detalles en cada orden
      const producciones = baseProducciones.map((p, i) =>
        mergeDetails(p, detailsArray[i] || [])
      );

      setProductions(producciones);
    } catch (err) {
      console.error('Error al cargar producciones:', err);
      setError('Error al cargar las órdenes de producción. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // ── Crear orden + detalles ────────────────────────────────────────────────
  const createProduction = async (productionData) => {
    try {
      const backendData = {
        cliente:       (productionData.client || productionData.cliente || '').trim(),
        fecha_entrega: productionData.deliveryDate || productionData.fecha_entrega || productionData.fechaSolicitud,
        tipo:          productionData.tipo || 'produccion',
        referencia:    productionData.referencia || productionData.reference || '',
        producto:      productionData.producto || productionData.product || '',
        techSheet:     productionData.techSheet || productionData.techSpecification || null,
        designImages:  productionData.designImages || [],
        fromDamaged:   productionData.fromDamaged || false,
        originalOrderNumber: productionData.originalOrderNumber || null,
        originalOrderStatus: productionData.originalOrderStatus || null,
      };

      const newOrder = await ProductionAPIClient.createOrder(backendData);
      const idOrden  = newOrder._id || newOrder.id;

      // Armar array de detalles desde los campos del form
      const detalles = [];
      const referencia       = String(productionData.referencia || '').trim();
      const cantidadPrincipal = Number(productionData.cantidad) || 0;
      const colorPrincipal    = String(productionData.color || '').trim();

      if (referencia && cantidadPrincipal > 0) {
        detalles.push({ id_producto: referencia, cantidad: cantidadPrincipal, color: colorPrincipal });
      }

      (Array.isArray(productionData.referencias) ? productionData.referencias : []).forEach((r) => {
        const qty   = Number(r?.cantidad) || 0;
        const color = String(r?.color || '').trim() || colorPrincipal;
        const ref   = String(r?.referencia || referencia).trim();
        if (ref && qty > 0) detalles.push({ id_producto: ref, cantidad: qty, color });
      });

      // Crear detalles en el backend
      const rawDetails = await Promise.all(
        detalles.map((d) =>
          ProductionAPIClient.createOrderDetail({
            id_orden:    idOrden,
            id_producto: d.id_producto,
            cantidad:    d.cantidad,
            color:       d.color,
          }).catch((err) => { console.error('Error creando detalle:', err); return null; })
        )
      );

      // Construir objeto producción con detalles ya incluidos
      const base          = mapOrder(newOrder);
      const validDetails  = rawDetails.filter(Boolean);
      const newProduction = mergeDetails(base, validDetails);

      setProductions((prev) => [newProduction, ...prev]);
      return newProduction;
    } catch (err) {
      console.error('Error al crear producción:', err);
      setError('Error al crear la orden de producción');
      throw err;
    }
  };

  // ── Actualizar orden ──────────────────────────────────────────────────────
  const updateProduction = async (id, productionData) => {
    try {
      const updated = await ProductionAPIClient.updateOrder(id, {
        cliente:       productionData.client || productionData.cliente,
        fecha_entrega: productionData.deliveryDate || productionData.fecha_entrega,
      });
      setProductions((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, client: updated.cliente, deliveryDate: fmtDate(updated.fecha_entrega), rawData: updated }
            : p
        )
      );
      return updated;
    } catch (err) {
      console.error('Error al actualizar producción:', err);
      setError('Error al actualizar la orden de producción');
      throw err;
    }
  };

  // ── Anular orden ──────────────────────────────────────────────────────────
  const cancelProduction = async (id, motivo) => {
    try {
      const updated = await ProductionAPIClient.cancelOrder(id, motivo);
      setProductions((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'Anulada', estado: 'Anulada', rawData: updated } : p
        )
      );
      return updated;
    } catch (err) {
      console.error('Error al anular producción:', err);
      setError('Error al anular la orden de producción');
      throw err;
    }
  };

  // ── Fetch detalles de una orden (lazy, si el usuario expande una fila) ───
  // Ya no es necesario porque loadProductions los carga todos, pero se
  // mantiene para que ProductionTable pueda recargar tras crear nuevos detalles.
  const fetchAndSetDetails = async (productionId) => {
    try {
      const rawDetails = await ProductionAPIClient.getOrderDetails(productionId);
      setProductions((prev) =>
        prev.map((p) =>
          p.id === productionId ? mergeDetails(p, rawDetails || []) : p
        )
      );
    } catch (err) {
      console.error('Error al cargar detalles de la orden:', err);
    }
  };

  // ── Cambiar estado ────────────────────────────────────────────────────────
  const changeProductionStatus = async (id, nuevoEstado) => {
    const updated = await ProductionAPIClient.changeOrderStatus(id, nuevoEstado);
    const today   = fmtDate(new Date());

    // Cuando la orden llega a "Entregado", sumamos la cantidad producida
    // al stock del producto correspondiente en el catálogo.
    if (nuevoEstado === 'Entregado') {
      try {
        const produccion = Productions.find(p => p.id === id);
        if (produccion) {
          const { productAPI } = await import('../../products/services/productAPI');

          // Agrupamos por referencia para hacer una sola llamada por producto
          const porRef = {};
          const detalles = produccion.details && produccion.details.length > 0
            ? produccion.details
            : [{ ref: produccion.referencia, quantity: produccion.quantity || produccion.cantidad || 0 }];

          detalles.forEach(d => {
            const ref = d.ref || d.refCorte || d.id_producto;
            if (ref) porRef[ref] = (porRef[ref] || 0) + (d.quantity || 0);
          });

          for (const [ref, qty] of Object.entries(porRef)) {
            if (!ref || qty <= 0) continue;
            try {
              // Buscamos el producto por referencia para obtener su id y stock actual
              const todos = await productAPI.getAll();
              const producto = (Array.isArray(todos) ? todos : []).find(
                p => p.reference === ref || p.referencia === ref || p.id === ref
              );
              if (producto) {
                const nuevoStock = (Number(producto.stock) || 0) + qty;
                await productAPI.update(producto.id, {
                  ...producto,
                  stock: nuevoStock,
                });
                console.log(`[Producción] Stock de "${ref}" actualizado: +${qty} → ${nuevoStock}`);
              }
            } catch (stockErr) {
              console.error(`[Producción] Error actualizando stock de "${ref}":`, stockErr?.message);
            }
          }
        }
      } catch (err) {
        console.error('[Producción] Error en actualización de stock al entregar:', err?.message);
      }
    }

    setProductions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status:     updated.estado || nuevoEstado,
              estado:     updated.estado || nuevoEstado,
              statusDate: today,
              history: (updated.historial || []).map((h) => ({
                status: h.estado,
                date:   fmtDate(h.fecha),
                user:   h.id_usuario || 'Sistema',
                motivo: h.motivo,
              })),
              rawData: updated,
            }
          : p
      )
    );
    return updated;
  };

  return {
    Productions,
    loading,
    error,
    createProduction,
    updateProduction,
    cancelProduction,
    changeProductionStatus,
    fetchAndSetDetails,
    refreshProductions: loadProductions,
  };
};
