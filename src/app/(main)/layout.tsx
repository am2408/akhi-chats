import React from 'react';
import { Sidebar } from '../../components/navigation/sidebar';
import { UserPanel } from '../../components/navigation/user-panel';
import { NotificationBell } from '../../components/notifications/notification-bell';
import './globals.css';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
                    <h1 className="text-xl">Chat Application</h1>
                    <NotificationBell />
                    <UserPanel />
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;