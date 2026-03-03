import React, { useEffect, useRef } from 'react';
import { useMedia } from '../../hooks/use-media';
import { MediaControls } from './media-controls';

const VideoCall: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { startVideo, stopVideo, isVideoOn } = useMedia();

    useEffect(() => {
        const initVideo = async () => {
            if (videoRef.current) {
                const stream = await startVideo();
                videoRef.current.srcObject = stream;
            }
        };

        initVideo();

        return () => {
            stopVideo();
        };
    }, [startVideo, stopVideo]);

    return (
        <div className="video-call-container">
            <video ref={videoRef} autoPlay className="video" />
            <MediaControls isVideoOn={isVideoOn} />
        </div>
    );
};

export default VideoCall;