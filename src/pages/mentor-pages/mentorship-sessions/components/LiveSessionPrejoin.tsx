import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Users, PhoneOff } from 'lucide-react';
import type { LiveSessionInfo } from '../../../../services/mentorshipsContent/liveSession';

interface LiveSessionPrejoinProps {
    sessionInfo: LiveSessionInfo;
    onJoin: () => void;
    onCancel: () => void;
}

const LiveSessionPrejoin: React.FC<LiveSessionPrejoinProps> = ({
    sessionInfo,
    onJoin,
    onCancel,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(false);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        let activeStream: MediaStream | null = null;

        const stopCurrentStream = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        const requestMedia = async () => {
            try {
                const constraints: MediaStreamConstraints = {};

                if (videoEnabled) {
                    constraints.video = true;
                }

                if (micEnabled) {
                    constraints.audio = true;
                }

                if (Object.keys(constraints).length === 0) {
                    stopCurrentStream();
                    setStream(null);
                    return;
                }

                stopCurrentStream();

                const mediaStream =
                    await navigator.mediaDevices.getUserMedia(constraints);

                activeStream = mediaStream;
                setStream(mediaStream);
                setPermissionError(false);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
                setPermissionError(true);
            }
        };

        requestMedia();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoEnabled, micEnabled]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const toggleMic = () => {
        setMicEnabled(prev => !prev);
    };

    const toggleVideo = () => {
        setVideoEnabled(prev => !prev);
    };

    return (
        <div className="flex flex-col md:flex-row h-[70vh] min-h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
            {/* Left Side */}
            <div className="w-full md:w-5/12 p-8 flex flex-col justify-center items-center bg-white border-r border-gray-100">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                    Join Meeting
                </h1>

                <h2 className="text-xl text-gray-600 mb-10 text-center truncate w-full px-4">
                    {sessionInfo.sessionTitle}
                </h2>

                <button
                    onClick={onJoin}
                    className="w-full max-w-sm py-3.5 px-6 bg-[#3B95D1] hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors mb-8 text-lg"
                >
                    Join Meeting
                </button>

                <div className="flex items-center gap-4 mb-10 justify-center">
                    <button
                        onClick={toggleMic}
                        className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        {micEnabled ? (
                            <Mic size={24} />
                        ) : (
                            <MicOff size={24} className="text-red-500" />
                        )}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        {videoEnabled ? (
                            <Video size={24} />
                        ) : (
                            <VideoOff size={24} className="text-red-500" />
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors ml-2"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>

                {permissionError && (
                    <div className="w-full max-w-sm bg-[#FBBB3C] text-gray-900 p-4 rounded-xl font-medium text-center">
                        Camera or microphone permission is required.
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="w-full md:w-7/12 bg-[#173A53] relative flex items-center justify-center p-8">
                {videoEnabled && !permissionError ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover rounded-xl shadow-lg border border-white/10"
                    />
                ) : (
                    <div className="w-64 h-64 bg-[#C4C4C4] rounded-full flex items-center justify-center">
                        <Users size={80} className="text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveSessionPrejoin;