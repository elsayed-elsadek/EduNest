import type { FC } from 'react';
import type { ProgressData } from '../../../../types/student-role-types/studentMentorshipTypes';

interface ProgressSectionProps {
  progress?: ProgressData;
  className?: string;
}

const ProgressSection: FC<ProgressSectionProps> = ({ progress, className = '' }) => {
  if (!progress) return null;

  return (
    <section className={`bg-white rounded-2xl shadow-sm p-8 ${className}`}>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Progress</h2>

      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Progress</span>
          <span className="text-lg font-bold text-[var(--primary-500)]">
            {progress.progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[var(--primary-500)] h-full rounded-full transition-all duration-300"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider font-medium">Tasks</p>
          <p className="text-3xl font-bold text-blue-600">
            {progress.completedTasks}/{progress.totalTasks}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider font-medium">Quizzes</p>
          <p className="text-3xl font-bold text-emerald-600">
            {progress.completedQuizzes}/{progress.totalQuizzes}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider font-medium">Projects</p>
          <p className="text-3xl font-bold text-purple-600">
            {progress.completedProjects}/{progress.totalProjects}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProgressSection;
