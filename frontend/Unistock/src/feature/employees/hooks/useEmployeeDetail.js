import { useState } from 'react';

export const useUserDetail = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openDetail = (User) => {
        setSelectedUser(User);
        setIsOpen(true);
    };

    const closeDetail = () => {
        setIsOpen(false);
        setSelectedUser(null);
    };

    return {
        selectedUser,
        isOpen,
        openDetail,
        closeDetail
    };
};

export default useUserDetail