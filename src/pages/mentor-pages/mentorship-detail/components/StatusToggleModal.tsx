import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';


interface StatusToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorshipId: string | number;
  currentStatus: string;
  onStatusUpdated: (newStatus: string) => void;
}

const StatusToggleModal: React.FC<StatusToggleModalProps> = ({
  isOpen,
  onClose,
  mentorshipId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const isActive = currentStatus === 'ACTIVE';
  const newStatus = isActive ? 'DRAFT' : 'ACTIVE';
  const actionText = isActive ? 'Deactivate' : 'Activate';
  const confirmText = isActive 
    ? 'This mentorship will be deactivated and hidden from students.' 
    : 'This mentorship will be activated and visible to students.';

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/mentorship/${mentorshipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      toast.success(`Mentorship ${actionText.toLowerCase()}d successfully!`);
      onStatusUpdated(newStatus);
      onClose();
    } catch (error) {
      const msg = (error as Error).message || `Failed to ${actionText.toLowerCase()} mentorship`;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                {isActive ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{actionText} Mentorship</h3>
                <p className="text-sm text-gray-500">Confirm this action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">{confirmText}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-gray-900">Current status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentStatus}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm mt-2">
              <span className="font-semibold text-gray-900">New status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {newStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />}
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusToggleModal;
