import { useState, useEffect } from "react";
import { shoppingAPI } from "../services/shoppingAPI";

export const useShoppings = () => {

  const [shoppings, setShoppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // ── Carga inicial ──────────────────────────────────
  useEffect(() => {
    loadData();
    loadProveedores();
  }, []);

  // ── Normalizar compra del backend al formato del frontend ──
  const normalizar = (c) => ({
    ...c,
    id: c._id ?? c.id,
    costoTotal: c.total ?? c.costoTotal,   // backend: total → frontend: costoTotal
    detalles: (c.detalles || []).map((d) => ({
      ...d,
      id: d._id ?? d.id,
      supplyId: d.insumoId ?? null,
      costoUnitario: d.precioUnitario ?? 0,  // campo correcto del detalle
      costo: d.subtotal ?? 0,
    })),
  });

  // ── Carga desde API (siempre fresco, sin cache localStorage) ──
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await shoppingAPI.getAll();
      setShoppings(data.map(normalizar));
      setError(null);
    } catch (err) {
      setError("Error al cargar compras");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Proveedores desde localStorage (módulo proveedores) ──
  const loadProveedores = () => {
    try {
      const raw = localStorage.getItem("app_proveedores");
      if (raw) setProveedores(JSON.parse(raw));
    } catch (err) {
      console.error("Error cargando proveedores:", err);
    }
  };

  // ── Obtener por ID ─────────────────────────────────
  const getShoppingById = (id) =>
    shoppings.find((p) => String(p.id) === String(id));

  // ── Crear compra ───────────────────────────────────
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
        cantidad: d.cantidad,
        precioUnitario: d.costoUnitario ?? 0,
        subtotal: d.costo ?? 0,
      })),
    };

    try {
      setLoading(true);
      const newShopping = await shoppingAPI.create(payload);
      const normalizado = normalizar(newShopping);
      setShoppings((prev) => [...prev, normalizado]);
      return normalizado;
    } catch (err) {
      setError("Error al crear la compra");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Anular compra ──────────────────────────────────
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
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Helper proveedor ───────────────────────────────
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