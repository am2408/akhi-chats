import React from 'react';

const ServerList = () => {
    const servers = [
        { id: 1, name: 'General' },
        { id: 2, name: 'Development' },
        { id: 3, name: 'Design' },
        { id: 4, name: 'Marketing' },
    ];

    return (
        <div className="server-list">
            <h2 className="text-lg font-bold">Servers</h2>
            <ul>
                {servers.map(server => (
                    <li key={server.id} className="server-item">
                        <a href={`/servers/${server.id}`} className="server-link">
                            {server.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ServerList;