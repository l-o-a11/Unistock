import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import CategoryForm from '../components/CategoryForm';

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { createCategory } = useCategories();

  const handleSubmit = async (categoryData) => {
    try {
      await createCategory(categoryData);
      navigate('/categorias');
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '32px',
    }}>
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/categorias')}
      />
    </div>
  );
};

export default CreateCategoryPage;