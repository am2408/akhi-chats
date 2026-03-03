import React from 'react';
import { useEffect, useState } from 'react';
import { fetchServers } from '../../../lib/api'; // Adjust the import based on your API structure
import ServerList from '../../../components/navigation/server-list';

const ServersPage = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadServers = async () => {
            try {
                const data = await fetchServers();
                setServers(data);
            } catch (error) {
                console.error('Failed to fetch servers:', error);
            } finally {
                setLoading(false);
            }
        };

        loadServers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="servers-page">
            <h1>Your Servers</h1>
            <ServerList servers={servers} />
        </div>
    );
};

export default ServersPage;