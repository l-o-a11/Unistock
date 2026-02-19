import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductForm from '../components/ProductForm';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();

  const handleSubmit = async (productData) => {
    try {
      await createProduct(productData);
      navigate('/productos');
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <ProductForm onSubmit={handleSubmit} onCancel={() => navigate('/productos')} />
    </div>
  );
};

export default CreateProductPage;