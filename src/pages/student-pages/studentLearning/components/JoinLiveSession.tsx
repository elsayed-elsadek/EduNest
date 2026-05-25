import { useState } from 'react';
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
  const isLive = item.type.toUpperCase().includes('LIVE') || item.type.toUpperCase().includes('SESSION');
  const [showWarningTip, setShowWarningTip] = useState(true);
  
  let embedUrl = meetingUrl;
  try {
    const urlObj = new URL(meetingUrl);
    urlObj.hash = 'config.prejoinPageEnabled=false&config.disableDeepLinking=true';
    embedUrl = urlObj.toString();
  } catch (e) {
    console.error('Error adding hash to URL:', e);
    embedUrl = `${meetingUrl}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
  }

  if (showIframe && meetingUrl) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
        {/* Top controls overlay */}
        <div className="absolute top-4 left-4 right-16 z-10 bg-black/60 backdrop-blur-md p-3 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg border border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide hidden sm:block">Live Session in Progress</span>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm text-white no-underline hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in New Tab (Fix 5-min limit)</span>
              <span className="sm:hidden">New Tab</span>
            </a>
          </div>
        </div>

        {/* Main meeting iframe */}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; speaker; display-capture"
          title="Live Session"
        />

        {/* Original Close Button */}
        <button
          onClick={onCloseSession}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-20 shadow-lg"
          title="Close session"
        >
          <X className="w-6 h-6" />
        </button>

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
  }

  return (
    <div
      style={{ backgroundImage: `url(${sessionImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      className="relative w-full aspect-video rounded-3xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 text-center text-white shadow-2xl "
    >
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/70" />
      
      {isLive && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full" /> LIVE NOW
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <PlayCircle className="w-12 sm:w-16 h-16 text-white mb-4 sm:mb-6 opacity-50 hidden md:flex " />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Live Session Starting Soon</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-md hidden md:flex">Join the stream to participate in the interactive discussion with the mentor.</p>
        
        <button 
          onClick={() => onJoinSession(item.id)}
          disabled={isJoining}
          className="bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5" /> {isJoining ? 'Joining...' : 'Join Session'}
        </button>
      </div>
    </div>
  );
};

export default ContentHero;