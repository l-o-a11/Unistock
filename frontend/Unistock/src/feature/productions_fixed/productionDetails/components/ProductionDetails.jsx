import React from 'react';

const ProductionDetails = ({ production }) => {
  if (!production) return null;

  return (
    <div>
      <h3>Resumen</h3>
      <p>Orden: {production.orderNumber}</p>
      <p>Cliente: {production.client}</p>
    </div>
  );
};

export default ProductionDetails;
