
import type { FC } from 'react';
import { BookOpen } from 'lucide-react';
interface NoCoverProps {
  title:     string;
  className?: string;
}
const PALETTE = [
  ['#0c2d48', '#1a4d7a'],
  ['#1e3a5f', '#2d5f8a'],
  ['#2c3e50', '#3498db'],
  ['#1a1a2e', '#16213e'],
  ['#0f3460', '#533483'],
  ['#1b4332', '#2d6a4f'],
  ['#3d0c02', '#6b1c0e'],
  ['#1a0533', '#4a0e8f'],
];

function pickColors(title: string): [string, string] {
  const code = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length] as [string, string];
}

const NoCover: FC<NoCoverProps> = ({ title, className = '' }) => {
  const [from, to] = pickColors(title);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-3 select-none ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-white/80" />
      </div>
      <div className="text-center px-4">
        <p className="text-white font-bold text-lg leading-tight tracking-wide">{initials}</p>
        <p className="text-white/60 text-[10px] font-medium mt-0.5 line-clamp-2 max-w-[120px] mx-auto">
          {title}
        </p>
      </div>
    </div>
  );
};

export default NoCover;