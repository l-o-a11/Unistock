/**
 * @file Button.jsx
 * @description Componente de botón reutilizable con variantes de color estandarizadas.
 *
 * VARIANTES DISPONIBLES:
 *   primary   — Rosa corporativo (#FF4FD6) — acciones principales (guardar, crear)
 *   secondary — Gris neutro — acciones secundarias (cancelar, volver)
 *   success   — Verde — confirmaciones exitosas
 *   danger    — Rojo — acciones destructivas (eliminar, anular)
 *   warning   — Amarillo — acciones con advertencia
 *   ghost     — Transparente — acción discreta sin fondo
 *
 * USO:
 *   <Button variant="primary" type="submit">Guardar</Button>
 *   <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
 *   <Button variant="secondary" icon={<IconX />}>Cancelar</Button>
 */
import React from "react";

/**
 * @param {object}   props
 * @param {function} [props.onClick]   - Handler de clic
 * @param {React.ReactNode} props.children - Texto / contenido del botón
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'ghost'} [props.variant='primary']
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {React.ReactNode} [props.icon]  - Icono opcional mostrado a la izquierda
 * @param {string} [props.className]      - Clases Tailwind adicionales
 * @param {boolean} [props.disabled]      - Deshabilita el botón
 */
function Button({
  onClick,
  children,
  variant = "primary",
  type = "button",
  icon,
  className = "",
  disabled = false,
}) {
  /**
   * Paleta de colores por variante.
   * Todos los colores siguen el sistema de diseño del proyecto:
   *   - primary  : rosa corporativo #FF4FD6
   *   - secondary: gris Tailwind-200
   *   - success  : verde Tailwind-500
   *   - danger   : rojo Tailwind-500
   *   - warning  : amarillo Tailwind-500
   *   - ghost    : sin fondo, texto gris oscuro
   */
  const variants = {
    primary:
      "bg-[#FF4FD6] hover:bg-[#e636ba] active:bg-[#c026d3] text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800",
    success:
      "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white",
    danger:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
    warning:
      "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white",
    ghost:
      "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        text-sm font-medium
        rounded-lg
        transition-all duration-200
        shadow-sm hover:shadow-md
        whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {/* Icono opcional a la izquierda del texto */}
      {icon && <span className="w-[18px] h-[18px] flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
