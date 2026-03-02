import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../products/hooks/useProducts';

const ProductionForm = ({ Production, onSubmit, onCancel }) => {

  const { products = [] } = useProducts();
  
  const [type, setType] = useState("produccion"); // produccion | diseno
  const [savedColors, setSavedColors] = useState([]);
  const [savedClients, setSavedClients] = useState([]);

  const [formData, setFormData] = useState({
    referencia: '',
    cantidad: '',
    color: '',
    cliente: '',
    fechaSolicitud: '',
    diseno: ''
  });

  /**
   * Load saved colors and clients from localStorage on component mount
   */
  useEffect(() => {
    const colors = JSON.parse(localStorage.getItem('productionColors') || '[]');
    const clients = JSON.parse(localStorage.getItem('productionClients') || '[]');
    setSavedColors(colors);
    setSavedClients(clients);
  }, []);

  /**
   * Save color to localStorage when it's submitted
   */
  const saveColor = (color) => {
    if (color && !savedColors.includes(color)) {
      const updated = [color, ...savedColors].slice(0, 10); // Keep last 10 colors
      setSavedColors(updated);
      localStorage.setItem('productionColors', JSON.stringify(updated));
    }
  };

  /**
   * Save client to localStorage when it's submitted
   */
  const saveClient = (client) => {
    if (client && !savedClients.includes(client)) {
      const updated = [client, ...savedClients].slice(0, 10); // Keep last 10 clients
      setSavedClients(updated);
      localStorage.setItem('productionClients', JSON.stringify(updated));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save color and client for future use
    saveColor(formData.color);
    saveClient(formData.cliente);

    onSubmit({
      tipo: type,
      ...formData
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
    display: 'block'
  };

  const boxStyle = (active) => ({
    flex: 1,
    border: active ? '2px solid #FF4FD6' : '1px solid #ddd',
    borderRadius: 12,
    padding: 16,
    cursor: 'pointer',
    background: active ? '#fff0fb' : '#fafafa'
  });

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>Crear nueva orden de producción</h2>

      <form onSubmit={handleSubmit}>

        {/* ===== TIPO SOLICITUD ===== */}
        <p style={{ fontWeight: 500, marginBottom: 10  }}>Tipo de Solicitud</p>

        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>

          <div style={boxStyle(type === "produccion")} onClick={() => setType("produccion")}>
            <input type="radio" checked={type === "produccion"} readOnly />
            <p style={{ fontWeight: 600 }}>Producción</p>
            <small>Solicitud para la confección de un artículo existente.</small>
          </div>

          <div style={boxStyle(type === "diseno")} onClick={() => setType("diseno")}>
            <input type="radio" checked={type === "diseno"} readOnly />
            <p style={{ fontWeight: 600 }}>Diseño</p>
            <small>Solicitud para crear un nuevo diseño o boceto.</small>
          </div>

        </div>

        {/* ===== FORMULARIO DINÁMICO ===== */}

        {/* REFERENCIA */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Referencia *</label>
            <select 
              name="referencia" 
              style={inputStyle} 
              value={formData.referencia}
              onChange={handleChange} 
              required
            >
              <option value="">Seleccionar</option>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <option key={product.id} value={product.reference}>
                    {product.reference} - {product.name}
                  </option>
                ))
              ) : (
                <>
                  <option>Ref 001</option>
                  <option>Ref 002</option>
                </>
              )}
            </select>
          </div>

          {/* SOLO SI ES PRODUCCION */}
          {type === "produccion" && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cantidad *</label>
              <input name="cantidad" style={inputStyle} onChange={handleChange} required />
            </div>
          )}

          {/* SOLO SI ES DISEÑO */}
          {type === "diseno" && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Diseño *</label>
              <button type="button" style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                background: '#FF4FD6',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}>
                Crear ficha técnica
              </button>
            </div>
          )}
        </div>

        {/* SEGUNDA FILA */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>

          {/* COLOR */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Color *</label>
            <input 
              list="colorList"
              name="color" 
              style={inputStyle} 
              value={formData.color}
              onChange={handleChange} 
              placeholder="Ej: Blanco, Negro, Rojo"
              required 
            />
            <datalist id="colorList">
              {savedColors.map((color, idx) => (
                <option key={idx} value={color} />
              ))}
            </datalist>
          </div>

          {/* CLIENTE */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cliente *</label>
            <input 
              list="clientList"
              name="cliente" 
              style={inputStyle} 
              value={formData.cliente}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez, Empresa XYZ"
              required 
            />
            <datalist id="clientList">
              {savedClients.map((client, idx) => (
                <option key={idx} value={client} />
              ))}
            </datalist>
          </div>

        </div>

        {/* SOLO DISEÑO */}
        {type === "diseno" && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Fecha de solicitud *</label>
            <input
              type="date"
              name="fechaSolicitud"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* BOTONES */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#eee',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#FF4FD6',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Guardar
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProductionForm;