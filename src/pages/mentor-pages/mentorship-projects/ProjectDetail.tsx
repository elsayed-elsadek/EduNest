import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import toast from 'react-hot-toast';
import { getProjectStatistics, gradeProjectSubmission, type ProjectStatistics, type TaskSubmission } from '../../../services/projectService';
import { Download, CheckCircle, Clock, AlertCircle, Award, ArrowLeft } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id, projectId } = useParams<{ id: string, projectId: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Modal state
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<TaskSubmission | null>(null);
  const [score, setScore] = useState<number | string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const fetchStats = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await getProjectStatistics(projectId, { page, size: 10 });
      setStats(res.projectStatistics);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId, page]);

  const handleBackToProjects = () => {
    navigate(`/mentor/mentorships/${id}/projects`);
  };

  const openGradeModal = (submission: TaskSubmission) => {
    setActiveSubmission(submission);
    setScore(submission.finalScore ?? submission.rawScore ?? '');
    setFeedback(submission.feedback || '');
    setIsGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setActiveSubmission(null);
    setScore('');
    setFeedback('');
  };

  const submitGrade = async () => {
    if (!activeSubmission) return;
    try {
      setIsSubmittingGrade(true);
      await gradeProjectSubmission(activeSubmission.submissionId, {
        score: Number(score),
        feedback
      });
      toast.success('Grade submitted successfully');
      closeGradeModal();
      fetchStats(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit grade');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (loading && !stats) {
    return (
      <DashLayout pageTitle={`Dashboard / Projects / Details`}>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-gray-500">Loading details...</p>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle={`Dashboard / Projects / Details`}>
        <div className="flex h-[50vh] items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      </DashLayout>
    );
  }

  const submissionsPage = stats?.taskSubmissionResponsePageResponse;
  const submissionsList = submissionsPage?.content || [];

  return (
    <DashLayout pageTitle={`Dashboard / Projects / ${stats?.projectTitle || 'Details'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4">
          <div>
            <div className="flex items-center items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={handleBackToProjects}>
              <ArrowLeft size={20} />
              <h1 className="text-2xl font-bold text-gray-900">{stats?.projectTitle || 'Project Details'}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Review student submissions and statistics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.totalSubmissions || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Review</p>
              <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats?.pendingReview || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Points</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.totalPoints || 0} pts</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Deadline</p>
              <h3 className="text-lg font-bold mt-2 text-gray-900">
                {stats?.deadLine ? new Date(stats.deadLine).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Deadline'}
              </h3>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Student Submissions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Submitted At</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">File</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissionsList.length > 0 ? submissionsList.map((sub: TaskSubmission) => (
                  <tr key={sub.submissionId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{sub.studentFullName}</td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className={sub.isLate ? 'text-red-500' : 'text-gray-400'} />
                        <span className={sub.isLate ? 'text-red-600 font-medium' : ''}>
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.status === 'GRADED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <CheckCircle size={12} /> Graded
                        </span>
                      ) : sub.status === 'SUBMITTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          <AlertCircle size={12} /> Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {sub.fileUrl ? (
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <Download size={16} /> View File
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No File</span>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      {sub.status === 'GRADED' ? (
                        <span className="text-green-600">{sub.finalScore || sub.rawScore || 0} / {stats?.totalPoints || 100}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openGradeModal(sub)}
                        className="flex items-center justify-end gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors ml-auto"
                      >
                        <Award size={16} /> Grade
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {submissionsPage && submissionsPage.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 text-sm text-gray-500">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-900 font-medium px-2">{page + 1} of {submissionsPage.totalPages}</span>
              <button 
                disabled={page >= submissionsPage.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grade Modal Overlay */}
      {isGradeModalOpen && activeSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Grade Submission</h3>
              <p className="text-sm text-gray-500 mt-1">Student: <span className="font-medium text-gray-700">{activeSubmission.studentFullName}</span></p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (Out of {stats?.totalPoints || 100})</label>
                <input 
                  type="number" 
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter score"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px]"
                  placeholder="Provide constructive feedback..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={closeGradeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmittingGrade}
              >
                Cancel
              </button>
              <button 
                onClick={submitGrade}
                className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium flex items-center gap-2"
                disabled={isSubmittingGrade || score === ''}
              >
                {isSubmittingGrade ? 'Saving...' : 'Submit Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
};

export default ProjectDetail;
