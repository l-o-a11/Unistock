import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import CategoryForm from '../components/CategoryForm';

const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, updateCategory } = useCategories();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const found = categories.find(c => c.id === id);
    setCategory(found);
  }, [id, categories]);

  const handleSubmit = async (categoryData) => {
    try {
      await updateCategory(id, categoryData);
      navigate('/categorias');
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
    }
  };

  if (!category) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Cargando categoría...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '32px',
    }}>
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/categorias')}
      />
    </div>
  );
};

export default EditCategoryPage;