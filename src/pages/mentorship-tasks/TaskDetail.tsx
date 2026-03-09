import type { FC } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    ClipboardList, CheckCircle, Clock, XCircle,
    Search, Filter, Star, X, Send, Award,
    FileText, Paperclip,
} from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import type {
    TaskResponseContent,
    TaskSubmission,
    TaskSubmissionPageResponse,
} from '../../services/mentorshipsContent/task';
import {
    getTaskById,
    getTaskSubmissions,
    gradeTaskSubmission,
} from '../../services/mentorshipsContent/task';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

/* ════════════════════════════════════════════════
   Grading Modal
   ════════════════════════════════════════════════ */
interface GradeModalProps {
    submission: TaskSubmission;
    maxPoints: number;
    onClose: () => void;
    onGraded: () => void;
}

const GradeModal: FC<GradeModalProps> = ({ submission, maxPoints, onClose, onGraded }) => {
    const [score, setScore] = useState<string>(submission.score !== null ? String(submission.score) : '');
    const [feedback, setFeedback] = useState<string>(submission.feedback || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const parsedScore = Number(score);
        if (isNaN(parsedScore) || parsedScore < 0) {
            toast.error('Please enter a valid score');
            return;
        }
        if (parsedScore > maxPoints) {
            toast.error(`Score cannot exceed ${maxPoints}`);
            return;
        }
        try {
            setSubmitting(true);
            await gradeTaskSubmission(submission.id, {
                score: parsedScore,
                feedback: feedback.trim(),
            });
            toast.success('Graded successfully! ✨');
            onGraded();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to grade submission');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Award size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Grade Submission</h3>
                            <p className="text-sm text-blue-100">{submission.studentName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X size={18} className="text-white" />
                    </button>
                </div>

                {/* Student submission details */}
                {(submission.content || submission.fileUrl) && (
                    <div className="px-6 pt-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Student Submission</p>
                        {submission.content && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-3">
                                {submission.content}
                            </div>
                        )}
                        {submission.fileUrl && (
                            <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                                <Paperclip size={14} />
                                View Attachment
                            </a>
                        )}
                    </div>
                )}

                {/* Form */}
                <div className="px-6 py-5 space-y-5">
                    {/* Score */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Score
                            <span className="text-gray-400 font-normal ml-1">(max {maxPoints})</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                max={maxPoints}
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder={`0 – ${maxPoints}`}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-800 font-semibold transition-all"
                            />
                            <Star size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400" />
                        </div>
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                        <textarea
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Write constructive feedback for the student..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-700 resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 shadow-sm hover:shadow transition-all"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Send size={16} />
                        )}
                        {submitting ? 'Submitting...' : 'Submit Grade'}
                    </button>
                </div>
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

/* ════════════════════════════════════════════════
   Task Detail Page
   ════════════════════════════════════════════════ */
const TaskDetail: FC = () => {
    const { taskId } = useParams<{ id: string; taskId: string }>();
    const token = useAuthStore((s) => s.token);

    const [task, setTask] = useState<TaskResponseContent | null>(null);
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [submissionsPage, setSubmissionsPage] = useState<TaskSubmissionPageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Grading modal
    const [gradingSubmission, setGradingSubmission] = useState<TaskSubmission | null>(null);

    const [page, setPage] = useState(0);
    const size = 10;

    const loadData = useCallback(async () => {
        if (!token || !taskId) return;
        try {
            setLoading(true);
            setError(null);

            const [taskData, subsData] = await Promise.all([
                getTaskById(Number(taskId)),
                getTaskSubmissions(Number(taskId), page, size),
            ]);

            setTask(taskData);

            // Handle different possible response shapes
            if (Array.isArray(subsData)) {
                setSubmissions(subsData as TaskSubmission[]);
                setSubmissionsPage(null);
            } else if (subsData && 'content' in subsData) {
                setSubmissions(subsData.content || []);
                setSubmissionsPage(subsData);
            } else {
                setSubmissions([]);
                setSubmissionsPage(null);
            }
        } catch (err: any) {
            const message = err?.message || 'Failed to load task details';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [token, taskId, page]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGraded = () => {
        setGradingSubmission(null);
        loadData(); // Refresh data
    };

    // Computed stats
    const gradedSubs = submissions.filter((s) => s.status === 'GRADED');
    const avgScore = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubs.length)
        : 0;
    const maxPoints = task?.points || 100;

    /* ───── Loading ───── */
    if (loading && !task) {
        return (
            <DashLayout pageTitle="Task Detail">
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-600"></div>
                        <ClipboardList size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                    </div>
                </div>
            </DashLayout>
        );
    }

    /* ───── Error ───── */
    if (error && !task) {
        return (
            <DashLayout pageTitle="Task Detail">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <ClipboardList size={28} />
                        <div>
                            <p className="font-semibold text-lg">Oops!</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </DashLayout>
        );
    }

    return (
        <DashLayout pageTitle={`My Mentorships / Tasks / ${task?.title || 'Task'}`}>
            <div className="px-6 py-6 max-w-7xl mx-auto space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-120px)]">

                {/* ═══ Header Section ═══ */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6">
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-3 ${task?.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {task?.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {task?.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{task?.title || 'Untitled Task'}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium flex-wrap">
                            <span className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <ClipboardList size={16} />
                                Assignment
                            </span>
                            {task?.points !== undefined && (
                                <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                                    <Star size={16} />
                                    {task.points} Points
                                </span>
                            )}
                            {task?.dueAt && (
                                <span className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
                                    <Clock size={16} />
                                    Due: {new Date(task.dueAt).toLocaleDateString()}
                                </span>
                            )}
                            {task?.estimatedMinutes !== undefined && task.estimatedMinutes > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} />
                                    ~{task.estimatedMinutes} min
                                </span>
                            )}
                        </div>
                        {task?.description && (
                            <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-2xl">{task.description}</p>
                        )}
                    </div>
                    {task?.attachmentUrl && (
                        <a
                            href={task.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                            <Paperclip size={16} />
                            Task Attachment
                        </a>
                    )}
                </div>

                {/* ═══ Stats Row ═══ */}
                <div className="flex flex-wrap gap-12 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Submissions</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {submissionsPage?.totalElements ?? submissions.length}
                        </h3>
                    </div>
                    <div className="pl-12 border-l border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-1">Graded</p>
                        <h3 className="text-2xl font-bold text-gray-900">{gradedSubs.length}</h3>
                    </div>
                    <div className="pl-12 border-l border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
                        <h3 className="text-2xl font-bold text-gray-900">{avgScore}/{maxPoints}</h3>
                    </div>
                    <div className="pl-12 border-l border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-1">Pass Points</p>
                        <h3 className="text-2xl font-bold text-gray-900">{task?.passPoints || 0}/{maxPoints}</h3>
                    </div>
                </div>

                {/* ═══ Search+Filter ═══ */}
                <div className="flex items-center justify-between pt-4">
                    <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-3 w-72">
                        <Search className="text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="flex-1 outline-none border-none text-gray-700 bg-transparent text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Filter
                        <Filter size={16} />
                    </button>
                </div>

                {/* ═══ Submissions Table ═══ */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium rounded-tl-xl rounded-bl-xl">STUDENT</th>
                                <th className="px-6 py-4 font-medium">SCORE</th>
                                <th className="px-6 py-4 font-medium">STATUS</th>
                                <th className="px-6 py-4 font-medium">SUBMITTED</th>
                                <th className="px-6 py-4 font-medium text-right rounded-tr-xl rounded-br-xl">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <FileText size={28} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-medium">No submissions yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub: TaskSubmission, index: number) => (
                                    <tr key={sub.id || index} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentName)}&background=random&bold=true`}
                                                        alt={sub.studentName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="font-semibold text-gray-900">{sub.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'NOT_SUBMITTED' ? (
                                                <span className="text-gray-400 font-bold">—</span>
                                            ) : sub.status === 'GRADED' && sub.score !== null ? (
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-bold text-white ${(sub.score >= (task?.passPoints || 0))
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                                                    }`}>
                                                    {sub.score}/{maxPoints}
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 font-semibold text-sm">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'GRADED' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                                                    <CheckCircle size={14} /> Graded
                                                </span>
                                            )}
                                            {sub.status === 'SUBMITTED' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
                                                    <Clock size={14} /> Submitted
                                                </span>
                                            )}
                                            {sub.status === 'NOT_SUBMITTED' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                                                    <XCircle size={14} /> Not Submitted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {sub.submittedAt
                                                ? new Date(sub.submittedAt).toLocaleDateString()
                                                : '—'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setGradingSubmission(sub)}
                                                disabled={sub.status === 'NOT_SUBMITTED'}
                                                className={`px-4 py-1.5 font-medium text-sm border rounded-lg transition-all ${sub.status === 'NOT_SUBMITTED'
                                                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                    : sub.status === 'GRADED'
                                                        ? 'text-green-600 border-green-200 hover:bg-green-50'
                                                        : 'text-blue-600 border-blue-200 hover:bg-blue-50 hover:shadow-sm'
                                                    }`}
                                            >
                                                {sub.status === 'GRADED' ? 'Re-Grade' : 'Grade'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ═══ Pagination ═══ */}
                {submissionsPage && submissionsPage.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page {page + 1} of {submissionsPage.totalPages}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            {Array.from({ length: submissionsPage.totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${page === i
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((prev) => Math.min(submissionsPage.totalPages - 1, prev + 1))}
                                disabled={page + 1 >= submissionsPage.totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Grade Modal ═══ */}
            {gradingSubmission && (
                <GradeModal
                    submission={gradingSubmission}
                    maxPoints={maxPoints}
                    onClose={() => setGradingSubmission(null)}
                    onGraded={handleGraded}
                />
            )}
        </DashLayout>
    );
};

export default TaskDetail;
