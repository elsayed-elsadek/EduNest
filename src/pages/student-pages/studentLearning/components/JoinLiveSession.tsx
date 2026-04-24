import { PlayCircle, Video, X } from 'lucide-react';
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

  if (showIframe && meetingUrl) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl">
        <iframe
          src={meetingUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; speaker; display-capture"
          title="Live Session"
        />
        <button
          onClick={onCloseSession}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
          title="Close session"
        >
          <X className="w-6 h-6" />
        </button>
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
