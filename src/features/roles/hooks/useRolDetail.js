import { useState } from 'react';

export const useRolDetail = () => {
  const [selectedRol, setSelectedRol] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (rol) => {
    setSelectedRol(rol);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedRol(null);
  };

  return {
    selectedRol,
    isOpen,
    openDetail,
    closeDetail
  };
};

export default useRolDetail;