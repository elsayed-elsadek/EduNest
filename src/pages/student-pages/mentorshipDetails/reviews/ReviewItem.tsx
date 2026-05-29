import { useState } from 'react';
import { User } from 'lucide-react';
import { API_BASE_URL } from '../../../../services/api';
import { StarRating } from './StarRating';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReviewItem = ({ review }: { review: any }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 transition hover:shadow-lg hover:border-[var(--primary-500)]/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
            {review.studentProfileImageUrl && !imgError ? (
              <img
                src={API_BASE_URL + review.studentProfileImageUrl}
                alt={review.studentFullName}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                <User className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="text-left">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {review.studentFullName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {review.studentEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size={4} />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {review.rating}/5
          </span>
        </div>
      </div>

      <p className="mt-4 text-left text-slate-700 dark:text-slate-300 leading-relaxed">
        "{review.feedback}"
      </p>
    </article>
  );
};
