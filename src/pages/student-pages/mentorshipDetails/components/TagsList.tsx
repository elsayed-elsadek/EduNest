import type { FC } from 'react';

interface TagsListProps {
  tags?: string[];
  isLoading?: boolean;
}

const TagsList: FC<TagsListProps> = ({ tags = [], isLoading = false }) => {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Tags</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Topic highlights</h2>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-10 min-w-[90px] rounded-full bg-gray-200 px-4 py-2 animate-pulse" />
            ))
          : tags.length > 0
          ? tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {tag}
              </span>
            ))
          : (
            <p className="text-sm text-slate-500">No tags have been added for this mentorship.</p>
          )}
      </div>
    </section>
  );
};

export default TagsList;
