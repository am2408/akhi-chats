import { useEffect, useState } from 'react';

const useMedia = () => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
        } catch (err) {
            setError('Unable to access media devices.');
        }
    };

    const stopMedia = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    };

    useEffect(() => {
        startMedia();
        return () => stopMedia();
    }, []);

    return { mediaStream, error, startMedia, stopMedia };
};

export default useMedia;