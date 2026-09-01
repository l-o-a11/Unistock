import { useState, useEffect } from 'react';
import { ProductionAPIClient } from '../services/ProductionAPIClient';

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
    id: d.id || d._id || '',
    refCorte: d.id_producto || '',   // código de referencia del artículo
    ref: d.id_producto || '',
    quantity: Number(d.cantidad) || 0,
    color: d.color || '—',
    status: ordenEstado || 'Diseño',
    statusDate: statusDate || fmtDate(d.updatedAt || d.createdAt),
    estado: d.estado !== false,
  }));

/**
 * Dado un array de detalles ya mapeados, calcula los campos resumen
 * que se muestran directamente en la fila de la tabla.
 */
const summarizeDetails = (details) => {
  const totalQty = details.reduce((s, d) => s + (d.quantity || 0), 0);
  const uniqueColors = [...new Set(details.map((d) => d.color).filter((c) => c && c !== '—'))];
  const firstRef = details[0]?.ref || '';
  return { totalQty, uniqueColors, firstRef };
};

/**
 * Mapea un documento de orden del backend (sin detalles) al formato frontend.
 * Los campos de detalle (referencia, cantidad, color, details) se rellenan
 * después con mergeDetails().
 */
const mapOrder = (order) => {
  const base = {
    id: order._id || order.id,
    orderNumber: order.numero_orden,
    cliente: order.cliente,
    cliente_name: order.cliente,
    client: order.cliente,
    status: order.estado,
    estado: order.estado,
    deliveryDate: fmtDate(order.fecha_entrega),
    statusDate: fmtDate(order.updatedAt || order.createdAt),
    history: (order.historial || []).map((h) => ({
      status: h.estado,
      date: fmtDate(h.fecha),
      user: h.id_usuario || 'Sistema',
      motivo: h.motivo,
    })),
    // 🐛 FIX: faltaban por completo — mapOrder() arma un objeto nuevo campo
    // por campo (no hace spread de `order`), así que cualquier campo no
    // listado explícitamente aquí se perdía. empleadoAsignadoId es el que
    // usa ProductionPage.jsx para decidir "¿esta orden es del empleado que
    // tiene la sesión abierta?" — sin esto, la lista del empleado siempre
    // salía vacía aunque el backend ya tuviera la asignación guardada.
    empleadoAsignadoId: order.empleadoAsignadoId ?? null,
    etapaConfirmada: order.etapaConfirmada ?? false,
    empleadoAsignaciones: order.empleadoAsignaciones || {},
    // Campos de artículo — si `detalles` vienen en la respuesta, se usan aquí
    referencia: order.referencia || '',
    producto: order.producto || order.referencia || '',
    quantity: Number(order.totalQty || order.quantity || order.cantidad || 0),
    color: order.firstColor || order.color || '',
    details: Array.isArray(order.details) ? order.details : [],
    rawData: order,
  };

  const availableDetails = Array.isArray(order.details) && order.details.length > 0
    ? order.details
    : Array.isArray(order.detalles) && order.detalles.length > 0
      ? order.detalles
      : [];

  if (!availableDetails.length) return base;

  const { totalQty, uniqueColors, firstRef } = summarizeDetails(availableDetails);
  return {
    ...base,
    details: availableDetails,
    quantity: totalQty,
    color: uniqueColors[0] || base.color,
    referencia: firstRef || base.referencia,
    producto: base.producto || firstRef || `Orden #${base.orderNumber}`,
  };
};

const mergeDetails = (prod, rawDetails) => {
  const details = mapDetails(rawDetails, prod.status, prod.statusDate);
  const { totalQty, uniqueColors, firstRef } = summarizeDetails(details);
  return {
    ...prod,
    details,
    quantity: totalQty,
    color: uniqueColors[0] || prod.color,
    referencia: firstRef || prod.referencia,
    producto: prod.producto || firstRef || `Orden #${prod.orderNumber}`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useProductions = () => {
  const [Productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadProductions(); }, []);

   // ── Carga inicial: cargar lista y luego completar detalles faltantes
   // sin depender de que el backend envíe resumen (totalQty/firstColor).
   const loadProductions = async () => {
     try {
       setLoading(true);
       setError(null);

        const response = await ProductionAPIClient.getOrders({ page: 1, limit: 100 });

       const raw =
         response?.data?.data ??
         response?.data?.orders ??
         response?.data ??
         response?.orders ??
         response ??
         [];
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

       const producciones = list.map((order) => {
         const base = mapOrder(order);
         const hasDetails = Array.isArray(order.details) && order.details.length > 0;
          if (hasDetails) return base;

         return {
           ...base,
           details: [],
         };
       });

       setProductions(producciones);

       // Completar detalles faltantes en background para todas las órdenes
       const missing = producciones.filter((p) => !p.details || p.details.length === 0);
        if (missing.length > 0) {
          Promise.allSettled(
            missing.map((p) =>
              fetchAndSetDetails(p.id).catch(() => {})
            )
          );
        }
    } catch (err) {
      setError('Error al cargar las órdenes de producción. Verifica la conexión con el servidor.');
     } finally {
       setLoading(false);
     }
   };

  // ── Crear orden + detalles ────────────────────────────────────────────────
  const createProduction = async (productionData) => {
    try {
      const cliente = String(productionData.client || productionData.cliente || '').trim();
      const fechaEntrega = productionData.deliveryDate || productionData.fecha_entrega || productionData.fechaSolicitud || '';
      const tipo = productionData.tipo || 'produccion';
      const referencia = String(productionData.referencia || productionData.reference || '').trim();
      const producto = String(productionData.producto || productionData.product || '').trim();
      const backendData = {
        cliente,
        fecha_entrega: fechaEntrega || new Date().toISOString(),
        tipo,
        referencia,
        producto,
        categoria: productionData.categoria || productionData.category || '',
        techSpecification: productionData.techSheet || productionData.techSpecification || null,
        techSheet: productionData.techSheet || productionData.techSpecification || null,
        designImages: Array.isArray(productionData.designImages) ? productionData.designImages : [],
        finishedImages: Array.isArray(productionData.finishedImages) ? productionData.finishedImages : [],
        finishedImageUrl: productionData.finishedImageUrl || null,
        fromDamaged: Boolean(productionData.fromDamaged),
        originalOrderNumber: productionData.originalOrderNumber || null,
        originalOrderStatus: productionData.originalOrderStatus || null,
        sedeId: productionData.sedeId || null,
        id_usuario: productionData.id_usuario || productionData.userId || null,
      };

      const newOrder = await ProductionAPIClient.createOrder(backendData);
      const idOrden = newOrder._id || newOrder.id;

      // Armar array de detalles desde los campos del form
      const detalles = [];
      const cantidadPrincipal = Number(productionData.cantidad) || 0;
      const colorPrincipal = String(productionData.color || '').trim();

      if (referencia && cantidadPrincipal > 0) {
        detalles.push({ id_producto: referencia, cantidad: cantidadPrincipal, color: colorPrincipal });
      }

      (Array.isArray(productionData.referencias) ? productionData.referencias : []).forEach((r) => {
        const qty = Number(r?.cantidad) || 0;
        const color = String(r?.color || '').trim() || colorPrincipal;
        const ref = String(r?.referencia || referencia).trim();
        if (ref && qty > 0) detalles.push({ id_producto: ref, cantidad: qty, color });
      });

      // Crear detalles en el backend
      const rawDetails = await Promise.all(
        detalles.map((d) =>
          ProductionAPIClient.createOrderDetail({
            id_orden: idOrden,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            color: d.color,
          })            .catch((err) => { return null; })
        )
      );

      // Construir objeto producción con detalles ya incluidos
      const base = mapOrder(newOrder);
      const validDetails = rawDetails.filter(Boolean);
      const newProduction = mergeDetails(base, validDetails);

      setProductions((prev) => [newProduction, ...prev]);
      return newProduction;
    } catch (err) {
      setError('Error al crear la orden de producción');
      throw err;
    }
  };

  // ── Actualizar orden ──────────────────────────────────────────────────────
  const updateProduction = async (id, productionData) => {
    try {
      const updated = await ProductionAPIClient.updateOrder(id, {
        cliente: productionData.client || productionData.cliente,
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
      setError('Error al anular la orden de producción');
      throw err;
    }
  };

  // ── Fetch detalles de una orden (lazy, si el usuario expande una fila) ───
  // Ya no es necesario porque loadProductions los carga todos, pero se
  // mantiene para que ProductionTable pueda recargar tras crear nuevos detalles.
  const fetchAndSetDetails = async (productionId) => {
    const existing = Productions.find((p) => p.id === productionId);
    if (existing && Array.isArray(existing.details) && existing.details.length > 0) {
      return existing.details;
    }

    const rawDetails = await ProductionAPIClient.getOrderDetails(productionId);

    setProductions((prev) =>
      prev.map((p) =>
        p.id === productionId ? mergeDetails(p, rawDetails || []) : p
      )
    );
    return rawDetails || [];
  };

  // ── Cambiar estado ────────────────────────────────────────────────────────
  const changeProductionStatus = async (id, nuevoEstado) => {
    // Intentar incluir imágenes de finalización si están presentes en la producción
    const produccion = Productions.find(p => p.id === id) || {};
    const finishedImages = produccion.rawData?.finishedImages || produccion.finishedImages || [];
    const updated = await ProductionAPIClient.changeOrderStatus(id, nuevoEstado, { extra: { finishedImages } });
    const today = fmtDate(new Date());

    // Cuando la orden llega a "Enviado", sumamos la cantidad producida
    // al stock del producto correspondiente en el catálogo.
    if (nuevoEstado === 'Enviado') {
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
              const producto = await productAPI.getByReference(ref);
              if (producto) {
                const nuevoStock = (Number(producto.stock) || 0) + qty;
                await productAPI.update(producto.id, {
                  ...producto,
                  stock: nuevoStock,
                });
              }
            } catch (stockErr) {
            }
          }
        }
      } catch (err) {
      }
    }

    setProductions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            status: updated.estado || nuevoEstado,
            estado: updated.estado || nuevoEstado,
            statusDate: today,
            history: (updated.historial || []).map((h) => ({
              status: h.estado,
              date: fmtDate(h.fecha),
              user: h.id_usuario || 'Sistema',
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