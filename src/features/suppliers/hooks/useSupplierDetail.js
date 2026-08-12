import { useState } from 'react';

export const useSupplierDetail = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (supplier) => {
    setSelectedSupplier(supplier);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedSupplier(null);
  };

  return {
    selectedSupplier,
    isOpen,
    openDetail,
    closeDetail
  };
};

export default useSupplierDetail;