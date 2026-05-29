import { ExternalLink, VideoIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface JitsiMeetingFrameProps {
  meetingUrl: string;
  onEndSession: () => void;
}

const JitsiMeetingFrame: React.FC<JitsiMeetingFrameProps> = ({
  meetingUrl,
  onEndSession,
}) => {
  const openedRef = useRef(false);

  useEffect(() => {
    if (!meetingUrl || openedRef.current) return;

    openedRef.current = true;

    const newWindow = window.open(
      meetingUrl,
      '_blank',
      'noopener,noreferrer'
    );

    // لو المتصفح منع الـ popup
    if (!newWindow) {
      console.warn('Popup blocked by browser');
    }
  }, [meetingUrl]);

  return (
    <div className="w-full h-[400px] rounded-2xl border border-gray-200 bg-[#173A53] flex flex-col items-center justify-center text-white">
      <VideoIcon size={50}  className=" text-white animate-pulse mb-4" />
     
      <h2 className="text-xl font-bold mb-3">
        Meeting Opened in New Tab
      </h2>

      <p className="text-sm text-slate-300 mb-6 text-center max-w-md">
The meeting has opened in a new tab. Return there to join the session.       </p>
<div className="flex flex-col sm:flex-row items-center gap-4">
 <button
        onClick={onEndSession}
        className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium"
      >
        End Meeting
      </button>

           <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[var(--primary-500)]  px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg text-white no-underline hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={15} />
              Return to Meeting Room
            </a>

</div>

     
    </div>
  );
};

export default JitsiMeetingFrame;