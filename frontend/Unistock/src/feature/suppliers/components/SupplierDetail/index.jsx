import React from 'react';
import HoverCard from '../HoverCard';

const SupplierDetail = ({ supplier, onClose, onEdit, onViewTechnicalSheet }) => {
  if (!supplier) return null;



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          
          {/* Header - Detalle del proveedores */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">🔍</span>
                Detalle del Proveedor
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>
            </div>
          </div>
        </div>
      
  );
};

export default SupplierDetail;