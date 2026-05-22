import { useState } from 'react';
import { Mail, Globe, Share2, Copy, Check } from 'lucide-react';
import type { MentorProfile } from '../../../../services/student-roleService/mentorProfile.api';

interface ContactSidebarProps {
  mentorProfile: MentorProfile | null;
}

const ContactSidebar = ({ mentorProfile }: ContactSidebarProps) => {
  const [copied, setCopied] = useState(false);

  // Function to handle copying the current URL to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Function to handle native web sharing
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mentor Profile: ${mentorProfile?.mentorFirstName}`,
          text: `Check out ${mentorProfile?.mentorFirstName}'s mentorship profile on EduNest!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      // Fallback if Web Share API is not supported
      handleCopyLink();
    }
  };

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm sticky top-28">
        <h3 className="text-lg font-semibold text-slate-900 mb-8 flex items-center gap-2">
          <span className="w-1 h-5 bg-[var(--primary-500)] rounded-full" /> Contact Information
        </h3>
        
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Email Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-[var(--primary-500)]/10 rounded-2xl text-[var(--primary-500)]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Email Address</p>
              <p className="text-sm font-semibold text-slate-900">{mentorProfile?.mentorEmail || 'Not available'}</p>
            </div>
          </div>

          {/* Network & Share Section - Positioned directly under Email */}
          <div className="flex items-center justify-center gap-4 pt-4 w-full">
            {/* Personal Website Button */}
            <button className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-[var(--primary-500)] hover:text-white transition-all duration-300 group relative">
              <Globe className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Website</span>
            </button>

            {/* Copy Link Button */}
            <button 
              onClick={handleCopyLink}
              className={`p-3 rounded-full transition-all duration-300 group relative ${copied ? 'bg-[var(--primary-500)] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[var(--primary-500)] hover:text-white'}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {copied ? 'Copied!' : 'Copy Profile Link'}
              </span>
            </button>

            {/* Social Share Button */}
            <button 
              onClick={handleShare}
              className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-[var(--primary-500)] hover:text-white transition-all duration-300 group relative"
            >
              <Share2 className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Office Hours / Call Scheduling CTA */}
      {/* Add it if back end handle it */}
      {/* <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 text-center">
          <h3 className="text-xl font-semibold mb-2">Office Hours</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed font-normal">Personalized 1-on-1 mentorship sessions for career growth.</p>
          <button className="w-full bg-[var(--primary-500)] py-4 rounded-2xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all active:scale-[0.98]">Schedule Call</button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/10 blur-3xl rounded-full" />
      </div> */}
    </aside>
  );
};

export default ContactSidebar;