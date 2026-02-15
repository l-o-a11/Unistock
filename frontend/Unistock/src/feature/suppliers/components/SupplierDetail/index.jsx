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
          
          {/* Header - Detalle del Producto */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">🔍</span>
                Detalle del Producto
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

          {/* Contenido */}
          <div className="px-6 py-4">
            {/* Grid de 2 columnas para la información */}
            <div className="grid grid-cols-2 gap-4">
              {/* IMAGEN */}
              <div className="col-span-2 md:col-span-1">
                <HoverCard
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Imagen del producto</p>
                      <img src={product.image} alt={product.name} className="w-full rounded-lg" />
                      <p className="text-xs text-gray-500">Referencia: {product.reference}</p>
                    </div>
                  }
                >
                  
                </HoverCard>
              </div>

              

              {/* REFERENCIA Y NOMBRE */}
              <div className="space-y-4">
                <HoverCard
                  content={
                    <div>
                      <p className="font-medium mb-2">Referencia completa</p>
                      <p className="text-sm">{product.reference}</p>
                      <p className="text-xs text-gray-500 mt-2">ID: {product.id}</p>
                    </div>
                  }
                >
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      REFERENCIA
                    </label>
                    <p className="text-lg font-bold text-blue-600">{product.reference}</p>
                  </div>
                </HoverCard>

                <HoverCard
                  content={
                    <div>
                      <p className="font-medium mb-2">Nombre del producto</p>
                      <p className="text-sm">{product.name}</p>
                    </div>
                  }
                >
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      NOMBRE
                    </label>
                    <p className="text-lg font-medium">{product.name}</p>
                  </div>
                </HoverCard>
              </div>

              {/* STOCK */}
              <div className="col-span-2 md:col-span-1">
                <HoverCard
                  content={
                    <div>
                      <p className="font-medium mb-2">Stock actual</p>
                      <p className="text-sm">Unidades disponibles en inventario</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {product.stock < 5 ? '⚠️ Stock crítico' : 
                         product.stock < 10 ? '⚡ Stock bajo' : 
                         '✅ Stock normal'}
                      </p>
                    </div>
                  }
                >
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                      STOCK
                    </label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      product.stock < 5 ? 'bg-red-100 text-red-800' :
                      product.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </div>
                </HoverCard>
              </div>
            </div>

            
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Editar Proveedores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;