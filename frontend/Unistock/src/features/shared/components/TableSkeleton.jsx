/**
 * @file TableSkeleton.jsx
 * @description Skeleton de carga reutilizable para páginas de listado
 * (Usuarios, Empleados, Compras...). Reproduce el mismo layout que ya
 * tenía cada página cuando termina de cargar (título + buscador, barra
 * de herramientas blanca con botones, tarjeta de tabla con filas
 * "shimmer" y paginación), igual que el patrón ya usado en el
 * dashboard de Producción — así no hay salto visual entre el skeleton
 * y el contenido real, y las tres vistas comparten el mismo método
 * de carga.
 *
 * USO:
 *   if (loading) return (
 *     <TableSkeleton
 *       title="Usuarios"
 *       toolbarButtons={[{ width: 110, primary: true }]}
 *     />
 *   );
 */
import React from 'react';

const PINK = '#FF4FD6';

/**
 * @param {object} props
 * @param {string} props.title - Título de la página (ej. "Usuarios")
 * @param {number} [props.rows=6] - Número de filas de tabla a simular
 * @param {Array<{width:number, primary?:boolean}>} [props.toolbarButtons]
 *   Botones a la derecha de la barra de herramientas (ej. "Agregar").
 * @param {Array<{width:number}>} [props.toolbarLeftButtons]
 *   Botones a la izquierda de la barra de herramientas (ej. "Exportar").
 */
const TableSkeleton = ({
    title,
    rows = 6,
    toolbarButtons = [{ width: 110, primary: true }],
    toolbarLeftButtons = [],
}) => (
    <div style={{ padding: '24px 32px' }}>
        <style>{`
      @keyframes uskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes uskeleton-loadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
    `}</style>

        {/* Header: título + buscador — mismo layout que las páginas reales */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{title}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{
                    width: 400, maxWidth: '100%', height: 36, borderRadius: 8,
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
                }} />
                <div style={{ width: 220, height: 10, borderRadius: 4, background: '#f3f4f6', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
            </div>
        </div>

        {/* Barra de herramientas: mismo contenedor blanco redondeado */}
        <div style={{
            background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}>
            <div style={{ display: 'flex', gap: 10 }}>
                {toolbarLeftButtons.map((b, i) => (
                    <div key={i} style={{
                        width: b.width, height: 30, borderRadius: 8, background: '#f3f4f6', border: '1px solid #e5e7eb',
                        animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
                    }} />
                ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                {toolbarButtons.map((b, i) => (
                    <div key={i} style={{
                        width: b.width, height: 34, borderRadius: b.primary ? 20 : 8,
                        background: b.primary ? PINK : '#f3f4f6',
                        opacity: b.primary ? 0.15 : 1,
                        border: b.primary ? 'none' : '1px solid #e5e7eb',
                        animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
                    }} />
                ))}
            </div>
        </div>

        {/* Tarjeta de tabla — mismo contenedor blanco redondeado que producción */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} style={{
                        height: 42, borderRadius: 8, background: i % 2 === 0 ? '#f9fafb' : '#fdf6ff',
                        animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
                        animationDelay: `${i * 0.07}s`,
                    }} />
                ))}
            </div>
            <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, height: '100%', borderRadius: 99,
                    background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)',
                    animation: 'uskeleton-loadbar 1.6s ease-in-out infinite',
                }} />
            </div>
        </div>

        {/* Paginación */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                    width: 30, height: 30, borderRadius: 6, background: '#f3f4f6', border: '1px solid #e5e7eb',
                    animation: 'uskeleton-pulse 1.6s ease-in-out infinite', animationDelay: `${i * 0.05}s`,
                }} />
            ))}
        </div>
    </div>
);

export default TableSkeleton;