import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import TechnicalSheet from '../components/TechnicalSheet';

const TechnicalSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  
  // Buscar el producto por ID
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <button
          onClick={() => navigate('/productos')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#E91E8C',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Volver a productos
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '32px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '32px'
      }}>
        {/* Header con botón de cerrar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            Ficha Técnica - {product.name}
          </h1>
          <button
            onClick={() => navigate('/productos')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Componente TechnicalSheet en modo solo lectura */}
        <TechnicalSheet
          sheet={product.technicalSheet}
          isEditing={false}
        />
      </div>
    </div>
  );
};

export default TechnicalSheetPage;