import { useEffect, useRef } from 'react';
import { PlayCircle, Video, X, ExternalLink } from 'lucide-react';
import type { ContentItem } from '../../../../types/student-role-types/studentMentorshipTypes';
import sessionImg from '../../../../assets/studentImgs/liveSession.webp';

interface ContentHeroProps {
  item: ContentItem;
  onJoinSession: (sessionId: number) => void;
  onCloseSession: () => void;
  showIframe: boolean;
  meetingUrl: string;
  isJoining: boolean;
}

const ContentHero = ({ 
  item, 
  onJoinSession, 
  onCloseSession, 
  showIframe, 
  meetingUrl, 
  isJoining 
}: ContentHeroProps) => {
  const openedRef = useRef(false);

  useEffect(() => {
    // Fallback: if tab wasn't opened yet, open once when session becomes active.
    if (!openedRef.current && showIframe && meetingUrl) {
      openedRef.current = true;
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    }
  }, [showIframe, meetingUrl]);

  const isLive = item.type.toUpperCase().includes('LIVE') || item.type.toUpperCase().includes('SESSION');

  if (showIframe && meetingUrl) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-900 flex flex-col items-center justify-center p-6 text-center text-white select-none">
        
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-red-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md animate-in fade-in zoom-in-95 duration-300">
          
          <div className="mb-5 relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl animate-ping opacity-75" />
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 shadow-lg relative">
              <Video className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-bold tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE NOW
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight text-slate-100">
            You're inside the Live Workspace
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            The interactive stream is running stably in your outer window. Use the controls below to manage your session.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[var(--primary-500)]  px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg text-white no-underline hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={15} />
              Return to Meeting Room
            </a>
            
            <button
              onClick={onCloseSession}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-colors border border-slate-800/80 flex items-center justify-center gap-2"
            >
              <X size={15} />
              Leave Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundImage: `url(${sessionImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      className="relative w-full aspect-video rounded-3xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 text-center text-white shadow-2xl"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/70" />
      
      {isLive && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full" /> LIVE NOW
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <PlayCircle className="w-12 sm:w-16 h-16 text-white mb-4 sm:mb-6 opacity-50 hidden md:flex " />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Live Session Starting Soon</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-md hidden md:flex">
          Join the stream to participate in the interactive discussion with the mentor.
        </p>
        
        <button 
          onClick={() => {
            if (!openedRef.current && meetingUrl) {
              openedRef.current = true;
              window.open(meetingUrl, '_blank', 'noopener,noreferrer');
            }
            onJoinSession(item.id);
          }}
          disabled={isJoining}
          className="bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5" /> 
          {isJoining ? 'Joining...' : 'Join Session'}
        </button>
      </div>
    </div>
  );
};

export default ContentHero;