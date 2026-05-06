import { useState, useEffect } from 'react';
import { SuppliersAPIClient } from '../services/SuppliersAPIClient';

const STORAGE_KEY = 'app_suppliers';

// ── Helpers de localStorage ─────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // JSON corrupto — ignorar y usar seed
  }
  return null;
};

const saveToStorage = (suppliers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
  }
};

export const mockSuppliers = [
  {
    id: 1,
    nit: '900123456',
    nombreEmpresa: 'Textiles Medellín',
    nombreContacto: 'Laura Gómez',
    direccion: 'Cra 45 #10-20',
    telefono: '3001234567',
    email: 'contacto@textiles.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: true,
  },
  {
    id: 2,
    nit: '800555222',
    nombreEmpresa: 'Insumos Colombia',
    nombreContacto: 'Carlos Pérez',
    direccion: 'Calle 30 #50-60',
    telefono: '3019876543',
    email: 'ventas@insumos.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: true,
  },
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial desde el API real
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar desde el API real
      const response = await SuppliersAPIClient.getSuppliers({
        page: 1,
        limit: 100,
        sortBy: 'nombre_de_empresa',
      });

      // Backend suele responder: { success: true, data: [...] }
      // Ajustamos para soportar variaciones: {data:{data}} o {data:[...]} o {success:true,data:[...]}
      const backendSuppliers =
        response?.data?.data ??
        response?.data?.suppliers ??
        response?.data ??
        response?.suppliers ??
        response ??
        [];

      const list = Array.isArray(backendSuppliers)
        ? backendSuppliers
        : Array.isArray(backendSuppliers?.data)
          ? backendSuppliers.data
          : [];

      const normalizeBool = (v) => {
        if (v === true || v === false) return v;
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'string') {
          const t = v.trim().toLowerCase();
          if (t === 'true' || t === '1' || t === 'activo') return true;
          if (t === 'false' || t === '0' || t === 'inactivo') return false;
        }
        return undefined;
      };

      const mappedSuppliers = (list || []).map((supplier) => {
        const estado =
          supplier?.activo ??
          supplier?.estado ??
          supplier?.activa ??
          supplier?.inactivo ??
          supplier?.active;

        const estadoBool = normalizeBool(estado);

        const nombreEmpresa =
          supplier?.nombre_de_empresa ??
          supplier?.nombreEmpresa ??
          supplier?.nombre_empresa;

        const nombreContacto =
          supplier?.nombre_del_contacto ??
          supplier?.nombreContacto ??
          supplier?.nombre_contacto;

        const correo = supplier?.correo ?? supplier?.correoEmpresa ?? supplier?.email;

        const sitio =
          supplier?.sitio_web ?? supplier?.sitioWeb ?? supplier?.sitioweb;

        return {
          id: supplier._id || supplier.id,
          nit: supplier.nit,
          nombreEmpresa,
          nombre_de_empresa: nombreEmpresa,
          nombreContacto,
          nombre_del_contacto: nombreContacto,
          direccion: supplier.direccion,
          telefono: supplier.telefono,
          email: correo,
          correo,
          sitioweb: sitio,
          sitio_web: sitio,
          estado: estadoBool,
          activo: estadoBool,
          rawData: supplier,
        };
      });

      setSuppliers(mappedSuppliers);
      saveToStorage(mappedSuppliers);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      setError('Error al cargar los proveedores. Verifica la conexión con el servidor.');

      // Fallback a localStorage si la API falla
      try {
        const cached = loadFromStorage();
        if (cached) {
          setSuppliers(cached);
          setError(null);
        }
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const mapFrontendToBackendCreate = (supplierData) => {
    // El backend controller espera req.body con estos nombres:
    // nit, nombreEmpresa, nombreContacto, direccion, telefono, correoEmpresa, sitioWeb
    // (y internamente mapea a nombre_de_empresa / nombre_del_contacto / correo / sitio_web)
    return {
      nit: supplierData.nit,
      nombreEmpresa:
        supplierData.nombreEmpresa ||
        supplierData.nombre_de_empresa ||
        supplierData.nombre_empresa ||
        '',
      nombreContacto:
        supplierData.nombreContacto ||
        supplierData.nombre_del_contacto ||
        supplierData.nombre_contacto ||
        supplierData.contacto ||
        '',
      direccion: supplierData.direccion,
      telefono: supplierData.telefono,
      correoEmpresa:
        supplierData.correoEmpresa || supplierData.email || supplierData.correo || '',
      sitioWeb: supplierData.sitioWeb || supplierData.sitioweb || supplierData.sitio_web || '',
    };
  };

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
    try {
      const backendData = mapFrontendToBackendCreate(supplierData);
      const newSupplier = await SuppliersAPIClient.createSupplier(backendData);

      const supplier = newSupplier.data || newSupplier;
      const mapped = {
        id: supplier._id || supplier.id,
        nit: supplier.nit,
        nombreEmpresa: supplier.nombre_de_empresa,
        nombre_de_empresa: supplier.nombre_de_empresa,
        nombreContacto: supplier.nombre_del_contacto,
        nombre_del_contacto: supplier.nombre_del_contacto,
        direccion: supplier.direccion,
        telefono: supplier.telefono,
        email: supplier.correo,
        correo: supplier.correo,
        sitioweb: supplier.sitio_web,
        sitio_web: supplier.sitio_web,
        estado: supplier.activo,
        activo: supplier.activo,
        rawData: supplier,
      };

      setSuppliers((prev) => {
        const next = [...prev, mapped];
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      // Si el backend devuelve 409 (conflict / NIT duplicado), no debemos desincronizar la UI.
      // Refrescamos desde el backend para que la tabla coincida con la base de datos.
      console.error('Error al crear proveedor:', err);

      try {
        // heurística: el httpClient suele incluir status o response.status
        const status = err?.status ?? err?.response?.status;
        if (status === 409) {
          await refreshSuppliers();
        }
      } catch (refreshErr) {
        console.error('Error al refrescar proveedores tras conflicto:', refreshErr);
      }

      setError('Error al crear el proveedor');
      throw err;
    }
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    try {
      // Backend updateSupplier usa req.body directo, así que mapeamos igual que create
      const backendData = mapFrontendToBackendCreate(supplierData);
      // Aseguramos que el backend reciba los campos requeridos en nombres esperados
      const updated = await SuppliersAPIClient.updateSupplier(id, backendData);

      const supplier = updated.data || updated;
      const mapped = {
        id: supplier._id || supplier.id,
        nit: supplier.nit,
        nombreEmpresa: supplier.nombre_de_empresa,
        nombre_de_empresa: supplier.nombre_de_empresa,
        nombreContacto: supplier.nombre_del_contacto,
        nombre_del_contacto: supplier.nombre_del_contacto,
        direccion: supplier.direccion,
        telefono: supplier.telefono,
        email: supplier.correo,
        correo: supplier.correo,
        sitioweb: supplier.sitio_web,
        sitio_web: supplier.sitio_web,
        estado: supplier.activo,
        activo: supplier.activo,
        rawData: supplier,
      };

      setSuppliers((prev) => {
        const next = prev.map((s) => (s.id === id ? mapped : s));
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      console.error('Error al actualizar proveedor:', err);
      setError('Error al actualizar el proveedor');
      throw err;
    }
  };

  // ❌ Eliminar proveedor
  const deleteSupplier = async (id) => {
    try {
      await SuppliersAPIClient.deleteSupplier(id);

      setSuppliers((prev) => {
        const next = prev.filter((s) => s.id !== id);
        saveToStorage(next);
        return next;
      });
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      setError('Error al eliminar el proveedor');
      throw err;
    }
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = async (id) => {
    try {
      const updated = await SuppliersAPIClient.toggleSupplier(id);
      const supplier = updated.data || updated;

      const mapped = {
        id: supplier._id || supplier.id,
        nit: supplier.nit,
        nombreEmpresa: supplier.nombre_de_empresa,
        nombre_de_empresa: supplier.nombre_de_empresa,
        nombreContacto: supplier.nombre_del_contacto,
        nombre_del_contacto: supplier.nombre_del_contacto,
        direccion: supplier.direccion,
        telefono: supplier.telefono,
        email: supplier.correo,
        correo: supplier.correo,
        sitioweb: supplier.sitio_web,
        sitio_web: supplier.sitio_web,
        estado: supplier.activo,
        activo: supplier.activo,
        rawData: supplier,
      };

      setSuppliers((prev) => {
        const next = prev.map((s) => (s.id === id ? mapped : s));
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      console.error('Error al cambiar estado del proveedor:', err);
      setError('Error al cambiar estado del proveedor');
      throw err;
    }
  };

  const refreshSuppliers = () => loadSuppliers();

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refreshSuppliers,
    toggleSupplier,
  };
};

