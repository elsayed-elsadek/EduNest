import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faQuestionCircle,
  faFileAlt,
  faCalendarAlt,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import type { WeekData } from '../types';

interface MentorshipContentListProps {
    weeks: WeekData[] | null;
    loading: boolean;
    error: string | null;
    onCreateContentClick: () => void;
}

// Helper to get FontAwesome icon based on content type
const getIconForType = (type: string | undefined) => {
  const typeStr = String(type ?? 'CONTENT').toUpperCase();
  if (typeStr.includes('LECTURE')) return faVideo;
  if (typeStr.includes('QUIZ')) return faQuestionCircle;
  if (typeStr.includes('PROJECT')) return faFolderOpen;
  if (typeStr.includes('SESSION') || typeStr.includes('LIVE')) return faCalendarAlt;
  if (typeStr.includes('ASSIGNMENT') || typeStr.includes('TASK')) return faFileAlt;
  return faFileAlt;
};

const MentorshipContentList: FC<MentorshipContentListProps> = ({
    weeks,
    loading,
    error,
    onCreateContentClick,
}) => {
    return (
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm sm:shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Mentorship Content</h3>
                <button
                    onClick={onCreateContentClick}
                    className="px-3 sm:px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-[var(--primary-dark)] transition self-start sm:self-auto"
                >
                    Edit Content
                </button>
            </div>

            {loading ? (
                <div className="text-center py-6 text-gray-500">Loading content...</div>
            ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
            ) : !weeks || weeks.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">There are no weeks available yet.</p>
                    <button
                        onClick={onCreateContentClick}
                        className="text-primary hover:underline text-sm font-medium"
                    >
                        Get started by creating your first week
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical line */}
                    <div className="hidden sm:block absolute left-10 top-6 bottom-6 w-px bg-gray-200" />

                    <div className="space-y-8">
                        {weeks.map(({ week, items }, wIdx) => (
                            <div key={week.id} className="flex items-start sm:items-center gap-4">
                                {/* Circle node */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-[var(--primary-from)] text-primary shadow-sm">
                                        <span className="text-xs font-semibold">{wIdx + 1}</span>
                                    </div>
                                    {/* connector line for mobile */}
                                    <div className="block sm:hidden h-6 w-px bg-gray-200 mt-2" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 sm:p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="text-sm sm:text-base font-medium text-gray-800 truncate">
                                                    {week.title || `Week ${week.id}`}
                                                </div>
                                                <div className="text-xs text-gray-500">{items.length} items</div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2">
                                                <button
                                                    onClick={() => onCreateContentClick()}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-md text-primary hover:bg-[var(--primary-from)]/5"
                                                >
                                                    Add Content
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items roadmap inside week */}
                                        <div className="mt-3">
                                            <ul className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <li key={item.id ?? idx} className="flex items-start gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs">
                                                                <FontAwesomeIcon icon={getIconForType(item.type)} className="w-3 h-3" />
                                                            </div>
                                                            {idx !== items.length - 1 && (
                                                                <div className="h-6 w-px bg-gray-200 mt-1" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{item.title || 'Untitled'}</p>
                                                                <div className="text-xs text-gray-400 whitespace-nowrap">{item.createdAt ? new Date(item.createdAt as string).toLocaleString() : ''}</div>
                                                            </div>
                                                            <div className="mt-1">
                                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{item.type || 'CONTENT'}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipContentList;



