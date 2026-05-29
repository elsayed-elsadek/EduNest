import React from 'react';
import { HelpCircle, Folder, Clipboard, PlayCircle, CalendarDays, FileText } from 'lucide-react';

interface Props {
  type?: string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const mapType = (type?: string | null) => {
  const t = (type || '').toUpperCase();
  if (t.includes('QUIZ')) return { icon: HelpCircle, label: 'Quiz', bg: 'bg-amber-50', text: 'text-amber-700' };
  if (t.includes('PROJECT')) return { icon: Folder, label: 'Project', bg: 'bg-indigo-50', text: 'text-indigo-700' };
  if (t.includes('TASK') || t.includes('ASSIGNMENT')) return { icon: Clipboard, label: 'Task', bg: 'bg-emerald-50', text: 'text-emerald-700' };
  if (t.includes('LECTURE') || t.includes('VIDEO')) return { icon: PlayCircle, label: 'Lecture', bg: 'bg-sky-50', text: 'text-sky-700' };
  if (t.includes('SESSION') || t.includes('LIVE')) return { icon: CalendarDays, label: 'Session', bg: 'bg-slate-100', text: 'text-slate-600' };
  return { icon: FileText, label: 'Content', bg: 'bg-slate-100', text: 'text-slate-600' };
};

const ContentTypeBadge: React.FC<Props> = ({ type, size = 'sm', showLabel = false }) => {
  const info = mapType(type);
  const Icon = info.icon;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-semibold ${pad} ${info.bg} ${info.text}`}>
      <Icon className={`w-4 h-4 ${info.text}`} />
      {showLabel && <span className="truncate">{info.label}</span>}
    </span>
  );
};

export default ContentTypeBadge;
