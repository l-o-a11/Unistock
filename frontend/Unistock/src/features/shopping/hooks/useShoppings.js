import { useState, useEffect } from "react";
import { shoppingAPI } from "../services/shoppingAPI";

const STORAGE_KEY = "app_shoppings";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // JSON corrupto
  }
  return null;
};

const saveToStorage = (shoppings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppings));
  } catch (e) {
    console.error("No se pudo guardar compras:", e);
  }
};

export const useShoppings = () => {

  const [shoppings, setShoppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // ── Carga inicial ──────────────────────────────────
  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) {
      setShoppings(cached);
      setLoading(false);
    } else {
      loadData();
    }
    loadProveedores();
  }, []);

  // ── Persistir cambios ──────────────────────────────
  useEffect(() => {
    if (!loading) saveToStorage(shoppings);
  }, [shoppings, loading]);

  // ── Carga desde API ────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await shoppingAPI.getAll();
      setShoppings(data);
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
  // ✅ FIX: sin parseInt — compatible con IDs string de MongoDB
  const getShoppingById = (id) =>
    shoppings.find((p) => String(p.id) === String(id));

  // ── Crear compra ───────────────────────────────────
  const createShopping = async (shoppingData) => {
    const facturaNorm = shoppingData.numeroFactura?.trim().toLowerCase();
    const duplicado = shoppings.find(
      (p) => p.numeroFactura?.trim().toLowerCase() === facturaNorm
    );

    if (duplicado) {
      throw new Error(`Ya existe una compra con la factura "${shoppingData.numeroFactura}"`);
    }

    try {
      setLoading(true);
      const newShopping = await shoppingAPI.create(shoppingData);
      setShoppings((prev) => [...prev, newShopping]);
      return newShopping;
    } catch (err) {
      setError("Error al crear la compra");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Anular compra ──────────────────────────────────
  // ✅ Ahora recibe motivo y guarda motivoAnulacion + fechaAnulacion
  const anularShopping = async (id, motivo) => {
    try {
      setLoading(true);
      await shoppingAPI.anular(id, motivo);
      const fechaAnulacion = new Date().toISOString();
      setShoppings((prev) =>
        prev.map((p) =>
          p.id === id
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
    getShoppingById,
    createShopping,
    anularShopping,
    proveedores,
    getProveedorNombre,
  };
};