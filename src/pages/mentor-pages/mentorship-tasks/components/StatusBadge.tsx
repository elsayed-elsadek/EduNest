import type { FC } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { TaskSubmissionItem } from '../../../../services/mentorshipsContent/task';

interface StatusBadgeProps {
    status: TaskSubmissionItem['status'];
    isLate?: boolean;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, isLate }) => {
    if (status === 'GRADED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                <CheckCircle size={14} /> Graded
            </span>
        );
    }
    if (status === 'SUBMITTED') {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${isLate ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                <Clock size={14} /> {isLate ? 'Submitted (Late)' : 'Submitted'}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <XCircle size={14} /> Not Submitted
        </span>
    );
};

export default StatusBadge;

