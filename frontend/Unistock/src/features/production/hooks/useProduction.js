import { useState, useEffect } from 'react';
import { ProductionAPIClient } from '../services/ProductionAPIClient';
import { getCurrentUser } from '../services/ProductionAPI';

/**
 * Hook para gestionar Órdenes de Producción desde el API real
 * Conectado con: http://localhost:3000/api/produccion
 */
export const useProductions = () => {
  const [Productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Cargar con paginación y sin filtros iniciales
      const response = await ProductionAPIClient.getOrders({ 
        page: 1, 
        limit: 100 
      });
      
      // Mapear respuesta del backend al formato del frontend
      // El backend puede devolver shapes distintos (por ejemplo {data:{data:[...]}} o {data:[...]})
      const backendList =
        response?.data?.data ??
        response?.data?.producciones ??
        response?.data?.orders ??
        response?.data ??
        response?.producciones ??
        response?.orders ??
        response ??
        [];

      const list = Array.isArray(backendList)
        ? backendList
        : Array.isArray(backendList?.data)
          ? backendList.data
          : [];

      const productions = (list || []).map((order) => ({
        id: order._id || order.id,
        orderNumber: order.numero_orden,
        cliente: order.cliente,
        cliente_name: order.cliente,
        client: order.cliente,
        status: order.estado,
        estado: order.estado,
        deliveryDate: order.fecha_entrega
          ? new Date(order.fecha_entrega).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        statusDate: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        history: (order.historial || []).map((h) => ({
          status: h.estado,
          date: h.fecha
            ? new Date(h.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '',
          user: h.id_usuario || 'Sistema',
          motivo: h.motivo,
        })),
        rawData: order,
      }));
      
      setProductions(productions);
    } catch (err) {
      console.error('Error al cargar producciones:', err);
      setError('Error al cargar las órdenes de producción. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const createProduction = async (productionData) => {
    try {
      const backendData = {
        cliente: (productionData.client || productionData.cliente || '').trim(),
        fecha_entrega:
          productionData.deliveryDate ||
          productionData.fecha_entrega ||
          productionData.fechaSolicitud,
      };

      const newOrder = await ProductionAPIClient.createOrder(backendData);
      const idOrden = newOrder._id || newOrder.id;

      // Guardar detalles (color / referencia / cantidad)
      const detalles = [];

      // Campos desde el form (ProductionForm)
      const referencia = productionData.referencia || '';
      const cantidadPrincipal = Number(productionData.cantidad) || 0;
      const colorPrincipal = productionData.color ? String(productionData.color).trim() : '';

      if (String(referencia).trim() && cantidadPrincipal > 0 && colorPrincipal) {
        detalles.push({
          id_producto: String(referencia).trim(),
          cantidad: cantidadPrincipal,
          color: colorPrincipal,
        });
      }

      const referenciasExtras = Array.isArray(productionData.referencias)
        ? productionData.referencias
        : [];

      referenciasExtras.forEach((r) => {
        const qty = Number(r?.cantidad) || 0;
        const colorExtra = r?.color ? String(r.color).trim() : '';
        if (!String(referencia).trim() || qty <= 0) return;
        if (!colorExtra && !colorPrincipal) return;

        detalles.push({
          id_producto: String(referencia).trim(),
          cantidad: qty,
          color: colorExtra || colorPrincipal,
        });
      });

      // Endpoint backend: POST /api/produccion/detalle-orden
      if (detalles.length > 0) {
        for (const d of detalles) {
          await ProductionAPIClient.createOrderDetail({
            id_orden:    idOrden,
            id_producto: String(d.id_producto).trim(),
            cantidad:    d.cantidad,
            color:       d.color ? String(d.color).trim() : '',
          });
        }
      }

      // Mapear respuesta de vuelta al formato frontend
      const newProduction = {
        id: idOrden,
        orderNumber: newOrder.numero_orden,
        client: newOrder.cliente,
        cliente: newOrder.cliente,
        status: newOrder.estado,
        estado: newOrder.estado,
        deliveryDate: newOrder.fecha_entrega
          ? new Date(newOrder.fecha_entrega).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        statusDate: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        history: (newOrder.historial || []).map((h) => ({
          status: h.estado,
          date: h.fecha
            ? new Date(h.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '',
          user: h.id_usuario || 'Sistema',
          motivo: h.motivo,
        })),
        rawData: newOrder,
      };

      setProductions((prev) => [...prev, newProduction]);
      return newProduction;
    } catch (err) {
      console.error('Error al crear producción:', err);
      setError('Error al crear la orden de producción');
      throw err;
    }
  };

  const updateProduction = async (id, productionData) => {
    try {
      const backendData = {
        cliente: productionData.client || productionData.cliente,
        fecha_entrega: productionData.deliveryDate || productionData.fecha_entrega,
      };
      
      const updated = await ProductionAPIClient.updateOrder(id, backendData);
      
      setProductions(prev => prev.map(p => 
        p.id === id ? {
          ...p,
          client: updated.cliente,
          deliveryDate: updated.fecha_entrega 
            ? new Date(updated.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '',
          rawData: updated
        } : p
      ));
      
      return updated;
    } catch (err) {
      console.error('Error al actualizar producción:', err);
      setError('Error al actualizar la orden de producción');
      throw err;
    }
  };

  const cancelProduction = async (id, motivo) => {
    try {
      const updated = await ProductionAPIClient.cancelOrder(id, motivo);
      
      setProductions(prev => prev.map(p => 
        p.id === id ? {
          ...p,
          status: 'Anulada',
          estado: 'Anulada',
          rawData: updated
        } : p
      ));
      
      return updated;
    } catch (err) {
      console.error('Error al anular producción:', err);
      setError('Error al anular la orden de producción');
      throw err;
    }
  };

  return {
    Productions,
    loading,
    error,
    createProduction,
    updateProduction,
    cancelProduction,
    refreshProductions: loadProductions,
  };
};
