import type { FC } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface LearnListProps {
  items?: string[];
  isLoading?: boolean;
}

const LearnList: FC<LearnListProps> = ({ items = [], isLoading = false }) => {
  const hasItems = items.length > 0;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gray-500">What you’ll learn</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Skills and outcomes</h2>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 a">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 animate-pulse">
                <div className="h-5 w-10 rounded-2xl bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ))
          : hasItems
          ? items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-500)] text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm leading-6 inline-flex text-slate-700">{item}</p>
              </div>
            ))
          : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-slate-500">
              No learning outcomes available for this mentorship yet.
            </div>
          )}
      </div>
    </section>
  );
};

export default LearnList;
