export const validators = {
  // ── Validadores genéricos (usados por múltiples formularios) ──────────────

  /** Campo obligatorio — rechaza vacío o solo espacios */
  required: (value) => {
    if (!value?.toString().trim()) return "Este campo es obligatorio";
    return "";
  },

  /** Solo dígitos */
  numbers: (value) => {
    if (value && !/^\d+$/.test(value.toString().trim()))
      return "Solo se permiten números";
    return "";
  },

  /** Formato de correo electrónico */
  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Correo electrónico no válido";
    return "";
  },

  /** Teléfono colombiano: exactamente 10 dígitos */
  phone: (value) => {
    if (value && !/^\d{10}$/.test(value.trim()))
      return "El teléfono debe tener exactamente 10 dígitos";
    return "";
  },

  /** Teléfono genérico: entre 7 y 15 dígitos */
  telefono: (value) => {
    if (value && !/^\d{7,15}$/.test(value.trim()))
      return "Solo números, entre 7 y 15 dígitos";
    return "";
  },

  /** NIT colombiano: 8-12 dígitos, opcionalmente con guion y dígito verificador */
  nit: (value) => {
    if (value && !/^\d{8,12}(-\d)?$/.test(value.trim()))
      return "NIT inválido (ej: 900123456 o 900123456-7)";
    return "";
  },

  /** Número entero positivo (mayor a 0) */
  positiveInteger: (value) => {
    if (value === "" || value === null || value === undefined)
      return "Este campo es obligatorio";
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0)
      return "Debe ser un número entero mayor a 0";
    return "";
  },

  /** Número positivo (mayor a 0, acepta decimales) */
  positiveNumber: (value) => {
    if (value === "" || value === null || value === undefined)
      return "Este campo es obligatorio";
    if (isNaN(value) || Number(value) <= 0)
      return "Debe ser un número mayor a 0";
    return "";
  },

  /** Solo letras y espacios (sin números ni caracteres especiales) */
  onlyLetters: (value) => {
    if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return "Solo se permiten letras";
    return "";
  },

  /** No debe contener números */
  noNumbers: (value) => {
    if (value && /\d/.test(value))
      return "No debe contener números";
    return "";
  },

  /**
   * Longitud mínima.
   * Soporta dos formas:
   *   validators.minLength(3)(value)  — fábrica con mínimo configurable
   *   validators.minLength(value)     — mínimo fijo de 3 (compatibilidad SedesForm)
   */
  minLength: (minOrValue) => {
    if (typeof minOrValue === "string") {
      return minOrValue.trim().length < 3 ? "Mínimo 3 caracteres" : "";
    }
    return (value) =>
      value && value.trim().length < minOrValue
        ? `Mínimo ${minOrValue} caracteres`
        : "";
  },

  /** Longitud máxima — uso: validators.maxLength(50)(value) */
  maxLength: (max) => (value) =>
    value && value.trim().length > max ? `Máximo ${max} caracteres` : "",

  // ── Validadores específicos de dominio ────────────────────────────────────

  reference: (value) => {
    if (!value.trim()) return "La referencia es obligatoria";
    if (value.trim().length < 3) return "Mínimo 3 caracteres";
    return "";
  },

  nombre: (value) => {
    if (!value?.trim()) return "El nombre es obligatorio";
    if (value.trim().length < 3) return "Mínimo 3 caracteres";
    return "";
  },

  categoriaId: (value) => {
    if (!value) return "Selecciona una categoría";
    return "";
  },

  price: (value) => {
    if (!value) return "El precio es obligatorio";
    if (isNaN(value) || Number(value) <= 0) return "Debe ser positivo";
    return "";
  },

  stock: (value) => {
    if (value === "") return "El stock es obligatorio";
    if (isNaN(value) || Number(value) < 0) return "Debe ser válido";
    return "";
  },

  valorMedida: (value) => {
    if (value === "") return "El valor es obligatorio";
    if (isNaN(value) || Number(value) <= 0) return "Debe ser positivo";
    return "";
  },

  medidaId: (value) => {
    if (!value) return "Selecciona una medida";
    return "";
  },
};

// 🔥 VALIDAR UN SOLO CAMPO
export const validateField = (name, value) => {
  return validators[name] ? validators[name](value) : "";
};

// 🔥 VALIDAR TODO EL FORMULARIO
export const validateForm = (formData) => {
  const errors = {};
  Object.keys(validators).forEach((field) => {
    if (typeof validators[field] === "function") {
      const result = validators[field](formData[field]);
      // Solo guarda si es string (no función de fábrica como maxLength/minLength)
      if (typeof result === "string") {
        errors[field] = result;
      }
    }
  });
  return errors;
};
