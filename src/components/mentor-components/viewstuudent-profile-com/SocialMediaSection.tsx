
import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import type { FC } from 'react';
import type { SocialMedia } from '../../../types/viewStudent.types';
import type { JSX } from 'react/jsx-runtime';

interface SocialMediaSectionProps {
  socialMedia: SocialMedia[];
}

const ALLOWED: SocialMedia['platform'][] = ['LinkedIn', 'GitHub'];

const PLATFORM_CONFIG: Record<string, {
  icon: JSX.Element;
  bg: string;
  color: string;
  label: string;
}> = {
  LinkedIn: {
    bg: '#0A66C2',
    color: '#fff',
    label: 'LinkedIn',
    icon: <Linkedin className="w-4 h-4" />,
  },
  GitHub: {
    bg: '#24292F',
    color: '#fff',
    label: 'GitHub',
    icon: <Github className="w-4 h-4" />,
  },
};

const SocialMediaSection: FC<SocialMediaSectionProps> = ({ socialMedia }) => {
  const filtered = socialMedia.filter(s => ALLOWED.includes(s.platform));

  return (
    <div className="px-6 py-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Social</h3>
      <div className="flex flex-col gap-2.5">
        {filtered.map((social) => {
          const cfg = PLATFORM_CONFIG[social.platform];
          const hasUrl = !!social.url;

          const inner = (
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              hasUrl
                ? 'border-gray-100 hover:border-gray-200 hover:shadow-sm cursor-pointer'
                : 'border-dashed border-gray-200 opacity-60 cursor-default'
            }`}>
              {/* Icon bubble */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: hasUrl ? cfg.bg : '#f3f4f6', color: hasUrl ? cfg.color : '#9ca3af' }}
              >
                {cfg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500">{cfg.label}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {hasUrl ? social.url : 'Not provided'}
                </p>
              </div>

              {/* Arrow if linked */}
              {hasUrl && (
                <ArrowUpRight size={14} className="text-gray-400 flex-shrink-0" />
              )}
            </div>
          );

          return hasUrl ? (
            <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
              {inner}
            </a>
          ) : (
            <div key={social.platform}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaSection;

