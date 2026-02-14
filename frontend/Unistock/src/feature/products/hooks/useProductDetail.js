import { useState } from 'react';

export const useProductDetail = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  return {
    selectedProduct,
    isOpen,
    openDetail,
    closeDetail
  };
};

export default useProductDetail;