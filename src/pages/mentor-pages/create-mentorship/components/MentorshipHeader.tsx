import type { FC } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export const MentorshipHeader: FC<Props> = ({ onBack }) => (
    <div className="flex flex-col gap-1 mb-6 sm:mb-8">
        {/* Header Title and Back Button Row */}
        <div className="flex items-center cursor-pointer"
          onClick={onBack}
          >
            {/* Back Button Wrapper - Enhanced for better UX */}
            <button 
              
                className="inline-flex items-center justify-center p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all active:scale-95"
                aria-label="Go back"
            >
                <ArrowLeft size={22} strokeWidth={2.5} />
            </button>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                Create New Mentorship 
            </h1>
        </div>

        {/* Description - Positioned directly under the title row */}
        <div className="pl-9"> {/* Added padding to align with the start of the text after the arrow */}
            <p className="text-sm text-gray-500 leading-relaxed">
                Fill in the details to publish your mentorship program.
            </p>
        </div>
    </div>
);