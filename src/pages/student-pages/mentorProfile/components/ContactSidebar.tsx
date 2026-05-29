
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Mail, Globe, Share2, Copy, Check, Github, ExternalLink } from 'lucide-react';
import type { MentorProfile, SocialMediaLink } from '../../../../services/student-roleService/mentorProfile.api';

interface ContactSidebarProps {
  mentorProfile: MentorProfile | null;
}

// ✅ Helper: return icon + label per platform
const getSocialMeta = (media: string): { label: string; icon: ReactNode; color: string } => {
  switch (media.toUpperCase()) {
    case 'GITHUB':
      return {
        label: 'GitHub',
        color: 'hover:bg-[#24292e] hover:text-white',
        icon: <Github className="w-5 h-5" />,
      };
    case 'LINKEDIN':
      return {
        label: 'LinkedIn',
        color: 'hover:bg-[#0A66C2] hover:text-white',
        icon: (
          // LinkedIn SVG (not in lucide-react)
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.666H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        ),
      };
    case 'TWITTER':
      return {
        label: 'Twitter / X',
        color: 'hover:bg-black hover:text-white',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      };
    case 'YOUTUBE':
      return {
        label: 'YouTube',
        color: 'hover:bg-[#FF0000] hover:text-white',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      };
    default:
      return {
        label: media,
        color: 'hover:bg-slate-700 hover:text-white',
        icon: <ExternalLink className="w-5 h-5" />,
      };
  }
};

const ContactSidebar = ({ mentorProfile }: ContactSidebarProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

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
      handleCopyLink();
    }
  };

  const socialLinks: SocialMediaLink[] = mentorProfile?.socialMediaLinks ?? [];

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
              <p className="text-sm font-semibold text-slate-900 break-all">
                {mentorProfile?.mentorEmail || 'Not available'}
              </p>
            </div>
          </div>

          {/* Share & Copy buttons */}
          <div className="flex items-center justify-center gap-4 w-full">
            <button className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-[var(--primary-500)] hover:text-white transition-all duration-300 group relative">
              <Globe className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Website</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`p-3 rounded-full transition-all duration-300 group relative ${copied ? 'bg-[var(--primary-500)] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[var(--primary-500)] hover:text-white'}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {copied ? 'Copied!' : 'Copy Profile Link'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-[var(--primary-500)] hover:text-white transition-all duration-300 group relative"
            >
              <Share2 className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Share Profile</span>
            </button>
          </div>

          {/* ✅ NEW: Social Media Links Section */}
          {socialLinks.length > 0 && (
            <div className="w-full pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                Social Media
              </p>
              <div className="flex flex-col gap-3">
                {socialLinks.map((social) => {
                  const meta = getSocialMeta(social.media);
                  return (
                    <a
                      key={social.media}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl text-slate-600 font-medium text-sm transition-all duration-300 ${meta.color} group`}
                    >
                      <span className="shrink-0">{meta.icon}</span>
                      <span className="flex-1 text-left">{meta.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ContactSidebar;