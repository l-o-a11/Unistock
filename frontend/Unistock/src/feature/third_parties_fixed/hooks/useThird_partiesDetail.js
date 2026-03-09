import { useState } from 'react';

// ✅ Fix: nombre del hook corregido (antes exportaba useSupplierDetail)
export const useThird_partieDetail = () => {
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (third) => {
    setSelectedThird_partie(third);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedThird_partie(null);
  };

  return {
    selectedThird_partie,
    isOpen,
    openDetail,
    closeDetail,
  };
};

export default useThird_partieDetail;
