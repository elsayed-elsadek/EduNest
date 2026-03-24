import React from 'react';

interface JitsiMeetingFrameProps {
    meetingUrl: string;
    onEndSession: () => void;
}

const JitsiMeetingFrame: React.FC<JitsiMeetingFrameProps> = ({ meetingUrl, onEndSession }) => {
    // Determine the host and path to inject configuration options
    // Assuming the URL URL comes in as https://meet.jit.si/EduNest_Session_3_178bcef2-e5e4-46b6-bdd6-c8ee6db9f91b
    // We append #config.prejoinPageEnabled=false to bypass the external Jitsi prejoin

    let embedUrl = meetingUrl;
    try {
        const urlObj = new URL(meetingUrl);
        urlObj.hash = 'config.prejoinPageEnabled=false&config.disableDeepLinking=true';
        embedUrl = urlObj.toString();
    } catch (e) {
        // Fallback if URL is malformed
        embedUrl = `${meetingUrl}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
    }

    return (
        <div className="w-full h-[80vh] min-h-[600px] rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-[#173A53] relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 text-white rounded-lg flex items-center gap-4">
                <span className="text-sm font-medium">Meeting in Progress</span>
                <button
                    onClick={onEndSession}
                    className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md text-sm transition-colors"
                >
                    End Meeting
                </button>
            </div>

            <iframe
                src={embedUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-none"
                title="Live Session Meeting"
            ></iframe>
        </div>
    );
};

export default JitsiMeetingFrame;
