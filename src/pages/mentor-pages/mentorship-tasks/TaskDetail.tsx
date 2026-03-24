import type { FC } from 'react';
import { useState } from 'react';
import {
     CheckCircle, Clock, XCircle,
    Search, Filter,  Users, FileText, Star,
    ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import { useNavigate } from 'react-router-dom';
import type { TaskSubmissionItem } from '../../../services/mentorshipsContent/task';
import { useTaskDetail } from '../../../hooks/useTaskDetail';
import GradeModal from './components/GradeModal';

/* ════════════════════════════════════════════════
   Status Badge - Refined Design
   ════════════════════════════════════════════════ */
const StatusBadge: FC<{ status: TaskSubmissionItem['status']; isLate?: boolean }> = ({ status, isLate }) => {
    const configs = {
        GRADED: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            icon: <CheckCircle size={14} />,
            label: 'Graded'
        },
        SUBMITTED: {
            bg: isLate ? 'bg-rose-50' : 'bg-indigo-50',
            text: isLate ? 'text-rose-700' : 'text-indigo-700',
            icon: <Clock size={14} />,
            label: isLate ? 'Late Submission' : 'Submitted'
        },
        NOT_SUBMITTED: {
            bg: 'bg-slate-100',
            text: 'text-slate-500',
            icon: <XCircle size={14} />,
            label: 'Missing'
        }
    };

    const config = configs[status] || configs.NOT_SUBMITTED;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ring-black/5`}>
            {config.icon}
            {config.label}
        </span>
    );
};

/* ════════════════════════════════════════════════
   Task Detail Page
   ════════════════════════════════════════════════ */
const TaskDetail: FC = () => {
    const navigate = useNavigate();
    const {
        stats, loading,  submissions: filteredSubmissions,
        paginationMeta, maxPoints, gradedCount, searchQuery,
        setSearchQuery, statusFilter, setStatusFilter, STATUS_OPTIONS,
        page, setPage, handleGraded,
    } = useTaskDetail();

    const [gradingSubmission, setGradingSubmission] = useState<TaskSubmissionItem | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);

    const handleGradedWrapper = () => {
        setGradingSubmission(null);
        handleGraded();
    };

    if (loading && !stats) {
        return (
            <DashLayout pageTitle="Loading Task...">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Fetching details...</p>
                    </div>
                </div>
            </DashLayout>
        );
    }

    return (
        <DashLayout pageTitle="Task Administration">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
                
                {/* ─── Header Section ─── */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-baseline gap-2 cursor-pointer text-gray-600 hover:text-gray-900 mb-2" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            <h1 className="text-3xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {stats?.taskTitle || 'Untitled Mission'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <ClipboardList size={24} />
                            </div> */}
                            {/* <nav className="text-sm font-medium text-slate-400">
                                Mentorship / <span className="text-slate-900">Task Details</span>
                            </nav> */}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                             <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Star size={12} className="fill-current" /> {maxPoints} Points
                            </span>
                            {stats?.deadLine && (
                                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <Clock size={15} className="text-rose-500" />
                                    Deadline: <span className="font-semibold text-slate-700">
                                        {new Date(stats.deadLine).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            {/* <MoreHorizontal size={20} /> */}
                        </button>
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                            stats?.status === 'PUBLISHED' ? 'border-emerald-100 text-emerald-600 bg-emerald-50/50' : 'border-slate-100 text-slate-500 bg-slate-50'
                        }`}>
                            ● {stats?.status || 'DRAFT'}
                        </div>
                    </div>
                </header>

                {/* ─── Stats Grid ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Enrolled', val: stats?.totalStudents, icon: Users, color: 'indigo' },
                        { label: 'Submissions', val: stats?.totalSubmissions, icon: FileText, color: 'blue' },
                        { label: 'Pending', val: stats?.pendingReview, icon: Clock, color: 'amber' },
                        { label: 'Completed', val: gradedCount, icon: CheckCircle, color: 'emerald' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-indigo-200 transition-all group">
                            <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                                <s.icon size={20} />
                            </div>
                            <p className="text-sm font-medium text-slate-500">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{s.val ?? 0}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Data Section ─── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* Table Filters */}
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by student name..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setFilterOpen(!filterOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    <Filter size={16} className="text-slate-400" />
                                    {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
                                </button>
                                {filterOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 animate-in slide-in-from-top-2">
                                        {STATUS_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setStatusFilter(opt.value); setFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statusFilter === opt.value ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-4">Student Information</th>
                                    <th className="px-6 py-4">Performance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Timeline</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <Search size={32} strokeWidth={1.5} />
                                                </div>
                                                <p className="font-medium">No results found for your filters</p>
                                                <button onClick={() => {setSearchQuery(''); setStatusFilter('ALL')}} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">Clear all filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((sub) => (
                                        <tr key={sub.submissionId} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                        {sub.studentFullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sub.studentFullName}</p>
                                                        {/* <p className="text-xs text-slate-400 font-medium">ID: #{sub.submissionId.toString().slice(-5)}</p> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sub.status === 'NOT_SUBMITTED' ? (
                                                    <span className="text-slate-300">—</span>
                                                ) : (sub.finalScore ?? sub.rawScore) !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-indigo-500 rounded-full" 
                                                                style={{ width: `${((sub.finalScore ?? sub.rawScore)! / maxPoints) * 100}%` }} 
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {sub.finalScore ?? sub.rawScore}<span className="text-slate-400 font-normal">/{maxPoints}</span>
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">Ungraded</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={sub.status} isLate={sub.isLate} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600">
                                                    {sub.submittedAt ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                            <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 italic">Not available</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setGradingSubmission(sub)}
                                                    disabled={sub.status === 'NOT_SUBMITTED'}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        sub.status === 'NOT_SUBMITTED'
                                                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                                            : sub.status === 'GRADED'
                                                                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100'
                                                                : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95'
                                                    }`}
                                                >
                                                    {sub.status === 'GRADED' ? 'Review Grade' : 'Grade Now'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    {paginationMeta && paginationMeta.totalPages > 1 && (
                        <footer className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-500 font-medium">
                                Showing <span className="text-slate-900">{filteredSubmissions.length}</span> of <span className="text-slate-900">{paginationMeta.totalElements}</span> submissions
                            </p>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setPage(p => p - 1)} 
                                    disabled={page === 0}
                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {[...Array(paginationMeta.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                            page === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setPage(p => p + 1)} 
                                    disabled={page + 1 >= paginationMeta.totalPages}
                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </footer>
                    )}
                </div>
            </div>

            {gradingSubmission && (
                <GradeModal
                    submission={gradingSubmission}
                    maxPoints={maxPoints}
                    onClose={() => setGradingSubmission(null)}
                    onGraded={handleGradedWrapper}
                />
            )}
        </DashLayout>
    );
};

export default TaskDetail;