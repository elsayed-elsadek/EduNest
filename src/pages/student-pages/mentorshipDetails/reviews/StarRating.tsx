import { Star } from 'lucide-react';

const STAR_SIZES: Record<number, string> = {
  4: 'w-4 h-4',
  5: 'w-5 h-5',
  8: 'w-8 h-8',
};

export const StarRating = ({
  rating,
  size = 5,
}: {
  rating: number;
  size?: number;
}) => {
  const sizeClass = STAR_SIZES[size] || 'w-5 h-5';

  return (
    <div className="flex items-center gap-1 text-[var(--primary-500)]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${sizeClass} ${
            index < Math.round(rating)
              ? 'fill-[var(--primary-500)] text-[var(--primary-500)]'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  );
};
