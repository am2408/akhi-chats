import React from 'react';

const ChannelList = () => {
    const channels = [
        { id: 1, name: 'General' },
        { id: 2, name: 'Random' },
        { id: 3, name: 'Development' },
        { id: 4, name: 'Design' },
    ];

    return (
        <div className="channel-list">
            <h2 className="text-lg font-bold">Channels</h2>
            <ul className="mt-2">
                {channels.map(channel => (
                    <li key={channel.id} className="channel-item p-2 hover:bg-gray-200 rounded">
                        {channel.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChannelList;