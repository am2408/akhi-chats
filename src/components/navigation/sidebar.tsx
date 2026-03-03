import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import ServerList from './server-list';
import ChannelList from './channel-list';
import UserPanel from './user-panel';

const Sidebar: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="logo">Akhi Chats</h1>
            </div>
            <ServerList />
            <ChannelList />
            <UserPanel user={user} />
            <div className="sidebar-footer">
                <Link to="/settings" className="settings-link">Settings</Link>
            </div>
        </div>
    );
};

export default Sidebar;