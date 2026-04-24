import { useState } from "react";

export const useSupplyDetail = () => {
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (supply) => {
    setSelectedSupply(supply);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedSupply(null);
  };

  return {
    selectedSupply,
    isOpen,
    openDetail,
    closeDetail,
  };
};