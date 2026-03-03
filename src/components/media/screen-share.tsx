import React, { useEffect, useRef } from 'react';
import { useMedia } from '../../hooks/use-media';

const ScreenShare: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const { startScreenShare, stopScreenShare, isSharing } = useMedia();

    useEffect(() => {
        if (isSharing && videoRef.current) {
            startScreenShare(videoRef.current);
        }

        return () => {
            if (isSharing) {
                stopScreenShare();
            }
        };
    }, [isSharing, startScreenShare, stopScreenShare]);

    return (
        <div className="screen-share">
            <video ref={videoRef} autoPlay className="w-full h-full" />
            <div className="controls">
                <button onClick={isSharing ? stopScreenShare : startScreenShare}>
                    {isSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>
            </div>
        </div>
    );
};

export default ScreenShare;