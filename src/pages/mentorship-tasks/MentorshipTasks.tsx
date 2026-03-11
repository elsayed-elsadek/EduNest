import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClipboardList, CheckCircle, Clock, BarChart2,
    Search, Filter, MoreVertical, Eye,
} from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import type {
    TaskDashboardDTO,
    TaskResponsePageResponse,
    TaskResponseContent,
} from '../../services/mentorshipsContent/task';
import { getTaskFullDashboard } from '../../services/mentorshipsContent/task';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const MentorshipTasks: FC = () => {
    const { id: mentorshipId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);

    const [stats, setStats] = useState<TaskDashboardDTO | null>(null);
    const [taskPage, setTaskPage] = useState<TaskResponsePageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const size = 6;

    useEffect(() => {
        if (!token || !mentorshipId) return;
        let active = true;

        const loadTasks = async () => {
            try {
                setLoading(true);
                setError(null);
                const dashboard = await getTaskFullDashboard(
                    Number(mentorshipId),
                    searchQuery || undefined,
                    statusFilter || undefined,
                    page,
                    size,
                );
                if (active) {
                    setStats(dashboard.taskDashboardDTO);
                    setTaskPage(dashboard.taskResponsePageResponse);
                }
            } catch (err: any) {
                if (!active) return;
                const message = err?.message || 'Failed to load tasks';
                setError(message);
                toast.error(message);
            } finally {
                if (active) setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            loadTasks();
        }, 300); // Debounce search

        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [mentorshipId, token, page, searchQuery, statusFilter]);

    const handleNextPage = () => {
        if (taskPage && page + 1 < taskPage.totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    /* ───── Loading state ───── */
    if (loading && !taskPage) {
        return (
            <DashLayout pageTitle="Assignments">
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-600"></div>
                        <ClipboardList size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                    </div>
                </div>
            </DashLayout>
        );
    }

    /* ───── Error state ───── */
    if (error && !taskPage) {
        return (
            <DashLayout pageTitle="Assignments">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <ClipboardList size={28} />
                        <div>
                            <p className="font-semibold text-lg">Oops!</p>
                            <p className="text-sm mt-1">{error || 'Failed to find tasks'}</p>
                        </div>
                    </div>
                </div>
            </DashLayout>
        );
    }

    const tasks = taskPage?.content || [];

    return (
        <DashLayout pageTitle="Assignments">
            <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

                {/* ═══ Header Stats ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Tasks */}
                    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all duration-300">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Tasks</p>
                            <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">
                                {stats?.totalTasks || 0}
                            </h3>
                        </div>
                        <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <ClipboardList size={26} />
                        </div>
                    </div>

                    {/* Published */}
                    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-green-100 transition-all duration-300">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Published</p>
                            <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">
                                {(stats?.publishedCount || 0).toString().padStart(2, '0')}
                            </h3>
                        </div>
                        <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle size={26} />
                        </div>
                    </div>

                    {/* Draft */}
                    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all duration-300">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
                            <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">
                                {(stats?.draftCount || 0).toString().padStart(2, '0')}
                            </h3>
                        </div>
                        <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Clock size={26} />
                        </div>
                    </div>

                    {/* Avg Score */}
                    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-amber-100 transition-all duration-300">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
                            <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">
                                {stats?.averageScore || 0}
                                <span className="text-lg font-semibold text-gray-400 ml-0.5">%</span>
                            </h3>
                        </div>
                        <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <BarChart2 size={26} />
                        </div>
                    </div>
                </div>

                {/* ═══ Search Bar ═══ */}
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:border-blue-200 transition-colors">
                    <Search className="text-blue-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search task..."
                        className="flex-1 outline-none border-none text-gray-700 bg-transparent placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    />
                </div>

                {/* ═══ Tasks Table Container ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">All Tasks</h2>
                            <p className="text-sm text-gray-500 font-medium">
                                Total {taskPage?.totalElements || 0}
                            </p>
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                className="appearance-none outline-none flex items-center gap-2 px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <option value="">Filter Status</option>
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
                                    <th className="px-6 py-4 font-medium">TASK TITLE</th>
                                    <th className="px-6 py-4 font-medium text-center">STATUS</th>
                                    <th className="px-6 py-4 font-medium text-center">POINTS</th>
                                    <th className="px-6 py-4 font-medium text-center">AVG SCORE</th>
                                    <th className="px-6 py-4 font-medium text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                    <ClipboardList size={28} className="text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-medium">No tasks found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task: TaskResponseContent) => (
                                        <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <ClipboardList size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900">{task.title}</span>
                                                        {task.dueAt && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Due: {new Date(task.dueAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${task.status === 'PUBLISHED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {task.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                    {task.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-gray-700">
                                                    {task.points || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {task.averageScore ? (
                                                    <span className="font-bold text-green-500">{task.averageScore} %</span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/mentor/mentorships/${mentorshipId}/tasks/${task.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[#0f5e8b] font-medium text-sm border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        Details
                                                    </button>
                                                    <button className="p-1.5 text-blue-400 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {taskPage && taskPage.totalPages > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>Showing</span>
                                <span className="px-2 py-1 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium">
                                    {taskPage.size}
                                </span>
                                <span>items per page</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: taskPage.totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${page === i
                                            ? 'bg-blue-600 text-white shadow-sm scale-105'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={page + 1 >= taskPage.totalPages}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashLayout>
    );
};

export default MentorshipTasks;
