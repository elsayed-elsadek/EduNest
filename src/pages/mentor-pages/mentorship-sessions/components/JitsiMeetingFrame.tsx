import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface JitsiMeetingFrameProps {
    meetingUrl: string;
    onEndSession: () => void;
}

const JitsiMeetingFrame: React.FC<JitsiMeetingFrameProps> = ({ meetingUrl, onEndSession }) => {
    // Determine the host and path to inject configuration options
    // Assuming the URL URL comes in as https://meet.jit.si/EduNest_Session_3_178bcef2-e5e4-46b6-bdd6-c8ee6db9f91b
    // We append #config.prejoinPageEnabled=false to bypass the external Jitsi prejoin

    const [showWarningTip, setShowWarningTip] = useState(true);

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
            {/* Top controls overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 bg-black/60 backdrop-blur-md p-3 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg border border-white/10">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-semibold tracking-wide">Meeting in Progress</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm text-white no-underline hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ExternalLink size={14} />
                        Open in New Tab (Fix 5-min limit)
                    </a>
                    
                    <button
                        onClick={onEndSession}
                        className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                        End Meeting
                    </button>
                </div>
            </div>

            {/* Main meeting iframe */}
            <iframe
                src={embedUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-none"
                title="Live Session Meeting"
            ></iframe>

            {/* Bottom info banner to bypass Jitsi embedding limit */}
            {showWarningTip && (
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-amber-500/95 backdrop-blur-md p-3 text-slate-900 rounded-xl flex items-center justify-between gap-4 shadow-lg border border-amber-400/20 text-xs font-medium">
                    <p className="m-0 leading-relaxed text-left flex-1">
                        ⚠️ <strong>Jitsi Tip:</strong> The public Jitsi server limits embedded iframe sessions to 5 minutes. To avoid being disconnected, click <strong>"Open in New Tab"</strong> at the top to join the meeting directly without any time limits.
                    </p>
                    <button 
                        onClick={() => setShowWarningTip(false)}
                        className="text-slate-900 hover:bg-amber-600/30 w-6 h-6 rounded-full flex items-center justify-center transition-colors font-bold text-sm"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default JitsiMeetingFrame;
