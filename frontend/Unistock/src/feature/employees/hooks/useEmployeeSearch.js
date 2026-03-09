import { useState, useCallback } from "react";

export const useEmployeeSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = useCallback((term) => setSearchTerm(term), []);
    const clearSearch = useCallback(() => setSearchTerm(""), []);

    return { searchTerm, handleSearch, clearSearch };
};

export default useEmployeeSearch;