import React from 'react';
import { useNotifications } from '../../hooks/use-notifications';

const NotificationList: React.FC = () => {
    const { notifications, markAsRead } = useNotifications();

    return (
        <div className="notification-list">
            {notifications.length === 0 ? (
                <p>No notifications</p>
            ) : (
                notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                        <p>{notification.message}</p>
                        <button onClick={() => markAsRead(notification.id)}>Mark as Read</button>
                    </div>
                ))
            )}
        </div>
    );
};

export default NotificationList;