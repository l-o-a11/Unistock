import { useState } from 'react';

export const useVersions = () => {
    const [showVersionAlert, setShowVersionAlert] = useState(false);
    const [versionMessage, setVersionMessage] = useState('');

    const checkVersionBeforeAction = (versions, action) => {
        if (versions.length > 1 && action === 'delete') {
            setVersionMessage('La acción no se puede realizar, el producto tiene más de una versión de ficha técnica asociada');
            setShowVersion(true);
            return false;
        }
        return true;
    };

    const closeAlert = () => {
        setShowVersion(false);
        setVersionMessage('');
    };

    return {
        showVersionAlert,
        versionMessage,
        checkVersionBeforeAction,
        closeAlert
    };
};