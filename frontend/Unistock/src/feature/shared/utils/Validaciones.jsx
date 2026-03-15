/**
 * @file Validaciones.jsx
 * @description Utilidades de validación y sanitización centralizadas para toda la aplicación.
 *
 * CÓMO USAR:
 *   import { validators, blockInput } from '../../../shared/utils/Validaciones';
 *
 *   // En onChange — bloqueo a nivel de carácter (devuelve false si el carácter no es válido)
 *   if (!blockInput.onlyNumbers(e)) return;
 *
 *   // En onBlur / validate — mensajes de error para el usuario
 *   const err = validators.required(value) || validators.email(value);
 */

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUEO DE INPUT (nivel de carácter — se usa en onChange)
// Devuelven `false` cuando el carácter introducido NO es válido,
// permitiendo que el handler padre haga un early-return sin mutar el estado.
// ─────────────────────────────────────────────────────────────────────────────
export const blockInput = {
  /**
   * Permite únicamente dígitos (0-9).
   * Ideal para: NIT numérico, teléfono, cantidad, IDs numéricos.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean} true si el valor es válido y se puede continuar
   */
  onlyNumbers: (e) => {
    const val = e.target.value;
    if (val !== "" && !/^\d+$/.test(val)) return false;
    return true;
  },

  /**
   * Permite únicamente letras y espacios (sin números ni caracteres especiales).
   * Ideal para: nombres de personas, ciudades, colores básicos.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean}
   */
  onlyLetters: (e) => {
    const val = e.target.value;
    if (val !== "" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val)) return false;
    return true;
  },

  /**
   * Permite letras, números y espacios — sin caracteres especiales peligrosos.
   * Ideal para: nombres de empresa, referencias de producto.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean}
   */
  alphanumeric: (e) => {
    const val = e.target.value;
    if (val !== "" && !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_,./]+$/.test(val))
      return false;
    return true;
  },

  /**
   * Permite el formato de NIT colombiano: dígitos, puntos y guion.
   * Ejemplo válido: 900.123.456-7
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean}
   */
  nit: (e) => {
    const val = e.target.value;
    if (val !== "" && !/^[0-9.\-]*$/.test(val)) return false;
    return true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDADORES (devuelven string de error o "" si es válido)
// Se usan en onBlur y en validateAll antes del submit.
// ─────────────────────────────────────────────────────────────────────────────
export const validators = {
  /**
   * Campo obligatorio — falla si está vacío o solo espacios.
   * @param {string} value
   * @returns {string} mensaje de error o ""
   */
  required: (value) =>
    !value?.toString().trim() ? "Este campo es obligatorio" : "",

  /**
   * Solo dígitos — rechaza cualquier carácter no numérico.
   * @param {string} value
   * @returns {string}
   */
  numbers: (value) =>
    value && !/^\d+$/.test(value) ? "Solo se permiten números" : "",

  /**
   * Solo letras y espacios — rechaza números y caracteres especiales.
   * @param {string} value
   * @returns {string}
   */
  onlyLetters: (value) =>
    value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)
      ? "Solo se permiten letras"
      : "",

  /**
   * Formato de correo electrónico estándar (usuario@dominio.tld).
   * @param {string} value
   * @returns {string}
   */
  email: (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Correo electrónico inválido"
      : "",

  /**
   * Teléfono colombiano: obligatorio, solo dígitos, exactamente 10 caracteres.
   * @param {string} value
   * @returns {string}
   */
  phone: (value) => {
    if (!value) return "El teléfono es obligatorio";
    if (!/^\d+$/.test(value)) return "Solo se permiten números";
    if (value.length !== 10) return "Debe tener exactamente 10 dígitos";
    return "";
  },

  /**
   * NIT colombiano: dígitos, puntos y/o guion, entre 8 y 12 dígitos numéricos.
   * Ejemplo: 900.123.456-7 o 9001234567
   * @param {string} value
   * @returns {string}
   */
  nit: (value) => {
    if (!value) return "";
    if (!/^[0-9.\-]+$/.test(value))
      return "Formato inválido — Ej: 900.123.456-7";
    const digits = value.replace(/[.\-]/g, "");
    if (digits.length < 8 || digits.length > 12)
      return "Debe tener entre 8 y 12 dígitos numéricos";
    return "";
  },

  /**
   * Cantidad entera positiva (mínimo 1).
   * @param {string|number} value
   * @returns {string}
   */
  positiveInteger: (value) => {
    if (!value && value !== 0) return "Este campo es obligatorio";
    if (!/^\d+$/.test(String(value)))
      return "Solo se permiten números enteros positivos";
    if (Number(value) < 1) return "Debe ser mayor a 0";
    return "";
  },

  /**
   * Longitud mínima de un campo de texto.
   * @param {string} value
   * @param {number} min
   * @returns {string}
   */
  minLength: (value, min) =>
    value && value.trim().length < min ? `Mínimo ${min} caracteres` : "",

  /**
   * Longitud máxima de un campo de texto.
   * @param {string} value
   * @param {number} max
   * @returns {string}
   */
  maxLength: (value, max) =>
    value && value.trim().length > max ? `Máximo ${max} caracteres` : "",
};
