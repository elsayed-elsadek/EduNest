import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PaginatedUpcomingItems } from '../../../../types/student-role-types/studentMentorshipTypes';

interface UpcomingItemsSectionProps {
  upcomingItems?: PaginatedUpcomingItems;
}

const UpcomingItemsSection: FC<UpcomingItemsSectionProps> = ({
  upcomingItems,
}) => {
  const navigate = useNavigate();
  const { mentorshipId } = useParams<{ mentorshipId: string }>();

  // Filter invalid items
  const validItems =
    upcomingItems?.content?.filter(
      (item) =>
        item &&
        item.id &&
        item.title &&
        item.type &&
        item.dueDate
    ) ?? [];

  const handleItemClick = (item: (typeof validItems)[0]) => {
    if (!mentorshipId) return;

    navigate(`/student/learning/${mentorshipId}`, {
      state: {
        weekId: item.weekId,
        itemId: item.id,
      },
    });
  };

  // Empty State
  if (validItems.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* Icon */}
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--primary-500)]/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[var(--primary-500)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-slate-900">
            No Upcoming Deadlines
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            You're all caught up! There are currently no upcoming tasks,
            quizzes, or projects assigned to you.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Upcoming Deadlines
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Stay on track with your upcoming learning activities
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--primary-500)]/10 px-4 py-2">
          <span className="text-sm font-semibold text-[var(--primary-500)]">
            {validItems.length} Items
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {validItems.map((item) => {
          const dueDate = new Date(item.dueDate);
          const isOverdue = dueDate < new Date();

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={`
                group w-full rounded-2xl border p-5 text-left
                transition-all duration-300 hover:-translate-y-1 hover:shadow-md
                ${
                  isOverdue
                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                    : 'border-slate-200 bg-slate-50 hover:border-[var(--primary-500)]/30 hover:bg-white'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Status Dot */}
                <div
                  className={`
                    mt-2 h-3 w-3 flex-shrink-0 rounded-full
                    ${
                      isOverdue
                        ? 'bg-red-500'
                        : 'bg-[var(--primary-500)]'
                    }
                  `}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="truncate text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.weekTitle}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <div
                      className={`
                        self-start rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider
                        ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[var(--primary-500)]/10 text-[var(--primary-500)]'
                        }
                      `}
                    >
                      {item.type}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <p
                      className={`
                        text-sm font-medium
                        ${
                          isOverdue
                            ? 'text-red-600'
                            : 'text-slate-600'
                        }
                      `}
                    >
                      {isOverdue ? 'Overdue:' : 'Due:'}{' '}
                      {dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>

                    <span className="text-sm font-medium text-[var(--primary-500)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {upcomingItems && upcomingItems.totalPages > 1 && (
        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Showing {validItems.length} of{' '}
            {upcomingItems.totalElements} items
          </p>
        </div>
      )}
    </section>
  );
};

export default UpcomingItemsSection;