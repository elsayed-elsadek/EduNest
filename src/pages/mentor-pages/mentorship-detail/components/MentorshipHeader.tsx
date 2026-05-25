import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Activity, Edit2, FileText, PenSquare } from 'lucide-react';
import type { MentorshipApiResponse } from '../../../../services/mentorDashboardService';
import StatusChangeModal from './StatusChangeModal';

interface MentorshipHeaderProps {
    mentorship: MentorshipApiResponse | null;
    activeTab: 'overview' | 'dashboard';
    setActiveTab: (tab: 'overview' | 'dashboard') => void;
    onOverviewClick?: () => void;
    onCreateContentClick: () => void;
    onStatusChange?: (newStatus: string) => void;
}

// Styles for status in mentorship (Updated with Dark Mode support for clean UI)
const STATUS_STYLES: Record<string, string> = {
    DRAFT: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900/50',
    ACTIVE: 'bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/50',
    COMPLETED: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-900/50',
    DEFAULT: 'bg-gray-100 text-gray-800 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:ring-zinc-700',
};

// فصلناها برة الكومبوننت عشان نمنع الـ Re-creation مع كل ريندر ونحسن الأداء
const getTabClassName = (isActive: boolean) => `
    flex items-center gap-3 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200
    ${isActive 
        ? 'bg-gray-100 dark:bg-zinc-800 border-l-4 border-[var(--primary-from)] text-primary' 
        : 'bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border-l-4 border-transparent text-gray-700 dark:text-gray-300'
    }
`.trim();

const MentorshipHeader: FC<MentorshipHeaderProps> = ({
    mentorship,
    activeTab,
    setActiveTab,
    onCreateContentClick,
    onStatusChange,
}) => {
    // 1. كل الـ Hooks لازم تكون فوق أي Early Return
    const [showStatusModal, setShowStatusModal] = useState(false);

    // استخدام Optional Chaining (?.) عشان نحمي الكود لو mentorship بـ null
    const currentStatus = useMemo(() => {
        return (mentorship?.status || 'Active').toString();
    }, [mentorship?.status]);

    // 2. الـ Early return ييجي بعد الـ Hooks
    if (!mentorship) return null;

    const statusKey = currentStatus.toUpperCase();
    const currentStatusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.DEFAULT;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Side: Title & Status */}
            <div className="w-full">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words leading-snug">
                    {mentorship.title}
                </h1>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <button 
                        onClick={() => setShowStatusModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition cursor-pointer shadow-sm ${currentStatusStyle}`}
                        aria-label="Change Status"
                    >
                        <span>{currentStatus}</span>
                        <Edit2 className="w-3 h-3 opacity-70" />
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">My Mentorships</p>
                </div>
            </div>

            {/* Right Side: Navigation & Actions */}
            <div className="flex items-center shrink-0 gap-4 w-full sm:w-auto flex-wrap">
                {/* Dashboard Button */}
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={getTabClassName(activeTab === 'dashboard')}
                >
                    <Activity className="w-5 h-5" />
                    Dashboard
                </button>

                {/* Overview Button */}
                <button
                    onClick={() => setActiveTab('overview')}
                    className={getTabClassName(activeTab === 'overview')}
                >
                    <PenSquare className="w-5 h-5" />
                    Overview
                </button>

                {/* Create Content Action Button */}
                <button
                    onClick={onCreateContentClick}
                    className="flex items-center gap-3 w-full sm:w-auto px-5 py-3 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-100 dark:border-zinc-800 shadow-sm text-gray-700 dark:text-gray-300"
                >
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    Create Content
                </button>
            </div>
            
            <StatusChangeModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                currentStatus={currentStatus}
                mentorshipId={mentorship.id as number}
                onStatusChange={(newStatus) => onStatusChange?.(newStatus)}
            />
        </div>
    );
};

export default MentorshipHeader;