import { useState, useCallback } from 'react';

export const useUserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return {
        searchTerm,
        handleSearch,
        clearSearch
    };
};

export default useUserSearch