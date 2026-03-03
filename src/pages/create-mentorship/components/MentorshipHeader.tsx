import type { FC } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export const MentorshipHeader: FC<Props> = ({ onBack }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                Create New Mentorship
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Fill in the details to publish your mentorship program.
            </p>
        </div>
        <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-primary hover:bg-gray-50 active:scale-[0.98] shrink-0 md:border-0 md:bg-transparent md:min-h-0 md:px-0 md:py-0"
        >
            <ArrowLeft size={20} className="shrink-0" />
            <span>Back</span>
        </button>
    </div>
);



