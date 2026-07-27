import React from 'react';

/**
 * @param {object} props
 * @param {string} props.title - Título de la página (ej. "Insumos")
 * @param {Array<{width:number, primary?:boolean}>} [props.toolbarButtons]
 *   Botones a la derecha de la barra de herramientas.
 * @param {Array<{width:number}>} [props.toolbarLeftButtons]
 *   Botones a la izquierda de la barra de herramientas.
 */
const TableSkeleton = ({
    title,
    toolbarButtons = [{ width: 110, primary: true }],
    toolbarLeftButtons = [],
}) => (
    <div style={{ padding: '24px 32px' }}>
        <style>{`
      @keyframes eloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
      @keyframes eskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{title}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{
                    width: 400, maxWidth: '100%', height: 38, borderRadius: 10,
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    animation: 'eskeleton-pulse 1.6s ease-in-out infinite',
                }} />
                <div style={{
                    width: 260, height: 11, borderRadius: 6,
                    background: '#f3f4f6', animation: 'eskeleton-pulse 1.6s ease-in-out infinite',
                }} />
            </div>
        </div>

        <div style={{
            background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        }}>
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    {toolbarLeftButtons.map((b, i) => (
                        <div key={i} style={{
                            width: b.width, height: 30, borderRadius: 8,
                            background: '#f3f4f6', border: '1px solid #e5e7eb',
                            animation: 'eskeleton-pulse 1.6s ease-in-out infinite',
                        }} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {toolbarButtons.map((b, i) => (
                        <div key={i} style={{
                            width: b.width, height: 38, borderRadius: b.primary ? 20 : 8,
                            background: b.primary ? 'linear-gradient(90deg, #ff8fe0, #FF4FD6)' : '#f3f4f6',
                            opacity: b.primary ? 0.4 : 1,
                            animation: 'eskeleton-pulse 1.6s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            </div>
        </div>

        <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: 0, height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)',
                animation: 'eloadbar 1.6s ease-in-out infinite',
            }} />
        </div>
    </div>
);

export default TableSkeleton;
