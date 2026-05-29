import { useState } from 'react';
import { PenLine, Send, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRateMentorship } from '../../../../services/student-roleService/mentorshipReviews.api';
import { getResponseMessage } from '../../../../services/student-roleService/apiResponseHelpers';
import { StarPicker } from './StarPicker';

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export const WriteReviewModal = ({
  mentorshipId,
  onClose,
}: {
  mentorshipId: number;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { mutate, isPending, isError, error } = useRateMentorship();

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating before submitting your review.');
      return;
    }

    mutate(
      { mentorshipId, payload: { rating, feedback } },
      {
        onSuccess: (data) => {
          const message = getResponseMessage(data, 'Review submitted successfully!');
          toast.success(message);
          setTimeout(() => onClose(), 1500);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : 'Unable to submit your review. Please try again.';
          toast.error(message);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
            <PenLine className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Write a Review</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already reviewed? Submitting will update your review automatically.
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-100 dark:bg-slate-800" />

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Your rating
          </p>

          <StarPicker value={rating} onChange={setRating} />

          {rating > 0 && <p className="text-sm text-slate-500 dark:text-slate-400">{ratingLabels[rating]}</p>}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Your feedback
          </p>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Share your experience with this mentorship..."
            className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
          />
        </div>

        {isError && (
          <p className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary-500)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
