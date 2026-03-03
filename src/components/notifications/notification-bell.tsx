import React from 'react';
import { useNotifications } from '../../hooks/use-notifications';
import { BellIcon } from '@heroicons/react/outline';

const NotificationBell: React.FC = () => {
    const { notifications, markAsRead } = useNotifications();

    const handleBellClick = () => {
        markAsRead();
    };

    return (
        <div className="relative">
            <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-200">
                <BellIcon className="h-6 w-6 text-gray-700" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
            </button>
        </div>
    );
};

export default NotificationBell;