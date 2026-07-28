import { useState } from "react";

export const useEmployeeDetail = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openDetail = (employee) => { setSelectedEmployee(employee); setIsOpen(true); };
    const closeDetail = () => { setIsOpen(false); setSelectedEmployee(null); };

    return { selectedEmployee, isOpen, openDetail, closeDetail };
};

export default useEmployeeDetail;