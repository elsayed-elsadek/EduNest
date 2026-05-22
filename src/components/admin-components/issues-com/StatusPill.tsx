import { type FC, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MessageStatus } from '../../../types/admin-role-types/issues.types';

interface StatusPillProps {
  status   : MessageStatus;
  onChange ?: (s: MessageStatus) => void;
  size     ?: 'sm' | 'md';
}

const CONFIG: Record<MessageStatus, { label: string; pill: string; option: string }> = {
  review    : { label: 'Under Review', pill: 'bg-[#fff4e5] text-[#b45309]',  option: 'hover:bg-[#fff4e5] text-[#b45309]'  },
  pending   : { label: 'Pending',      pill: 'bg-[#e8f3fa] text-[#0f5e8b]',  option: 'hover:bg-[#e8f3fa] text-[#0f5e8b]'  },
  completed : { label: 'Completed',    pill: 'bg-[#ecfdf5] text-[#16a34a]',  option: 'hover:bg-[#ecfdf5] text-[#16a34a]'  },
};

const ALL_STATUSES: MessageStatus[] = ['pending', 'review', 'completed'];

const StatusPill: FC<StatusPillProps> = ({ status, onChange, size = 'sm' }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const cfg             = CONFIG[status];
  const interactive     = !!onChange;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pill = (
    <span
      className={`inline-flex items-center gap-1 font-semibold tracking-wide rounded
                  ${size === 'md' ? 'text-[12px] px-2.5 py-1' : 'text-[11px] px-2 py-0.5'}
                  ${cfg.pill}
                  ${interactive ? 'cursor-pointer select-none' : ''}`}
      onClick={() => interactive && setOpen(p => !p)}
    >
      {cfg.label.toUpperCase()}
      {interactive && <ChevronDown size={11} className="shrink-0" />}
    </span>
  );

  if (!interactive) return pill;

  return (
    <div className="relative inline-block" ref={ref}>
      {pill}

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-100
                        rounded-xl shadow-xl overflow-hidden min-w-[150px]">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => {
                if (s !== status) onChange(s); // ✅ skip if same status
                setOpen(false);
              }}
              disabled={s === status}
              className={`w-full text-left px-3 py-2.5 text-[12px] font-semibold transition-colors
                          ${s === status
                            ? 'opacity-40 cursor-not-allowed bg-gray-50'
                            : CONFIG[s].option  // ✅ each option uses its OWN color
                          }`}
            >
              {CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusPill;