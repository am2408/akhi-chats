import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchServerData } from '@/lib/api'; // Assume this function fetches server data

const ServerPage = () => {
    const router = useRouter();
    const { serverId } = router.query;
    const [serverData, setServerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (serverId) {
            const loadData = async () => {
                const data = await fetchServerData(serverId);
                setServerData(data);
                setLoading(false);
            };
            loadData();
        }
    }, [serverId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!serverData) {
        return <div>Server not found</div>;
    }

    return (
        <div>
            <h1>{serverData.name}</h1>
            <p>{serverData.description}</p>
            {/* Additional server details and components can be added here */}
        </div>
    );
};

export default ServerPage;