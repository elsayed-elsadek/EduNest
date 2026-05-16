import React, { useState } from 'react';
import { X, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateMentorshipStatus } from '../../../../services/mentorshipsContent/mentorship';
import type { MentorshipStatus } from '../../../../services/mentorshipsContent/mentorship';

interface StatusChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: string;
    mentorshipId: number;
    onStatusChange: (newStatus: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
    isOpen,
    onClose,
    currentStatus,
    mentorshipId,
    onStatusChange,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<MentorshipStatus>(
        (() => {
            const upperStatus = currentStatus.toUpperCase();
            return (upperStatus === 'DRAFT' || upperStatus === 'ACTIVE') 
                ? (upperStatus as MentorshipStatus) 
                : 'ACTIVE';
        })()
    );
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
<<<<<<< HEAD
        if (selectedStatus === currentStatus.toUpperCase()) {
=======
        const upperCurrent = currentStatus.toUpperCase();
        if (selectedStatus === upperCurrent) {
>>>>>>> Student-role
            onClose();
            return;
        }

<<<<<<< HEAD
=======
        if (!['ACTIVE', 'DRAFT'].includes(selectedStatus)) {
            toast.error('Invalid status');
            return;
        }

>>>>>>> Student-role
        setIsUpdating(true);
        try {
            await updateMentorshipStatus(mentorshipId, selectedStatus);
            toast.success(`Mentorship status updated to ${selectedStatus}`);
            onStatusChange(selectedStatus);
            onClose();
<<<<<<< HEAD
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update mentorship status';
=======
        } catch (error: unknown) {
            let errorMsg = 'Failed to update mentorship status';
            if (error && typeof error === 'object') {
                const errObj = error as Record<string, unknown>;
                const errorMessages = errObj.errorMessages as Record<string, unknown> | undefined;
                if (errorMessages?.error) {
                    errorMsg = String(errorMessages.error);
                }
            }
>>>>>>> Student-role
            toast.error(errorMsg);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Change Mentorship Status</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        disabled={isUpdating}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* ACTIVE Card */}
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setSelectedStatus('ACTIVE')}
                        className={`w-full flex items-start p-4 rounded-xl border-2 text-left transition-all ${
                            selectedStatus === 'ACTIVE'
                                ? 'border-green-500 bg-green-50/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`p-2 rounded-full mt-1 ${
                            selectedStatus === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                            <CheckCircle className={`w-6 h-6 ${
                                selectedStatus === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'
                            }`} />
                        </div>
                        <div className="ml-4">
                            <h3 className={`font-semibold ${
                                selectedStatus === 'ACTIVE' ? 'text-green-900' : 'text-gray-900'
                            }`}>
                                ACTIVE
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                The mentorship is fully published and available for students to enroll and access content.
                            </p>
                        </div>
                    </button>

                    {/* DRAFT Card */}
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setSelectedStatus('DRAFT')}
                        className={`w-full flex items-start p-4 rounded-xl border-2 text-left transition-all ${
                            selectedStatus === 'DRAFT'
                                ? 'border-amber-500 bg-amber-50/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`p-2 rounded-full mt-1 ${
                            selectedStatus === 'DRAFT' ? 'bg-amber-100' : 'bg-gray-100'
                        }`}>
                            <Clock className={`w-6 h-6 ${
                                selectedStatus === 'DRAFT' ? 'text-amber-600' : 'text-gray-500'
                            }`} />
                        </div>
                        <div className="ml-4">
                            <h3 className={`font-semibold ${
                                selectedStatus === 'DRAFT' ? 'text-amber-900' : 'text-gray-900'
                            }`}>
                                DRAFT
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                The mentorship is hidden from students. Use this to safely make edits and add content.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        disabled={isUpdating}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isUpdating}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary-from)] hover:brightness-110 rounded-xl transition-all flex items-center shadow-md shadow-primary/20"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeModal;
