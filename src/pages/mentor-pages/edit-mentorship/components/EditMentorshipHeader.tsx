import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EditMentorshipHeader: FC = () => {
    const navigate = useNavigate();
    return (
        <div className="mb-8 pb-8 border-b border-gray-200">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
            >
                <ArrowLeft size={18} />
                Back
            </button>
            {/* <div>
                <h1 className="text-2
                .xl font-bold text-gray-900 mb-2">Edit Mentorship Program</h1>
                <p className="text-gray-600 flex items-center gap-2 text-sm">
                    <span>→</span>
                    <span>Update your program details to attract and engage more students</span>
                </p>
            </div> */}
        </div>
    );
};

export default EditMentorshipHeader;



