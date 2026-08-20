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

// ── Extrae el mensaje de error más descriptivo del backend ──────────────────
const extractErrorMessage = (err) => {
  // El httpClient adjunta err.data con el body JSON del backend
  if (err?.data?.message) return err.data.message;
  if (err?.data?.error) return err.data.error;
  if (err?.message) return err.message;
  return 'Ocurrió un error inesperado';
};

// ── Mensajes amigables por código HTTP ──────────────────────────────────────
const friendlyMessage = (err, action = 'completar la operación') => {
  const status = err?.status ?? err?.response?.status;
  const backendMsg = extractErrorMessage(err);

  switch (status) {
    case 400:
      return backendMsg || 'Datos incompletos o inválidos. Revisa todos los campos requeridos.';
    case 409:
      // El backend devuelve mensajes como "Ya existe un proveedor registrado con ese NIT"
      return backendMsg || 'Ya existe un proveedor con esos datos (NIT o correo duplicado).';
    case 404:
      return backendMsg || 'El proveedor no fue encontrado. Puede haber sido eliminado.';
    case 422:
      // Ej: "tiene compras asociadas y no puede ser eliminado"
      return backendMsg || 'No se puede realizar esta acción sobre el proveedor.';
    case 500:
      return `Error interno del servidor al ${action}. Verifica los logs del backend.`;
    default:
      return backendMsg || `No se pudo ${action}. Intenta nuevamente.`;
  }
};

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

      const response = await SuppliersAPIClient.getSuppliers({
        page: 1,
        limit: 100,
        sortBy: 'nombre_de_empresa',
      });

      // Backend responde: { success: true, data: { data: [...], total, page, ... } }
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
        const correoContacto = supplier?.correo_del_contacto ?? supplier?.correoContacto ?? '';

        const sitio =
          supplier?.sitio_web ?? supplier?.sitioWeb ?? supplier?.sitioweb;

        return {
          id: supplier._id || supplier.id,
          nit: supplier.nit,
          nombreEmpresa,
          nombre_de_empresa: nombreEmpresa,
          nombreContacto,
          nombre_del_contacto: nombreContacto,
          correoContacto: correoContacto || '',
          direccion: supplier.direccion,
          telefono: supplier.telefono,
          email: correo,
          correo,
          correoEmpresa: correo,
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

  // ── Mapea los nombres del formulario a los que espera el backend ─────────
  // El backend controller acepta camelCase (nombreEmpresa, correoEmpresa, etc.)
  // y los normaliza internamente a snake_case.
  const mapFrontendToBackend = (supplierData) => ({
    nit: supplierData.nit,
    tipoDocumento: supplierData.tipoDocumento || '',
    tipoDocumentoContacto: supplierData.tipoDocumentoContacto || '',
    telefonoContacto: supplierData.telefonoContacto || '',
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
    correoContacto:
      supplierData.correoContacto ||
      supplierData.correo_del_contacto ||
      '',
    direccion: supplierData.direccion,
    telefono: supplierData.telefono,
    correoEmpresa:
      supplierData.correoEmpresa || supplierData.email || supplierData.correo || '',
    sitioWeb:
      supplierData.sitioWeb || supplierData.sitioweb || supplierData.sitio_web || '',
  });

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
    try {
      const backendData = mapFrontendToBackend(supplierData);
      const newSupplier = await SuppliersAPIClient.createSupplier(backendData);

      const supplier = newSupplier.data || newSupplier;
      const mapped = _mapBackendToFrontend(supplier);

      setSuppliers((prev) => {
        const next = [...prev, mapped];
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      console.error('Error al crear proveedor:', err);

      // Si fue un 409 (NIT o correo duplicado), refrescar para sincronizar
      const status = err?.status ?? err?.response?.status;
      if (status === 409) {
        try { await refreshSuppliers(); } catch { /* ignorar */ }
      }

      const msg = friendlyMessage(err, 'crear el proveedor');
      setError(msg);

      // Re-lanzar con mensaje legible para que el formulario lo muestre
      const richErr = new Error(msg);
      richErr.status = status;
      richErr.originalError = err;
      throw richErr;
    }
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    try {
      const backendData = mapFrontendToBackend(supplierData);
      const updated = await SuppliersAPIClient.updateSupplier(id, backendData);

      const supplier = updated.data || updated;
      const mapped = _mapBackendToFrontend(supplier);

      setSuppliers((prev) => {
        const next = prev.map((s) => (s.id === id ? mapped : s));
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      console.error('Error al actualizar proveedor:', err);
      const msg = friendlyMessage(err, 'actualizar el proveedor');
      setError(msg);
      const richErr = new Error(msg);
      richErr.status = err?.status;
      richErr.originalError = err;
      throw richErr;
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
      const msg = friendlyMessage(err, 'eliminar el proveedor');
      setError(msg);
      const richErr = new Error(msg);
      richErr.status = err?.status;
      richErr.originalError = err;
      throw richErr;
    }
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = async (id) => {
    try {
      const updated = await SuppliersAPIClient.toggleSupplier(id);
      const supplier = updated.data || updated;
      const mapped = _mapBackendToFrontend(supplier);

      setSuppliers((prev) => {
        const next = prev.map((s) => (s.id === id ? mapped : s));
        saveToStorage(next);
        return next;
      });

      return mapped;
    } catch (err) {
      console.error('Error al cambiar estado del proveedor:', err);
      const msg = friendlyMessage(err, 'cambiar el estado del proveedor');
      setError(msg);
      const richErr = new Error(msg);
      richErr.status = err?.status;
      richErr.originalError = err;
      throw richErr;
    }
  };

  // FIX (punto 4): variante filtrada — usada donde se necesita elegir un
  // proveedor (ej. buscador de ShoppingForm). Sin esto, proveedores
  // inactivados seguían apareciendo como opción seleccionable en Compras.
  // Mismo patrón que rolesActivos/sedesActivas en useCatalogs.js.
  const suppliersActivos = suppliers.filter((s) => s.estado !== false);

  const refreshSuppliers = () => loadSuppliers();

  return {
    suppliers,
    suppliersActivos,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refreshSuppliers,
    toggleSupplier,
  };
};

// ── Mapeo interno: backend → formato del frontend ────────────────────────────
function _mapBackendToFrontend(supplier) {
  const nombreEmpresa =
    supplier?.nombre_de_empresa ?? supplier?.nombreEmpresa ?? '';
  const nombreContacto =
    supplier?.nombre_del_contacto ?? supplier?.nombreContacto ?? '';
  const correo = supplier?.correo ?? supplier?.correoEmpresa ?? supplier?.email ?? '';
  const correoContacto = supplier?.correo_del_contacto ?? supplier?.correoContacto ?? '';
  const sitio = supplier?.sitio_web ?? supplier?.sitioWeb ?? supplier?.sitioweb ?? '';
  const estado = supplier?.activo ?? supplier?.estado;

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
    correoEmpresa: correo,
    correoContacto,
    sitioWeb: sitio,
    sitioweb: sitio,
    sitio_web: sitio,
    estado,
    activo: estado,
    rawData: supplier,
  };
}