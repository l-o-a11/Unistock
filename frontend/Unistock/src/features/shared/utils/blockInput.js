/**
 * @file blockInput.js
 * @description Utilidades para bloquear caracteres no permitidos en inputs en tiempo real.
 *
 * USO:
 *   onChange={e => { if (!blockInput.onlyNumbers(e)) return; handleChange(e); }}
 *   onChange={e => { if (!blockInput.onlyLetters(e)) return; handleChange(e); }}
 *   onChange={e => { if (!blockInput.nit(e)) return; handleChange(e); }}
 *
 * Cada función recibe el evento de onChange, evalúa el último carácter ingresado
 * y retorna false si debe bloquearse (el llamador hace return sin actualizar estado).
 */

export const blockInput = {
  /**
   * Permite solo dígitos (0-9).
   * Útil para teléfonos, números de documento, cantidades, etc.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean} true si el valor es válido, false si debe bloquearse
   */
  onlyNumbers: (e) => {
    const value = e.target.value;
    // Permite vacío (para borrar) o solo dígitos
    return value === "" || /^\d+$/.test(value);
  },

  /**
   * Permite solo letras (a-z, A-Z) y espacios.
   * Útil para nombres, ciudades, etc.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean} true si el valor es válido, false si debe bloquearse
   */
  onlyLetters: (e) => {
    const value = e.target.value;
    return value === "" || /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value);
  },

  /**
   * Permite dígitos y un guion opcional al final para formato NIT colombiano.
   * Ej: "900123456-7"
   * @param {React.ChangeEvent<HTMLInputElement>} e
   * @returns {boolean} true si el valor es válido, false si debe bloquearse
   */
  nit: (e) => {
    const value = e.target.value;
    return value === "" || /^\d{0,12}-?\d?$/.test(value);
  },
};

export default blockInput;
