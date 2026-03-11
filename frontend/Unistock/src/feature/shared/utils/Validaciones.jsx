export const validators = {

  required: (value) =>
    !value?.toString().trim() ? "Este campo es obligatorio" : "",

  numbers: (value) =>
    value && !/^\d+$/.test(value)
      ? "Solo se permiten números"
      : "",

  email: (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Correo inválido"
      : "",

  phone: (value) => {
    if (!value) return "El teléfono es obligatorio";
    if (!/^\d+$/.test(value)) return "Solo números";
    if (value.length > 10) return "Máximo 10 dígitos";
    return "";
  },

  onlyLetters: (value) =>
    value && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)
      ? "Solo se permiten letras"
      : "",
  
    

};