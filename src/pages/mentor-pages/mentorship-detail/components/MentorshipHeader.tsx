import { useState } from 'react';
import type { FC } from 'react';
import { Activity, Edit2 } from 'lucide-react';
import type { MentorshipApiResponse } from '../../../../services/mentorDashboardService';
import StatusChangeModal from './StatusChangeModal';

interface MentorshipHeaderProps {
    mentorship: MentorshipApiResponse | null;
    activeTab: 'overview' | 'dashboard';
    setActiveTab: (tab: 'overview' | 'dashboard') => void;
    onOverviewClick: () => void;
    onCreateContentClick: () => void;
    onStatusChange?: (newStatus: string) => void;
}

const MentorshipHeader: FC<MentorshipHeaderProps> = ({
    mentorship,
    activeTab,
    setActiveTab,
    onCreateContentClick,
    onStatusChange,
}) => {
    const [showStatusModal, setShowStatusModal] = useState(false);

    if (!mentorship) return null;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ">
            <div className="w-full">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 break-words leading-snug">
                    {mentorship.title}
                </h1>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <button 
                        onClick={() => setShowStatusModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition cursor-pointer shadow-sm ${
                            (mentorship.status ?? '').toString().toUpperCase() === 'DRAFT'
                                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 focus:ring-2 focus:ring-amber-500'
                                : (mentorship.status ?? '').toString().toUpperCase() === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800 ring-1 ring-green-200 focus:ring-2 focus:ring-green-500'
                                    : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-500'
                        }`}
                        aria-label="Change Status"
                    >
                        <span>{(mentorship.status ?? 'Active').toString()}</span>
                        <Edit2 className="w-3 h-3 opacity-70" />
                    </button>
                    <p className="text-sm text-gray-500">My Mentorships</p>
                </div>
            </div>

            <div className="flex items-center shrink-0 gap-4 w-full sm:w-auto flex-wrap">
                {/* Overview (Weeks Content) */}
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-3 w-full sm:w-auto px-5 py-3 
       rounded-xl text-sm font-medium transition ${activeTab === 'overview'
                            ? 'bg-gray-100 border-l-4 border-[var(--primary-from)] text-primary'
                            : 'bg-white hover:bg-gray-100 border-l-4 border-transparent text-gray-700'
                        }`}
                >
                    <i className="fa-regular fa-pen-to-square text-lg"></i>
                    Overview
                </button>

                {/* Dashboard (Stats/Students) */}
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-3 w-full sm:w-auto px-5 py-3 
       rounded-xl text-sm font-medium transition ${activeTab === 'dashboard'
                            ? 'bg-gray-100 border-l-4 border-[var(--primary-from)] text-primary'
                            : 'bg-white hover:bg-gray-100 border-l-4 border-transparent text-gray-700'
                        }`}
                >
                    <Activity className="w-5 h-5" />
                    Dashboard
                </button>

                {/* Create Content */}
                <button
                    onClick={onCreateContentClick}
                    className="flex items-center gap-3 w-full sm:w-auto px-5 py-3 
       bg-white hover:bg-gray-200 
       rounded-xl text-sm font-medium
       border-l-4 border-gray-700 transition"
                >
                    <i className="fa-regular fa-file-lines text-lg text-gray-700"></i>
                    Create Content
                </button>
            </div>
            
            <StatusChangeModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                currentStatus={(mentorship.status ?? 'ACTIVE').toString()}
                mentorshipId={mentorship.id as number}
                onStatusChange={(newStatus) => {
                    if (onStatusChange) onStatusChange(newStatus);
                }}
            />
        </div>
    );
};

export default MentorshipHeader;



