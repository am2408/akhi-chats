import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import Avatar from '../ui/avatar';
import Button from '../ui/button';

const UserPanel: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex items-center p-4 bg-gray-800 text-white">
            {user && (
                <>
                    <Avatar src={user.avatarUrl} alt={user.name} />
                    <div className="ml-3">
                        <h2 className="text-lg font-semibold">{user.name}</h2>
                        <p className="text-sm">{user.email}</p>
                    </div>
                    <Button onClick={logout} className="ml-auto">
                        Logout
                    </Button>
                </>
            )}
        </div>
    );
};

export default UserPanel;