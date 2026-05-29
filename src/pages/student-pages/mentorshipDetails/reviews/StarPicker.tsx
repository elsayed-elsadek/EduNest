import { Star } from 'lucide-react';
import { useState } from 'react';

const STAR_SIZES: Record<number, string> = {
  4: 'w-4 h-4',
  5: 'w-5 h-5',
  8: 'w-8 h-8',
};

export const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = (hovered || value) > i;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
          >
            <Star
              className={`${STAR_SIZES[8]} transition-colors ${
                filled
                  ? 'fill-[var(--primary-500)] text-[var(--primary-500)]'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
