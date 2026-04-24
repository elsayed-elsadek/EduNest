import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, BarChart2, Search, Filter, MoreVertical, Eye, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import type { QuizOverviewContent, QuizOverviewDtoPageResponse, QuizDashboardDTO } from '../../../services/mentorshipsContent/quiz';
import { getMentorshipQuizzesOverview, filterQuizzes, deleteQuiz } from '../../../services/mentorshipsContent/quiz';
import EditQuizModal from './components/EditQuizModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

const MentorshipQuizzes: FC = () => {
    const { id: mentorshipId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);

    const [stats, setStats] = useState<QuizDashboardDTO | null>(null);
    const [quizPage, setQuizPage] = useState<QuizOverviewDtoPageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination
    const [page, setPage] = useState(0); // 0-indexed API
    const size = 6;

    // Actions state
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [editQuizId, setEditQuizId] = useState<number | null>(null);
    const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);
    const [quizToDeleteTitle, setQuizToDeleteTitle] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openDropdownId !== null && !(e.target as Element).closest('.action-dropdown-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    useEffect(() => {
        if (!token || !mentorshipId) return;

        let active = true;

        const loadQuizzes = async () => {
            try {
                setLoading(true);
                setError(null);

                if (searchQuery || statusFilter) {
                    const responseData = await filterQuizzes(Number(mentorshipId), searchQuery, statusFilter, page, size);
                    if (active) setQuizPage(responseData);

                    if (!stats) {
                        const overviewData = await getMentorshipQuizzesOverview(Number(mentorshipId), 0, 1);
                        if (active) setStats(overviewData.quizDashboardDTO);
                    }
                } else {
                    const responseData = await getMentorshipQuizzesOverview(Number(mentorshipId), page, size);
                    if (active) {
                        setStats(responseData.quizDashboardDTO);
                        setQuizPage(responseData.quizOverviewDtoPageResponse);
                    }
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (!active) return;
                const message = err?.message || 'Failed to load quizzes';
                setError(message);
                toast.error(message);
            } finally {
                if (active) setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            loadQuizzes();
        }, 300); // Debounce search

        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [mentorshipId, token, page, searchQuery, statusFilter, refreshTrigger]);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleEditQuiz = (quiz: QuizOverviewContent) => {
        setEditQuizId(quiz.id);
        setOpenDropdownId(null);
    };

    const handleDeleteClick = (quiz: QuizOverviewContent) => {
        setDeleteQuizId(quiz.id);
        setQuizToDeleteTitle(quiz.title);
        setOpenDropdownId(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteQuizId) return;
        try {
            setIsDeleting(true);
            await deleteQuiz(deleteQuizId);
            toast.success('Quiz deleted successfully');
            setDeleteQuizId(null);
            triggerRefresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete quiz');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNextPage = () => {
        if (quizPage && page + 1 < quizPage.totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    if (loading && !quizPage) {
        return (
            <DashLayout pageTitle="Quizzes">
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashLayout>
        );
    }

    if (error && !quizPage) {
        return (
            <DashLayout pageTitle="Quizzes">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                        <FileText size={24} />
                        <p>{error || 'Failed to find quizzes'}</p>
                    </div>
                </div>
            </DashLayout>
        );
    }

    const quizzes = quizPage?.content || [];

    return (
        <DashLayout pageTitle="Quizzes">
            <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-baseline gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={() => navigate(`/mentor/mentorships/${mentorshipId}`)}>
                            <ArrowLeft size={20} />
                            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Manage and review all quizzes</p>
                    </div>
                </div>

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Quizzes</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalQuizzes || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Published</p>
                            <h3 className="text-2xl font-bold text-gray-900">{(stats?.publishedCount || 0).toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
                            <h3 className="text-2xl font-bold text-gray-900">{(stats?.draftCount || 0).toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
                            <h3 className="text-2xl font-bold text-gray-900"> {Number(stats?.averageScore || 0).toFixed(2)} %</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <BarChart2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <Search className="text-blue-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search quiz..."
                        className="flex-1 outline-none border-none text-gray-700 bg-transparent"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    />
                </div>

                {/* Quizzes Table Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">All Quizzes</h2>
                            <p className="text-sm text-gray-500 font-medium">Total {quizPage?.totalElements || 0}</p>
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                className="appearance-none outline-none flex items-center gap-2 px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <option value="">Fillter Status</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                            </select>
                            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">QUIZ TITLE</th>
                                    <th className="px-6 py-4 font-medium text-center">STATUS</th>
                                    <th className="px-6 py-4 font-medium text-center">SUBMISSIONS</th>
                                    <th className="px-6 py-4 font-medium text-center">AVG SCORE</th>
                                    <th className="px-6 py-4 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quizzes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No quizzes found.
                                        </td>
                                    </tr>
                                ) : (
                                    quizzes.map((quiz: QuizOverviewContent) => (
                                        <tr key={quiz.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <FileText size={18} />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{quiz.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${quiz.status === 'PUBLISHED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {quiz.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                    {quiz.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-medium ${quiz.submissions !== 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {quiz.submissions || '0'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {quiz.averageScore ? (
                                                    <span className="font-bold text-green-500">{quiz.averageScore} %</span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/mentor/mentorships/${mentorshipId}/quizzes/${quiz.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1 text-[#0f5e8b] font-medium text-sm border rounded-lg hover:bg-blue-50 transition-colors"
                                                    >

                                                        <Eye size={16} />
                                                        Details
                                                    </button>
                                                    <div className="relative action-dropdown-container">
                                                        <button
                                                            onClick={() => setOpenDropdownId(openDropdownId === quiz.id ? null : quiz.id)}
                                                            className="p-1.5 text-blue-400 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {openDropdownId === quiz.id && (
                                                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
                                                                <button
                                                                    onClick={() => handleEditQuiz(quiz)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Edit2 size={16} className="text-gray-400" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(quiz)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Trash2 size={16} className="text-red-400" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {quizPage && quizPage.totalPages > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>Showing</span>
                                <select className="border border-gray-200 text-gray-700 rounded-lg px-2 py-1 text-sm outline-none bg-gray-50">
                                    <option>{quizPage.size}</option>
                                </select>
                                <span>items in one page</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: quizPage.totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${page === i
                                            ? ' text-gray-500 bg-gray-100'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={page + 1 >= quizPage.totalPages}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EditQuizModal
                isOpen={!!editQuizId}
                onClose={() => setEditQuizId(null)}
                quizId={editQuizId}
                onSuccess={triggerRefresh}
            />

            <ConfirmDeleteModal
                isOpen={!!deleteQuizId}
                onClose={() => setDeleteQuizId(null)}
                onConfirm={handleConfirmDelete}
                title={quizToDeleteTitle}
                loading={isDeleting}
            />
        </DashLayout>
    );
};

export default MentorshipQuizzes;
