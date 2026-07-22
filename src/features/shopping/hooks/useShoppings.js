import { useState, useEffect } from "react";
import { shoppingAPI } from "../services/shoppingAPI";

export const useShoppings = () => {

  const [shoppings, setShoppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // ── Normalizar compra del backend al formato del frontend ──────────────────
  // Convierte los nombres de campos del backend (total, precioUnitario, insumoId)
  // al formato que usa el frontend (costoTotal, costoUnitario, supplyId).
  // Se define ANTES de loadData para que esté disponible en su closure.
  const normalizar = (c) => ({
    ...c,
    id: c._id ?? c.id,
    costoTotal: c.total ?? c.costoTotal,
    detalles: (c.detalles || []).map((d) => ({
      ...d,
      id: d._id ?? d.id,
      supplyId: d.insumoId ?? null,
      costoUnitario: d.precioUnitario ?? 0,
      costo: d.subtotal ?? 0,
    })),
  });

  // ── Carga desde API ────────────────────────────────────────────────────────
  // La API devuelve { success: true, data: [...] }.
  // httpClient devuelve el JSON crudo, por eso accedemos a response.data.
  // El fallback `?? response` cubre el caso en que la API devuelva el array directo.
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await shoppingAPI.getAll();

      // Unwrap defensivo: soporta { data: [...] } o array directo
      const lista = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setShoppings(lista.map(normalizar));
      setError(null);
    } catch (err) {
      setError("Error al cargar compras");
      console.error("[useShoppings] loadData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadProveedores();
  }, []);

  // ── Proveedores ────────────────────────────────────────────────────────────
  const loadProveedores = () => {
    try {
      const raw = localStorage.getItem("app_proveedores");
      if (raw) setProveedores(JSON.parse(raw));
    } catch (err) {
      console.error("[useShoppings] loadProveedores:", err);
    }
  };

  // ── Obtener por ID ─────────────────────────────────────────────────────────
  const getShoppingById = (id) =>
    shoppings.find((p) => String(p.id) === String(id));

  // ── Crear compra ───────────────────────────────────────────────────────────
  // Traduce nombres frontend → backend antes de enviar
  const createShopping = async (shoppingData) => {
    const payload = {
      numeroFactura: shoppingData.numeroFactura,
      proveedorId: shoppingData.proveedorId,
      fecha: shoppingData.fecha,
      total: shoppingData.costoTotal,
      observaciones: shoppingData.observaciones,
      detalles: (shoppingData.detalles || []).map((d) => ({
        insumoId: d.supplyId ?? null,
        nombre: d.nombre ?? null,
        medida: d.medida ?? null,
        cantidad: d.cantidad,
        precioUnitario: d.costoUnitario ?? 0,
        subtotal: d.costo ?? 0,
      })),
    };

    try {
      setLoading(true);
      const response = await shoppingAPI.create(payload);
      // Mismo unwrap defensivo que en loadData
      const raw = response?.data ?? response;
      const normalizado = normalizar(raw);
      setShoppings((prev) => [...prev, normalizado]);
      return normalizado;
    } catch (err) {
      setError("Error al crear la compra");
      console.error("[useShoppings] createShopping:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Anular compra ──────────────────────────────────────────────────────────
  const anularShopping = async (id, motivo) => {
    try {
      setLoading(true);
      await shoppingAPI.anular(id, motivo);
      const fechaAnulacion = new Date().toISOString();
      setShoppings((prev) =>
        prev.map((p) =>
          String(p.id) === String(id)
            ? { ...p, anulada: true, motivoAnulacion: motivo, fechaAnulacion }
            : p
        )
      );
    } catch (err) {
      setError("Error al anular la compra");
      console.error("[useShoppings] anularShopping:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Helper proveedor ───────────────────────────────────────────────────────
  const getProveedorNombre = (proveedorId) =>
    proveedores.find((p) => String(p.id) === String(proveedorId))?.nombre ?? "Sin proveedor";

  return {
    shoppings,
    loading,
    error,
    loadData,
    getShoppingById,
    createShopping,
    anularShopping,
    proveedores,
    getProveedorNombre,
  };
};