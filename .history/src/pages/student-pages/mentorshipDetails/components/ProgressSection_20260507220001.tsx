import type { FC } from 'react';
import type { ProgressData } from '../../../../types/student-role-types/studentMentorshipTypes';

interface ProgressSectionProps {
  progress?: ProgressData;
  className?: string;
}

const ProgressSection: FC<ProgressSectionProps> = ({
  progress,
  className = '',
}) => {
  if (!progress) return null;

  const progressCards = [
    {
      title: 'Tasks',
      completed: progress.completedTasks,
      total: progress.totalTasks,
    },
    {
      title: 'Quizzes',
      completed: progress.completedQuizzes,
      total: progress.totalQuizzes,
    },
    {
      title: 'Projects',
      completed: progress.completedProjects,
      total: progress.totalProjects,
    },
  ];

  return (
    <section
      className={`
        relative overflow-hidden rounded-3xl border border-slate-200/70 
        bg-white p-6 md:p-8 shadow-sm
        ${className}
      `}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Your Progress
          </h2>
          
          <p className="mt-1 text-sm text-slate-500">
            Track your mentorship journey and completed activities
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-2xl bg-[var(--primary-500)]/10 px-4 py-2">
        

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Completion
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Overall Progress
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Progress Status
          </span>

          <span className="text-sm font-semibold text-[var(--primary-500)]">
            {progress.progressPercentage}% Completed
          </span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="
              h-full rounded-full 
              bg-[var(--primary-500)] 
              transition-all duration-500 ease-out
              relative
            "
            style={{ width: `${progress.progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {progressCards.map((item) => {
          const percentage =
            item.total > 0
              ? Math.round((item.completed / item.total) * 100)
              : 0;

          return (
            <div
              key={item.title}
              className="
                group rounded-2xl border border-slate-200
                bg-gradient-to-br from-white to-slate-50
                p-6 transition-all duration-300
                hover:-translate-y-1 hover:shadow-md
              "
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.completed}
                    <span className="ml-1 text-lg font-medium text-slate-400">
                      / {item.total}
                    </span>
                  </h3>
                </div>

                <div
                  className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-[var(--primary-500)]/10
                    text-sm font-bold text-[var(--primary-500)]
                  "
                >
                  {percentage}%
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--primary-500)] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProgressSection;