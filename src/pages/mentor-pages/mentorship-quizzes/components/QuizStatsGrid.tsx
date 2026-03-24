import type { FC } from 'react';
import { CheckCircle } from 'lucide-react';
import type { QuizOverviewResponse } from '../../../../services/mentorshipsContent/quiz';
import type { Submission } from '../../../../services/mentorshipsContent/quiz';

interface QuizStatsGridProps {
  stats: QuizOverviewResponse['quizStatistics'];
  submissions: Submission[];
  loading?: boolean;
}

const QuizStatsGrid: FC<QuizStatsGridProps> = ({ stats, submissions, loading = false }) => {
  // Accurate pass rate: exclude Not Submitted
  const passes = submissions.filter(s => s.status === 'Passed').length;
  const totalCompleted = submissions.filter(s => s.status !== 'Not Submitted').length;
  const passRate = totalCompleted > 0 ? Math.round((passes / totalCompleted) * 100) : 0;

  const statsData = [
    {
      label: 'Total Students',
      value: stats?.totalStudents?.toString() || '0',
      loading,
    },
    {
      label: 'Submissions',
      value: stats?.totalSubmissions?.toString() || '0',
      loading,
    },
    {
      label: 'Avg Score',
      value: `${stats?.averageScore || 0}/${stats?.totalPoints || 10}`,
      loading,
    },
    {
      label: 'Pass Rate',
      value: `${passRate}%`,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-gray-100">
      {statsData.map(({ label, value, icon, loading }, index) => (
        <div key={label} className={`space-y-1 ${index > 0 ? 'lg:pl-6 lg:border-l lg:border-gray-100' : ''}`}>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className="flex items-baseline gap-2">
                {icon}
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</h3>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizStatsGrid;
