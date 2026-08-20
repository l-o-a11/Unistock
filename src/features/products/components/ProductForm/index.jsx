import React, { useState, useEffect, useCallback, useRef } from "react";
import TechnicalSheet from "../TechnicalSheet";
import { productCategoryAPI } from "../../../productCategories/services/productCategoryAPI";
import ProductCategoryForm from "../../../productCategories/components/ProductCategoryForm";
import ImageModal from "../ProductForm/ImageModal";
import { clientAPI } from "../../../shared/services/clientAPI";
import { validators } from "../../../shared/utils/validators";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
const normalizeText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// ✅ USA VARIABLE DE ENTORNO VITE_BACK_URL (ahora apunta a la API unificada en :3000)
const BACKEND_URL = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';

const CategoryDropdown = ({ value, onChange, touched, error, categories = [], onCreateCategory, isMobile = false }) => {
  const [open, setOpen] = useState(false);

  const filteredCategories = categories.filter((cat) => {
    return Boolean(
      cat?.id ??
      cat?._id ??
      cat?.id_categoria_producto ??
      cat?.id_categorias ??
      cat?.id_categoria
    );
  });

  const handleSelect = (category) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", minWidth: isMobile ? '140px' : "220px" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: "42px",
          boxSizing: "border-box",
          padding: "10px 14px",
          borderBottom: touched && error ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "14px",
          color: value ? "#1f2937" : "#9ca3af",
          userSelect: "none",
          backgroundColor: touched && error ? "#fff0fb" : (open ? "#fff0fb" : "transparent"),
          borderRadius: open ? "10px 10px 0 0" : "10px",
          transition: "background-color 0.15s",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "Seleccionar categoria"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginLeft: "10px" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
            <div
              style={{ padding: "10px 14px", fontSize: "14px", backgroundColor: "#ff4fd6", color: "#fff", fontWeight: "600", cursor: "pointer" }}
              onClick={() => handleSelect("")}
            >
              Seleccionar categoria
            </div>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id ?? cat._id}
                  onClick={() => handleSelect(cat)}
                  style={{
                    padding: "10px 14px",
                    fontSize: "14px",
                    color: "#1f2937",
                    cursor: "pointer",
                    backgroundColor: normalizeText(value) === normalizeText(cat.name ?? cat.nombre) ? "#fdf4ff" : "#fff",
                    borderTop: "1px solid #f3f4f6",
                    transition: "background-color 0.1s"
                  }}
                >
                  {cat.icon} {cat.name ?? cat.nombre}
                </div>
              ))
            ) : (
              <div style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                Sin categorías disponibles
              </div>
            )}
            <div
              onClick={() => {
                setOpen(false);
                onCreateCategory?.();
              }}
              style={{
                padding: "12px 14px",
                fontSize: "14px",
                color: "#ff4fd6",
                cursor: "pointer",
                borderTop: "1px solid #f3f4f6",
                backgroundColor: "#fff",
                fontWeight: "700"
              }}
            >
              + Crear nueva categoria
            </div>
          </div>
        </>
      )}
      {touched && error && (
        <span style={{ color: "#ff4fd6", fontSize: "11px", marginLeft: "8px", fontWeight: "700" }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
};

// ✅ Mismo diseño/estilo que CategoryDropdown, adaptado para clientes
const ClientDropdown = ({ value, onChange, clients = [], onCreateClient, isMobile = false }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (client) => {
    onChange(client);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", minWidth: isMobile ? '140px' : "220px" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: "42px",
          boxSizing: "border-box",
          padding: "10px 14px",
          borderBottom: "1.5px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "14px",
          color: value ? "#1f2937" : "#9ca3af",
          userSelect: "none",
          backgroundColor: open ? "#fff0fb" : "transparent",
          borderRadius: open ? "10px 10px 0 0" : "10px",
          transition: "background-color 0.15s",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Seleccionar cliente"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginLeft: "10px" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
            <div
              style={{ padding: "10px 14px", fontSize: "14px", backgroundColor: "#ff4fd6", color: "#fff", fontWeight: "600", cursor: "pointer" }}
              onClick={() => handleSelect(null)}
            >
              Seleccionar cliente
            </div>
            {clients.length > 0 ? (
              clients.map((client) => {
                const clientKey = client.id ?? client._id ?? client.documento;
                const isSelected = normalizeText(value) === normalizeText(client.nombre);
                return (
                  <div
                    key={clientKey}
                    onClick={() => handleSelect(client)}
                    style={{
                      padding: "10px 14px",
                      fontSize: "14px",
                      color: "#1f2937",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#fdf4ff" : "#fff",
                      borderTop: "1px solid #f3f4f6",
                      transition: "background-color 0.1s"
                    }}
                  >
                    <div>{client.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>{client.documento || "Sin documento"}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                Sin clientes disponibles
              </div>
            )}
            <div
              onClick={() => {
                setOpen(false);
                onCreateClient?.();
              }}
              style={{
                padding: "12px 14px",
                fontSize: "14px",
                color: "#ff4fd6",
                cursor: "pointer",
                borderTop: "1px solid #f3f4f6",
                backgroundColor: "#fff",
                fontWeight: "700"
              }}
            >
              + Crear nuevo cliente
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProductForm = ({ product, onSubmit, onCancel, onShowAlert, onShowConfirm, existingProducts = [], sedes = [] }) => {
  // ✅ initialData es el "punto cero" contra el que comparamos para saber si hubo cambios reales
  // Si solo hay una sede permitida (ej. Administrador restringido a la suya),
  // se preselecciona automáticamente para no obligar a un clic de más.
  const [initialData] = useState({
    reference: product?.reference || "",
    name: product?.name || "",
    category: product?.category || "",
    categoryId: product?.categoryId || null,
    sedeId: product?.sedeId ?? (sedes.length === 1 ? sedes[0].id : ""),
    price: product?.price || "",
    stock: product?.stock || "",
    image: product?.image || null,
    allImages: product?.allImages || [],
  });

  const [formData, setFormData] = useState(initialData);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({
    reference: "",
    name: "",
    category: "",
    sedeId: "",
    price: "",
    stock: "",
  });

  const [touched, setTouched] = useState({});
  const [clientOptions, setClientOptions] = useState([]);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientDraft, setClientDraft] = useState({ nombre: '', tipoDocumento: 'Cédula de ciudadanía', documento: '', telefono: '', correo: '' });
  const [clientFormError, setClientFormError] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [technicalSheet, setTechnicalSheet] = useState(() => {
    if (!product?.technicalSheet) return null;
    return {
      client: product.technicalSheet.client ?? "",
      ref: product.technicalSheet.ref ?? "",
      type: product.technicalSheet.type ?? "",
      description: product.technicalSheet.description ?? "",
      descripciones: product.technicalSheet.descripciones ?? "",
      observations: product.technicalSheet.observations ?? "",
      createdBy: product.technicalSheet.createdBy ?? "",
      responsable: product.technicalSheet.responsable ?? "",
      image: product.technicalSheet.image ?? null,
      allImages: product.technicalSheet.allImages ?? [],
      date: product.technicalSheet.date ?? "",
      fabrics: product.technicalSheet.fabrics ?? [],
      cups: product.technicalSheet.cups ?? [],
      closures: product.technicalSheet.closures ?? [],
      accessories: product.technicalSheet.accessories ?? [],
      measurements: product.technicalSheet.measurements ?? [],
      id: product.technicalSheet.id,
      version: product.technicalSheet.version,
    };
  });

  // ✅ Guarda el estado inicial de la ficha técnica una sola vez, para comparar cambios reales
  const initialTechnicalSheetRef = useRef(technicalSheet);

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadCategories = async () => {
    try {
      const apiCategories = await productCategoryAPI.getAll();
      setCategories(Array.isArray(apiCategories) && apiCategories.length > 0 ? apiCategories : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    productCategoryAPI.getAll()
      .then((apiCategories) => {
        if (!cancelled) {
          setCategories(Array.isArray(apiCategories) && apiCategories.length > 0 ? apiCategories : []);
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const clients = await clientAPI.list();
      setClientOptions(Array.isArray(clients) ? clients : []);
    } catch (err) {
      console.error('Error cargando clientes', err);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const getSelectedCategoryDescription = () => {
    const selected = categories.find(cat =>
      (cat.name ?? cat.nombre) === formData.category
    );
    return selected?.description ?? selected?.descripcion ?? "";
  };

  // ✅ Cliente actualmente seleccionado en la ficha técnica (o null si no hay match)
  const getSelectedClientObject = () => {
    const clientName = technicalSheet?.client;
    if (!clientName) return null;
    return clientOptions.find((c) => normalizeText(c.nombre) === normalizeText(clientName)) || null;
  };

  const handleCreateCategory = async (categoryData) => {
    const createdCategory = await productCategoryAPI.create(categoryData);
    await loadCategories();
    const categoryName = createdCategory?.name ?? createdCategory?.nombre ?? categoryData.name;
    setFormData((prev) => ({ ...prev, category: categoryName }));
    setTouched((prev) => ({ ...prev, category: true }));
    setErrors((prev) => ({ ...prev, category: "" }));
    setShowCategoryForm(false);
    onShowAlert?.({
      type: "success",
      title: "Exito!",
      message: "Categoria creada correctamente"
    });
  };

  const openCreateClientModal = () => {
    setEditingClientId(null);
      setClientDraft({ nombre: '', tipoDocumento: 'Cédula de ciudadanía', documento: '', telefono: '', correo: '' });
    setClientFormError('');
    setClientFormOpen(true);
  };

  const openEditClientModal = () => {
    const client = getSelectedClientObject();
    if (!client) return;
    setEditingClientId(client.id || client._id || null);
    setClientDraft({
      nombre: client.nombre || '',
      tipoDocumento: client.tipoDocumento || 'Cédula de ciudadanía',
      documento: client.documento || '',
      telefono: client.telefono || '',
      correo: client.correo || '',
    });
    setClientFormError('');
    setClientFormOpen(true);
  };

  const closeClientModal = () => {
    setClientFormOpen(false);
    setClientFormError('');
    setClientErrors({});
    setEditingClientId(null);
  };

  const validateClientField = (name, value) => {
    let error = '';
    switch (name) {
      case 'tipoDocumento':
        error = validators.required(value);
        break;
      case 'nombre':
        error = validators.required(value);
        break;
      case 'documento':
        error = validators.required(value) || validators.numbers(value);
        break;
      case 'telefono':
        error = validators.telefono(value);
        break;
      case 'correo':
        error = validators.email(value);
        break;
      default:
        break;
    }
    setClientErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleClientBlur = (e) => {
    validateClientField(e.target.name, e.target.value);
  };

  const handleClientCreate = async (e) => {
    e.preventDefault();
    const requiredFields = ['tipoDocumento', 'nombre', 'documento', 'correo'];
    const newErrors = {};
    let hasError = false;

    requiredFields.forEach(field => {
      const error = validateClientField(field, clientDraft[field]);
      if (error) { newErrors[field] = error; hasError = true; }
    });

    const phoneError = validateClientField('telefono', clientDraft.telefono);
    if (phoneError) { newErrors.telefono = phoneError; hasError = true; }

    if (hasError) {
      setClientErrors(newErrors);
      setClientFormError('Completa correctamente los campos obligatorios');
      return;
    }

    try {
      const payload = {
        nombre: clientDraft.nombre.trim(),
        tipoDocumento: clientDraft.tipoDocumento.trim(),
        documento: clientDraft.documento.trim(),
        telefono: clientDraft.telefono.trim(),
        correo: clientDraft.correo.trim(),
      };
      const saved = editingClientId
        ? await clientAPI.update(editingClientId, payload)
        : await clientAPI.create(payload);
      const nextClient = saved?.nombre || clientDraft.nombre.trim();
      setTechnicalSheet((prev) => ({ ...(prev || {}), client: nextClient }));
      await loadClients();
      setClientDraft({ nombre: '', tipoDocumento: 'Cédula de ciudadanía', documento: '', telefono: '', correo: '' });
      setEditingClientId(null);
      setClientErrors({});
      setClientFormError('');
      setClientFormOpen(false);
      onShowAlert?.({ type: 'success', title: 'Cliente guardado', message: 'El cliente fue guardado correctamente.' });
    } catch (err) {
      setClientFormError(err?.message || 'No se pudo guardar el cliente');
    }
  };

  // ✅ Comparamos siempre contra el estado inicial capturado (vacío al crear, datos del producto al editar)
  const hasProductChanges = () => {
    return (
      formData.reference !== initialData.reference ||
      formData.name !== initialData.name ||
      formData.category !== initialData.category ||
      String(formData.sedeId || "") !== String(initialData.sedeId || "") ||
      formData.price !== initialData.price ||
      formData.stock !== initialData.stock ||
      imagePreview !== initialData.image ||
      JSON.stringify(formData.allImages) !== JSON.stringify(initialData.allImages || [])
    );
  };

  const hasTechnicalSheetChanges = () => {
    return JSON.stringify(technicalSheet) !== JSON.stringify(initialTechnicalSheetRef.current);
  };

  const validateReference = (value) => {
    if (!value.trim()) return "La referencia es obligatoria";
    if (value.trim().length < 3) return "La referencia debe tener al menos 3 caracteres";
    const isDuplicate = existingProducts.some(
      (p) => p.reference?.toLowerCase().trim() === value.toLowerCase().trim()
        && p.id !== product?.id
    );
    if (isDuplicate) return "Ya existe un producto con esa referencia";
    return "";
  };

  const validateName = (value) => {
    if (!value.trim()) return "El nombre es obligatorio";
    if (/\d/.test(value)) return "El nombre no puede contener números";
    if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    const isDuplicate = existingProducts.some(
      (p) => p.name?.toLowerCase().trim() === value.trim().toLowerCase() && p.id !== product?.id
    );
    if (isDuplicate) return "Ya existe un producto con ese nombre";
    return "";
  };

  const validateCategory = (value) => {
    if (!value) return "Selecciona una categoria";
    return "";
  };

  const validateSede = (value) => {
    if (!value) return "Selecciona una sede";
    return "";
  };

  const validatePrice = (value) => {
    if (!value) return "El precio es obligatorio";
    if (isNaN(value) || Number(value) <= 0) return "El precio debe ser un número positivo";
    return "";
  };

  // Evitar letras en el campo precio (incluida la 'e') y normalizar comas a punto
  const handlePriceInputChange = (e) => {
    const raw = String(e.target.value || "");
    let v = raw.replace(/,/g, '.');
    v = v.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    setFormData(prev => ({ ...prev, price: v }));
    validateField('price', v);
  };

  const handlePriceKeyDown = (e) => {
    // Bloquear 'e', 'E', '+', '-' y otros caracteres no numéricos relevantes
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
  };

  const handlePricePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
    const sanitized = paste.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized;
    if (cleaned !== paste) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, price: cleaned }));
      validateField('price', cleaned);
    }
  };

  const validateStock = (value) => {
    if (!value) return "El stock es obligatorio";
    if (isNaN(value) || Number(value) < 0) return "El stock debe ser un número válido";
    if (Number(value) < 5) return "El stock mínimo es 5 unidades";
    if (Number(value) > 100) return "El stock máximo es 100 unidades";
    return "";
  };

  // Evitar decimales en stock: solo números enteros, bloquear '.' ',' 'e' y signos
  const handleStockInputChange = (e) => {
    const raw = String(e.target.value || "");
    // eliminar cualquier carácter que no sea dígito
    const cleaned = raw.replace(/\D+/g, '');
    setFormData(prev => ({ ...prev, stock: cleaned }));
    validateField('stock', cleaned);
  };

  const handleStockKeyDown = (e) => {
    // bloquear puntos, comas, e, E, signos y otras teclas no numéricas directas
    if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
  };

  const handleStockPaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
    const cleaned = paste.replace(/\D+/g, '');
    if (cleaned !== paste) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, stock: cleaned }));
      validateField('stock', cleaned);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'reference') error = validateReference(value);
    if (name === 'name') error = validateName(value);
    if (name === 'category') error = validateCategory(value);
    if (name === 'sedeId') error = validateSede(value);
    if (name === 'price') error = validatePrice(value);
    if (name === 'stock') error = validateStock(value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    const referenceError = validateReference(formData.reference);
    const nameError = validateName(formData.name);
    const categoryError = validateCategory(formData.category);
    const sedeError = validateSede(formData.sedeId);
    const priceError = validatePrice(formData.price);
    const stockError = validateStock(formData.stock);

    setErrors({
      reference: referenceError,
      name: nameError,
      category: categoryError,
      sedeId: sedeError,
      price: priceError,
      stock: stockError,
    });

    setTouched({
      reference: true,
      name: true,
      category: true,
      sedeId: true,
      price: true,
      stock: true
    });

    const hasErrors = referenceError || nameError || categoryError || sedeError || priceError || stockError;

    if (hasErrors) {
      const errorMessages = [];
      if (referenceError) errorMessages.push(referenceError);
      if (nameError) errorMessages.push(nameError);
      if (categoryError) errorMessages.push(categoryError);
      if (sedeError) errorMessages.push(sedeError);
      if (priceError) errorMessages.push(priceError);
      if (stockError) errorMessages.push(stockError);

      onShowAlert({
        type: "warning",
        title: "Campos inválidos",
        message: errorMessages.join(". ")
      });
      return false;
    }

    return true;
  };

  const hasAnyValue = (value) => {
    if (Array.isArray(value)) return value.some(hasAnyValue);
    if (value && typeof value === "object") return Object.values(value).some(hasAnyValue);
    return value !== null && value !== undefined && String(value).trim() !== "";
  };

  const hasTechnicalSheetMaterials = (sheet) => {
    if (!sheet) return false;
    const hasRealFabrics = Array.isArray(sheet.fabrics) && sheet.fabrics.some(hasAnyValue);
    const hasRealCups = Array.isArray(sheet.cups) && sheet.cups.some(hasAnyValue);
    const hasRealClosures = Array.isArray(sheet.closures) && sheet.closures.some(hasAnyValue);
    const hasRealMeasurements = Array.isArray(sheet.measurements) && sheet.measurements.some(hasAnyValue);
    const hasRealAccessories = Array.isArray(sheet.accessories) && sheet.accessories.some(
      (acc) => acc && Array.isArray(acc.values) && acc.values.some((v) => v && String(v).trim() !== "")
    );
    return hasRealFabrics || hasRealCups || hasRealClosures || hasRealMeasurements || hasRealAccessories;
  };

  const hasTechnicalSheetContent = (sheet) => {
    if (!sheet) return false;
    return [sheet.client, sheet.date, sheet.ref, sheet.type, sheet.description, sheet.observations, sheet.createdBy]
      .some(hasAnyValue) || hasTechnicalSheetMaterials(sheet);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (currentStep === 1) {
      if (!validateForm()) return;
      setCurrentStep(2);
      return;
    }

    if (!technicalSheet) {
      onShowAlert({
        type: "warning",
        title: "Ficha técnica requerida",
        message: "Debes crear la ficha técnica para poder guardar el producto"
      });
      return;
    }

    if (!hasTechnicalSheetContent(technicalSheet)) {
      onShowAlert({
        type: "warning",
        title: "Ficha tecnica vacia",
        message: "Completa los datos de la ficha tecnica antes de guardar el producto"
      });
      return;
    }

    if (!hasTechnicalSheetMaterials(technicalSheet)) {
      onShowAlert({
        type: "warning",
        title: "Materiales requeridos",
        message: "Agrega al menos un material en la ficha tecnica antes de guardar el producto"
      });
      return;
    }

    if (product) {
      const hasProductChanges_ = hasProductChanges();
      const hasTechnicalSheetChanges_ = hasTechnicalSheetChanges();

      if (!hasProductChanges_ && !hasTechnicalSheetChanges_) {
        onShowAlert({
          type: "warning",
          title: "Sin cambios",
          message: "No has realizado ningún cambio para guardar"
        });
        return;
      }
    }

    // ✅ SINCRONIZACIÓN: Las imágenes del producto van a la ficha técnica
    const finalTechnicalSheet = {
      ...technicalSheet,
      allImages: formData.allImages,
      image: imagePreview
    };

    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        technicalSheet: finalTechnicalSheet
      });
    } catch (err) {
      onShowAlert?.({ type: 'error', title: '¡Error!', message: err?.message || 'Error al guardar el producto' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVersion = () => {
    setShowVersions(false);
    onShowAlert({
      type: "success",
      title: "Versión eliminada",
      message: "Versión eliminada correctamente"
    });
  };

  const handleVersionSelect = (versionNum) => {
    setSelectedVersion(versionNum);
    setViewMode(versionNum !== (product?.technicalSheetVersions || 1));
    setShowVersions(false);
  };

  const handleDeleteVersionClick = () => {
    const totalVersions = product?.technicalSheetVersions || 1;
    if (totalVersions <= 1) {
      onShowAlert({
        type: "warning",
        title: "No permitido",
        message: "No puedes eliminar la única versión de la ficha técnica."
      });
      return;
    }
    onShowConfirm({
      type: "confirm",
      title: "Confirmar eliminación",
      message: "¿Seguro que deseas eliminar esta versión?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: handleDeleteVersion
    });
  };

  // ✅ CLOUDINARY: Subir imágenes usando VITE_BACK_URL
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();

      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('files', files[i]);
      }

      // ✅ URL CORREGIDA: /api/upload/upload-multiple (endpoint real del backend)
      const uploadUrl = `${BACKEND_URL}/api/upload/upload-multiple`;
      console.log('🔼 Subiendo a:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        throw new Error(`Error al subir imágenes. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);

      const allImages = [...(formData.allImages || []), ...data.images];

      // ✅ Actualizar formData con las nuevas imágenes
      setFormData((prev) => ({
        ...prev,
        allImages: allImages,
        image: allImages[0]?.src || prev.image
      }));

      setImagePreview(allImages[0]?.src);

      // ✅ SINCRONIZACIÓN: Actualizar automáticamente la ficha técnica con las imágenes
      setTechnicalSheet((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          allImages: allImages,
          image: allImages[0]?.src || prev.image
        };
      });

    } catch (error) {
      console.error('❌ Error:', error);
      onShowAlert({
        type: "error",
        title: "Error al subir",
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const imageToDelete = formData.allImages[index];

    // ✅ Eliminar de Cloudinary si tiene public_id
    if (imageToDelete?.public_id) {
      // ✅ URL CORREGIDA: /api/upload/upload/ (endpoint real del backend)
      const deleteUrl = `${BACKEND_URL}/api/upload/upload/${encodeURIComponent(imageToDelete.public_id)}`;
      fetch(deleteUrl, {
        method: 'DELETE'
      }).catch(err => console.error('Error eliminando de Cloudinary:', err));
    }

    const newImages = formData.allImages.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      allImages: newImages,
      image: newImages[0]?.src || null
    }));
    setImagePreview(newImages[0]?.src || null);

    // ✅ SINCRONIZACIÓN: Actualizar la ficha técnica
    setTechnicalSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        allImages: newImages,
        image: newImages[0]?.src || null
      };
    });

    if (newImages.length === 0) {
      setShowImageModal(false);
    } else if (index >= newImages.length) {
      setSelectedImageIdx(newImages.length - 1);
    }
  };

  const handleDeleteAllImages = async () => {
    // ✅ Eliminar todas de Cloudinary
    for (const img of (formData.allImages || [])) {
      if (img?.public_id) {
        // ✅ URL CORREGIDA: /api/upload/upload/ (endpoint real del backend)
        const deleteUrl = `${BACKEND_URL}/api/upload/upload/${encodeURIComponent(img.public_id)}`;
        fetch(deleteUrl, {
          method: 'DELETE'
        }).catch(err => console.error('Error eliminando:', err));
      }
    }

    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null, allImages: [] }));

    // ✅ SINCRONIZACIÓN: Limpiar las imágenes de la ficha técnica
    setTechnicalSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        image: null,
        allImages: []
      };
    });

    setShowImageModal(false);
  };

  const handleTechnicalSheetChange = (sheetData) => {
    setTechnicalSheet(prev => {
      const base = prev || {};
      const safeUpdates = Object.fromEntries(
        Object.entries(sheetData || {}).filter(([, v]) => v !== undefined)
      );
      return { ...base, ...safeUpdates };
    });
  };

  const handleCancelClick = useCallback(() => {
    const hasChanges = hasProductChanges() || hasTechnicalSheetChanges();
    if (!hasChanges) {
      onCancel();
      return;
    }
    onShowConfirm({
      type: "confirm",
      title: "¿Seguro que deseas cancelar?",
      message: "Los cambios no guardados se perderán.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: onCancel
    });
  }, [onCancel, onShowConfirm, formData, imagePreview, technicalSheet, product]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleCancelClick();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleCancelClick]);

  // ─────────────────────────────────────────────────────────────────────────
  // ESTILOS (alineados con ProductionForm)
  // ─────────────────────────────────────────────────────────────────────────
  const getInputStyle = (field) => {
    const baseStyle = {
      width: "100%",
      border: "1.5px solid #e5e7eb",
      borderRadius: "10px",
      outline: "none",
      fontSize: "13px",
      color: "#1f2937",
      background: "#fff",
      padding: "8px 12px",
      boxSizing: "border-box",
      transition: "border-color 0.15s, background-color 0.15s",
    };

if ((touched[field] || formData[field]) && errors[field]) {
      // ✅ Fix: no mezclar shorthand `border` con `borderColor` (evita el
      // warning de React "Removing a style property during rerender"). Se
      // usa el border completo cuando hay error.
      return {
        ...baseStyle,
        border: "1.5px solid #ff4fd6",
      };
    }
    return baseStyle;
  };

  const errorStyle = {
    color: "#ff4fd6",
    fontSize: "11px",
    marginTop: "4px",
    display: "block",
    fontWeight: "700",
  };

  const cellStyle = {
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#1f2937",
    verticalAlign: "top",
    wordBreak: "break-word",
    overflow: "hidden"
  };

  const headerCellStyle = {
    ...cellStyle,
    backgroundColor: "#fafafa",
    fontWeight: "700",
    fontSize: "12px",
    color: "#1f2937",
    whiteSpace: isMobile ? 'normal' : "nowrap",
    width: isMobile ? 'auto' : "100px"
  };

  const requiredStar = <span style={{ color: "#ff4fd6", marginLeft: "2px", display: "inline" }}>*</span>;
  const isLastVersion = product ? (!selectedVersion || selectedVersion === (product?.technicalSheetVersions || 1)) : true;

  const btnPrimary = {
    padding: "11px 32px",
    borderRadius: "10px",
    border: "none",
    background: "#ff4fd6",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.2s",
    opacity: uploading ? 0.6 : 1,
  };

  const btnSecondary = {
    padding: "10px 32px",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    background: "#f3f4f6",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
  };

  const hasInvalidFields = () => {
    return errors.reference || errors.name || errors.category || errors.price || errors.stock;
  };

  const selectedClient = getSelectedClientObject();

  return (
    <div style={{ padding: isMobile ? '20px' : "36px 40px", overflowX: 'hidden', maxWidth: '100%' }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
          paddingBottom: 16,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "#ff4fd6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            {product ? "Editar Producto" : "Crear Nuevo Producto"}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#9ca3af",
            }}
          >
            {product
              ? "Actualiza los datos del producto"
              : "Completa todos los campos obligatorios"}
          </p>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: currentStep === 1 ? "#ff4fd6" : "#e9d5f5",
            color: currentStep === 1 ? "#fff" : "#ff4fd6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700"
          }}>1</div>
          <span style={{ fontSize: "13px", fontWeight: currentStep === 1 ? "600" : "400", color: currentStep === 1 ? "#ff4fd6" : "#9ca3af" }}>Datos del producto</span>
        </div>
        <div style={{ width: "48px", height: "2px", background: currentStep === 2 ? "#ff4fd6" : "#e5e7eb", margin: "0 8px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: currentStep === 2 ? "#ff4fd6" : "#f3f4f6",
            color: currentStep === 2 ? "#fff" : "#9ca3af",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700"
          }}>2</div>
          <span style={{ fontSize: "13px", fontWeight: currentStep === 2 ? "600" : "400", color: currentStep === 2 ? "#ff4fd6" : "#9ca3af" }}>Ficha Técnica</span>
        </div>
      </div>

      {currentStep === 1 ? (
        <>
          <div style={{ display: "flex", gap: "20px", flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: isMobile ? 'unset' : 2, width: isMobile ? '100%' : undefined }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
                <tbody>
                  <tr>
                    <td style={headerCellStyle}>Referencia:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          style={getInputStyle("reference")}
                          value={formData.reference}
                          onChange={handleChange}
                          name="reference"
                          placeholder="Ej. 3 4 5"
                          onBlur={() => handleBlur("reference")}
                          autoFocus
                        />
                        {requiredStar}
                      </div>
                      {(touched.reference || formData.reference) && errors.reference && (
                        <span style={errorStyle}>⚠ {errors.reference}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Nombre:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          style={getInputStyle("name")}
                          value={formData.name}
                          onChange={handleChange}
                          name="name"
                          placeholder="Ej. Crop Top Morado"
                          onBlur={() => handleBlur("name")}
                        />
                        {requiredStar}
                      </div>
                      {(touched.name || formData.name) && errors.name && (
                        <span style={errorStyle}>⚠ {errors.name}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Categoria:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(220px, 1fr) auto", alignItems: "center", gap: "8px", width: "100%" }}>
                        <CategoryDropdown
                          value={formData.category}
                          onChange={(category) => {
                            const categoryName =
                              category.name ??
                              category.nombre ??
                              "";

                            const categoryId =
                              category.id ??
                              category._id ??
                              category.id_categoria_producto ??
                              category.id_categorias ??
                              category.id_categoria;

                            setFormData((prev) => ({
                              ...prev,
                              category: categoryName,
                              categoryId: categoryId,
                            }));

                            setTouched((prev) => ({
                              ...prev,
                              category: true,
                            }));

                            const categoryError = validateCategory(categoryName);
                            setErrors((prev) => ({
                              ...prev,
                              category: categoryError,
                            }));
                          }}
                          touched={touched.category}
                          error={errors.category}
                          categories={categories}
                          onCreateCategory={() => setShowCategoryForm(true)}
                          isMobile={isMobile}
                        />
                        {requiredStar}
                      </div>
                      {/* Inline category error removed to avoid duplicate validation alerts.
                          Rely on the global alert for field-level feedback. */}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Sede:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <select
                          style={getInputStyle("sedeId")}
                          value={formData.sedeId || ""}
                          onChange={handleChange}
                          name="sedeId"
                          onBlur={() => handleBlur("sedeId")}
                        >
                          <option value="">Seleccionar sede...</option>
                          {sedes.map((s) => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </select>
                        {requiredStar}
                      </div>
                      {(touched.sedeId || formData.sedeId) && errors.sedeId && (
                        <span style={errorStyle}>⚠ {errors.sedeId}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Cliente:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(220px, 1fr) auto", alignItems: "center", gap: "8px", width: "100%" }}>
                        <ClientDropdown
                          value={technicalSheet?.client || ''}
                          clients={clientOptions}
                          onChange={(client) => {
                            const clientName = client ? (client.nombre || '') : '';
                            setTechnicalSheet((prev) => ({ ...(prev || {}), client: clientName }));
                          }}
                          onCreateClient={openCreateClientModal}
                          isMobile={isMobile}
                        />
                        <button
                          type="button"
                          disabled={!selectedClient}
                          onClick={openEditClientModal}
                          style={{
                            border: "1.5px solid #ff4fd6",
                            background: selectedClient ? "#fff0fb" : "#f9fafb",
                            color: selectedClient ? "#ff4fd6" : "#e5b8dc",
                            borderRadius: 10,
                            padding: "0 16px",
                            minHeight: "42px",
                            fontWeight: 700,
                            cursor: selectedClient ? "pointer" : "not-allowed",
                            opacity: selectedClient ? 1 : 0.7,
                            whiteSpace: "nowrap",
                            transition: "0.15s"
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Precio:</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          style={getInputStyle("price")}
                          type="text"
                          inputMode="decimal"
                          value={formData.price}
                          onChange={handlePriceInputChange}
                          onKeyDown={handlePriceKeyDown}
                          onPaste={handlePricePaste}
                          name="price"
                          placeholder="Ej. 40000"
                          onBlur={() => handleBlur("price")}
                        />
                        {requiredStar}
                      </div>
                      {(touched.price || formData.price) && errors.price && (
                        <span style={errorStyle}>⚠ {errors.price}</span>
                      )}
                    </td>
                    <td style={headerCellStyle}>Stock:</td>
                    <td style={cellStyle} colSpan={3}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          style={getInputStyle("stock")}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.stock}
                          onChange={handleStockInputChange}
                          onKeyDown={handleStockKeyDown}
                          onPaste={handleStockPaste}
                          name="stock"
                          placeholder="Ej. 10"
                          onBlur={() => handleBlur("stock")}
                        />
                        {requiredStar}
                      </div>
                      {(touched.stock || formData.stock) && errors.stock && (
                        <span style={errorStyle}>⚠ {errors.stock}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GALERÍA CON CLOUDINARY */}
            {/* GALERÍA CON CLOUDINARY */}
            <div style={{ flex: isMobile ? 'unset' : 1, width: isMobile ? '100%' : undefined }}>
              <div style={{
                border: (formData.allImages && formData.allImages.length > 0) ? "1.5px solid #f9a8d4" : "2px dashed #f9a8d4",
                borderRadius: "12px",
                padding: isMobile ? "18px" : "33px",
                backgroundColor: (formData.allImages && formData.allImages.length > 0) ? "#fff0fb" : "#fafafa",
                minHeight: isMobile ? "180px" : "250px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: '100%'
              }}>
                {(() => {
                  const allImages = formData.allImages || [];
                  return (
                    <div style={{ textAlign: "center", width: "100%" }}>
                      {allImages.length > 0 ? (
                        <>
                          <div
                            onClick={() => {
                              if (allImages.length > 0) {
                                setSelectedImageIdx(0);
                                setShowImageModal(true);
                              }
                            }}
                            style={{
                              width: 150,
                              height: 190,
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 14px rgba(255,79,214,0.15)",
                              cursor: "pointer",
                              position: "relative",
                              margin: "0 auto"
                            }}
                          >
                            {allImages[0]?.src && (
                              <img
                                src={allImages[0].src}
                                alt={formData.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                              />
                            )}
                            {allImages.length > 1 && (
                              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 6 }}>
                                +{allImages.length - 1}
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0)",
                                borderRadius: 12,
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.18)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                            />
                          </div>

                          {allImages.length > 1 && (
                            <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                              {allImages.slice(1, 4).map((img, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setSelectedImageIdx(i + 1);
                                    setShowImageModal(true);
                                  }}
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border: "1.5px solid #f9a8d4",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#ff4fd6";
                                    e.currentTarget.style.boxShadow = "0 0 8px rgba(255,79,214,0.2)";
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#f9a8d4";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  {img?.src && (
                                    <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={handleDeleteAllImages}
                              style={{
                                padding: "6px 16px",
                                backgroundColor: "#fff",
                                border: "1.5px solid #ff4fd6",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#ff4fd6",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = "#fff0fb";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = "#fff";
                              }}
                            >
                              × Eliminar imagen
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                              marginBottom: "10px"
                            }}
                          >
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                              stroke="#ff4fd6" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                            <span style={{ color: "#ff4fd6", fontWeight: 700 }}>Sube una imagen</span><br />o arrastra y suelta
                          </p>
                          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>PNG, JPG, GIF hasta 10MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ display: "none" }}
                            id="product-image-upload"
                          />
                          <label
                            htmlFor="product-image-upload"
                            style={{
                              marginTop: "10px",
                              padding: "6px 16px",
                              backgroundColor: uploading ? "#e5e7eb" : "#f3f4f6",
                              border: "1.5px solid #e5e7eb",
                              borderRadius: "8px",
                              fontSize: "12px",
                              color: uploading ? "#9ca3af" : "#6b7280",
                              cursor: uploading ? "not-allowed" : "pointer",
                              pointerEvents: uploading ? "none" : "auto"
                            }}
                          >
                            {uploading ? "Subiendo a Cloudinary..." : "Seleccionar archivo"}
                          </label>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "28px",
              paddingTop: "14px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "14px"
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontStyle: "italic", textAlign: "right" }}>
              {product ? "*Para editar un producto, debes editar la ficha técnica*" : "*Para crear un producto, debes crear la ficha técnica*"}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" style={btnSecondary} onClick={handleCancelClick}>
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  ...btnPrimary,
                  opacity: hasInvalidFields() ? 0.7 : 1,
                  cursor: hasInvalidFields() ? "not-allowed" : "pointer"
                }}
                onClick={() => {
                  if (validateForm()) {
                    setCurrentStep(2);
                  }
                }}
              >
                {product ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}
              </button>
            </div>
            {/* En mobile, mostrar la ficha técnica abajo para facilitar edición/visualización */}
            {isMobile && currentStep === 2 && (
              <>
                <div style={{ marginTop: 18 }} />
                <TechnicalSheet
                  key={selectedVersion || "current-mobile"}
                  sheet={product && selectedVersion ? { ...product?.technicalSheet, version: selectedVersion } : technicalSheet || product?.technicalSheet}
                  isEditing={product ? (isLastVersion && !viewMode) : true}
                  onChange={handleTechnicalSheetChange}
                  productName={formData.name}
                  categoryDescription={getSelectedCategoryDescription()}
                  productRef={formData.reference}
                  productImage={imagePreview}
                  productImages={formData.allImages}
                />

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                  }}
                >
                  <button type="button" style={btnSecondary} onClick={() => setCurrentStep(1)}>
                    ← Volver
                  </button>

                  {product && isLastVersion && !viewMode && (product?.technicalSheetVersions || 1) > 1 && (
                    <button
                      type="button"
                      style={{
                        ...btnSecondary,
                        background: "#ff4fd6",
                        color: "#fff",
                        borderColor: "#ff4fd6"
                      }}
                      onClick={handleDeleteVersionClick}
                    >
                      Eliminar versión
                    </button>
                  )}

                  {(!product || (isLastVersion && !viewMode)) && (
                    <button
                      type="button"
                      style={{
                        ...btnPrimary,
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (product ? 'Procesando...' : 'Creando...') : (product ? 'Guardar producto' : 'Crear producto')}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {product && product?.technicalSheetVersions > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Fecha versión {new Date().toLocaleDateString('es-CO')}</div>
              <div style={{ position: 'relative' }}>
                <div onClick={() => setShowVersions(!showVersions)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#fff0fb', border: '1px solid #ff4fd6' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#ff4fd6' }}>
                    {viewMode ? 'Viendo versión' : 'Editando versión'} {selectedVersion || product?.technicalSheetVersions || 1}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2" style={{ transform: showVersions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {showVersions && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setShowVersions(false)} />
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '200px' }}>
                      {[...Array(product?.technicalSheetVersions || 1)].map((_, i) => {
                        const versionNum = i + 1;
                        const isCurrent = versionNum === (product?.technicalSheetVersions || 1);
                        const isSelected = versionNum === selectedVersion;
                        return (
                          <div
                            key={versionNum}
                            onClick={() => handleVersionSelect(versionNum)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#fdf4ff' : 'transparent',
                              color: isSelected ? '#ff4fd6' : '#1f2937',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>Versión {versionNum} {isCurrent && '(Actual)'}</span>
                            {!isCurrent && <span style={{ fontSize: '11px', color: '#9ca3af' }}>Solo vista</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {product && viewMode && (
            <div style={{ backgroundColor: '#fff0fb', border: '1px solid #ff4fd6', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#1f2937' }}>
                Estás viendo una versión anterior. No se pueden realizar cambios.
                <button
                  onClick={() => handleVersionSelect(product?.technicalSheetVersions || 1)}
                  style={{ background: 'none', border: 'none', color: '#ff4fd6', fontWeight: '700', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}
                >
                  Volver a la versión actual
                </button>
              </span>
            </div>
          )}

          <TechnicalSheet
            key={selectedVersion || "current"}
            sheet={product && selectedVersion ? { ...product?.technicalSheet, version: selectedVersion } : technicalSheet || product?.technicalSheet}
            isEditing={product ? (isLastVersion && !viewMode) : true}
            onChange={handleTechnicalSheetChange}
            productName={formData.name}
            categoryDescription={getSelectedCategoryDescription()}
            productRef={formData.reference}
            productImage={imagePreview}
            productImages={formData.allImages}
          />

          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button type="button" style={btnSecondary} onClick={() => setCurrentStep(1)}>
              ← Volver
            </button>

            {product && isLastVersion && !viewMode && (product?.technicalSheetVersions || 1) > 1 && (
              <button
                type="button"
                style={{
                  ...btnSecondary,
                  background: "#ff4fd6",
                  color: "#fff",
                  borderColor: "#ff4fd6"
                }}
                onClick={handleDeleteVersionClick}
              >
                Eliminar versión
              </button>
            )}

            {(!product || (isLastVersion && !viewMode)) && (
              <button
                type="button"
                style={{
                  ...btnPrimary,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (product ? 'Procesando...' : 'Creando...') : (product ? 'Guardar producto' : 'Crear producto')}
              </button>
            )}
          </div>
        </>
      )}

      {/* ✅ Modal de categoría - overlay ocupa exactamente el viewport (sin minHeight/padding/scroll propio) */}
      {showCategoryForm && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setShowCategoryForm(false)}
          />
          <div style={{
            position: "relative",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "85vh",
            overflowX: "hidden",
            overflowY: "auto",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            zIndex: 1201,
            boxSizing: "border-box"
          }}>
            <ProductCategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setShowCategoryForm(false)}
              onShowAlert={onShowAlert}
              onShowConfirm={onShowConfirm}
            />
          </div>
        </div>
      )}

      {/* ✅ Modal de cliente (crear/editar) - mismo patrón visual y centrado que el modal de categoría,
          header con ícono + divisores, overlay sin scroll propio */}
      {clientFormOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={closeClientModal}
          />
          <div style={{
            position: "relative",
            width: "90%",
            maxWidth: "480px",
            maxHeight: "85vh",
            overflowX: "hidden",
            overflowY: "auto",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            zIndex: 1201,
            padding: "28px 32px",
            boxSizing: "border-box"
          }}>
            {/* Header con ícono, igual patrón que el header principal del ProductForm */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
                paddingBottom: 16,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#ff4fd6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1f2937",
                  }}
                >
                  {editingClientId ? "Editar cliente" : "Crear nuevo cliente"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#9ca3af",
                  }}
                >
                  {editingClientId
                    ? "Actualiza los datos del cliente"
                    : "Completa los datos del cliente"}
                </p>
              </div>
            </div>

            <form onSubmit={handleClientCreate}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Tipo de documento <span style={{ color: "#ff4fd6" }}>*</span></label>
                  <select
                    name="tipoDocumento"
                    value={clientDraft.tipoDocumento}
                    onChange={(e) => { setClientErrors(prev => { const n = { ...prev }; delete n.tipoDocumento; return n; }); setClientDraft(prev => ({ ...prev, tipoDocumento: e.target.value })); }}
                    onBlur={handleClientBlur}
                    style={{ width: "100%", boxSizing: "border-box", border: clientErrors.tipoDocumento ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}
                  >
                    <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="Cédula de extranjería">Cédula de extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {clientErrors.tipoDocumento && <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700, marginTop: 4, display: "block" }}>⚠ {clientErrors.tipoDocumento}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Nombre <span style={{ color: "#ff4fd6" }}>*</span></label>
                  <input
                    name="nombre"
                    value={clientDraft.nombre}
                    onChange={(e) => { setClientErrors(prev => { const n = { ...prev }; delete n.nombre; return n; }); setClientDraft(prev => ({ ...prev, nombre: e.target.value })); }}
                    onBlur={handleClientBlur}
                    placeholder="Nombre completo"
                    style={{ width: "100%", boxSizing: "border-box", border: clientErrors.nombre ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                  {clientErrors.nombre && <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700, marginTop: 4, display: "block" }}>⚠ {clientErrors.nombre}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Documento <span style={{ color: "#ff4fd6" }}>*</span></label>
                  <input
                    name="documento"
                    value={clientDraft.documento}
                    onChange={(e) => { if (!blockInput.onlyNumbers(e)) return; setClientErrors(prev => { const n = { ...prev }; delete n.documento; return n; }); setClientDraft(prev => ({ ...prev, documento: e.target.value })); }}
                    onBlur={handleClientBlur}
                    placeholder="Número de documento"
                    style={{ width: "100%", boxSizing: "border-box", border: clientErrors.documento ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                  {clientErrors.documento && <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700, marginTop: 4, display: "block" }}>⚠ {clientErrors.documento}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Teléfono</label>
                  <input
                    name="telefono"
                    value={clientDraft.telefono}
                    onChange={(e) => { if (!blockInput.onlyNumbers(e)) return; setClientErrors(prev => { const n = { ...prev }; delete n.telefono; return n; }); setClientDraft(prev => ({ ...prev, telefono: e.target.value })); }}
                    onBlur={handleClientBlur}
                    placeholder="Teléfono"
                    style={{ width: "100%", boxSizing: "border-box", border: clientErrors.telefono ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                  {clientErrors.telefono && <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700, marginTop: 4, display: "block" }}>⚠ {clientErrors.telefono}</span>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Correo <span style={{ color: "#ff4fd6" }}>*</span></label>
                  <input
                    name="correo"
                    type="email"
                    value={clientDraft.correo}
                    onChange={(e) => { setClientErrors(prev => { const n = { ...prev }; delete n.correo; return n; }); setClientDraft(prev => ({ ...prev, correo: e.target.value })); }}
                    onBlur={handleClientBlur}
                    placeholder="Correo electrónico"
                    style={{ width: "100%", boxSizing: "border-box", border: clientErrors.correo ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                  {clientErrors.correo && <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700, marginTop: 4, display: "block" }}>⚠ {clientErrors.correo}</span>}
                </div>
                {clientFormError && (
                  <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700 }}>⚠ {clientFormError}</span>
                )}

                {/* Línea divisoria antes de los botones, igual que el footer del form principal */}
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 14,
                    borderTop: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button type="button" onClick={closeClientModal} style={btnSecondary}>
                    Cancelar
                  </button>
                  <button type="submit" style={btnPrimary}>
                    {editingClientId ? "Actualizar cliente" : "Guardar cliente"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImageModal
        isOpen={showImageModal}
        images={formData.allImages}
        selectedIndex={selectedImageIdx}
        onClose={() => setShowImageModal(false)}
        onDeleteImage={handleDeleteImage}
        onDeleteAllImages={handleDeleteAllImages}
        productName={formData.name}
      />
    </div>
  );
};

export default ProductForm;