import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EditMentorshipHeader: FC = () => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4"
            >
                <ArrowLeft size={20} />
                Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Mentorship</h1>
        </div>
    );
};

export default EditMentorshipHeader;



