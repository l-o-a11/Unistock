import { useState, useCallback } from 'react';

export const useThird_partieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((term) => setSearchTerm(term), []);
  const clearSearch  = useCallback(() => setSearchTerm(''), []);

  // Filter logic — searches: Código, Nombre empresa, Contacto, NIT, Teléfono, Correo
  const filterThird_parties = useCallback((Third_parties) => {
    if (!searchTerm.trim()) return Third_parties;
    const q = searchTerm.toLowerCase();
    return Third_parties.filter(t =>
      t.codigo?.toLowerCase().includes(q) ||
      t.nombreEmpresa?.toLowerCase().includes(q) ||
      t.nombre?.toLowerCase().includes(q) ||
      t.nombreContacto?.toLowerCase().includes(q) ||
      t.contacto?.toLowerCase().includes(q) ||
      t.nit?.toString().includes(q) ||
      t.telefono?.toString().includes(q) ||
      t.correo?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return { searchTerm, handleSearch, clearSearch, filterThird_parties };
};

export default useThird_partieSearch;
