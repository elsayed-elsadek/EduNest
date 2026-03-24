import type { QuizDashboardDTO } from '../../../../services/mentorshipsContent/quiz';
import { FileText, CheckCircle, Clock, BarChart2 } from 'lucide-react';

interface QuizStatsCardsProps {
  stats: QuizDashboardDTO | null;
}

const QuizStats: React.FC<QuizStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Quizzes</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.totalQuizzes || 0}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FileText size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Published</p>
          <h3 className="text-2xl font-bold text-gray-900">{(stats?.publishedCount || 0).toString().padStart(2, '0')}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
          <CheckCircle size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
          <h3 className="text-2xl font-bold text-gray-900">{(stats?.draftCount || 0).toString().padStart(2, '0')}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
          <Clock size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.averageScore ? `${Math.round(stats.averageScore)}%` : '0%'}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <BarChart2 size={24} />
        </div>
      </div>
    </div>
  );
};

export default QuizStats;
