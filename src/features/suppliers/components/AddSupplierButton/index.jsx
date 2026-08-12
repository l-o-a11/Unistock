import React from 'react';
import Button from '../../../shared/components/Button';

const AddSupplierButton = ({ onClick, label = "Agregar" }) => (
  <Button
    variant="primary"
    onClick={onClick}
    icon={
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    }
  >
    {label}
  </Button>
);

export default AddSupplierButton;
