import { useEffect, useState } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [newNotification, setNewNotification] = useState(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/notifications');

        eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNewNotification(notification);
            setNotifications((prev) => [...prev, notification]);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return {
        notifications,
        newNotification,
        clearNotifications,
    };
};

export default useNotifications;