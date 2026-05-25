import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import type { PaginatedUpcomingItems } from '../../../../types/student-role-types/studentMentorshipTypes';

interface UpcomingItemsSectionProps {
  upcomingItems?: PaginatedUpcomingItems;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const UpcomingItemsSection: FC<UpcomingItemsSectionProps> = ({
  upcomingItems,
  currentPage,
  onPageChange,
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
            <CalendarDays className="h-10 w-10 text-[var(--primary-500)]" />
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
      <div
        className={`space-y-4 ${
          validItems.length > 3
            ? 'max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-1 -m-1'
            : ''
        }`}
      >
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
        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing {currentPage * upcomingItems.size + 1} -{' '}
            {Math.min(
              (currentPage + 1) * upcomingItems.size,
              upcomingItems.totalElements
            )}{' '}
            of {upcomingItems.totalElements} items
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Previous
            </button>

            {Array.from({ length: upcomingItems.totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onPageChange(index)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  currentPage === index
                    ? 'bg-[var(--primary-500)] text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === upcomingItems.totalPages - 1}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default UpcomingItemsSection;