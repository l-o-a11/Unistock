import React from 'react';
import AppRouter from './routers';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Puedes personalizarlo después */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Unistock
              </h1>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content con las rutas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;