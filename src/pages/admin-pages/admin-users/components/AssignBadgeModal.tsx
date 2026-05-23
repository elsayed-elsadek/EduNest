import React, { useState } from 'react';
import { X, Award, Crown, Lightbulb, Medal, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAssignBadge } from '../../../../services/admin-role-service/Admindashboardservice';

interface AssignBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  onSuccess?: () => void;
}
type BadgeOption = {
  id: number;
  title: string;
  icon: typeof Award;
  color: string;
  description: string;
};

const AVAILABLE_BADGES: BadgeOption[] = [
  { id: 0, title: 'ACADEMIC_EXCELLENCE', icon: Award, color: '#F59E0B', description: 'Awarded to users who contribute significantly to the community.' },
  { id: 1, title: 'TOP_MENTOR', icon: Crown, color: '#3B82F6', description: 'Recognized for excellent mentoring and student guidance.' },
  { id: 3, title: 'COMMUNITY_LEADER', icon: Medal, color: '#10B981', description: 'Awarded to students who achieve exceptional results.' },
  { id: 5, title: 'INNOVATOR_AWARD', icon: Lightbulb, color: '#EC4899', description: 'Awarded for creative solutions and project presentation.' },
];

const AssignBadgeModal: React.FC<AssignBadgeModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}) => {
  const [badgeId, setBadgeId] = useState<number>(1);
  const [recognitionNote, setRecognitionNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const assignBadgeMutation = useAdminAssignBadge();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!badgeId || !recognitionNote.trim()) {
      setErrorMsg('Please select a badge and enter a note.');
      return;
    }

    assignBadgeMutation.mutate(
      { userId, badgeId, recognitionNote },
      {
        onSuccess: () => {
          setRecognitionNote('');
          setBadgeId(1);
          onClose();
          toast.success('Badge assigned successfully!');
          if (onSuccess) {
            onSuccess();
          }
        },
onError: (error: unknown) => {
          const err = error as {
            response?: { data?: { errorMessages?: { error?: string }; message?: string } };
            message?: string;
          };

          const errMsg =
            err?.response?.data?.errorMessages?.error ||
            err?.response?.data?.message ||
            err?.message ||
            'Failed to assign badge. User might already have this badge.';

          setErrorMsg(errMsg);
          toast.error(errMsg);
        },
      }
    );
  };

  const selectedBadge = AVAILABLE_BADGES.find(b => b.id === badgeId) ?? AVAILABLE_BADGES[0];
  const SelectedBadgeIcon = selectedBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md mx-4 relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Assign Admin Badge</h3>
            <p className="text-xs text-slate-400 mt-0.5">To: <span className="font-semibold text-[var(--primary-500)]">{userName}</span></p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Select Badge */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Badge Type
            </label>
            <div className="relative">
              <select
                value={badgeId}
                onChange={(e) => setBadgeId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all appearance-none cursor-pointer"
              >
                {AVAILABLE_BADGES.map(badge => (
                  <option key={badge.id} value={badge.id}>
                    {badge.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Icon preview */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${selectedBadge.color}15` }}
            > 
              <SelectedBadgeIcon size={20} className="text-slate-700" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedBadge.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedBadge.description}</p>
            </div>
          </div>

          {/* Recognition Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recognition Note
            </label>
            <textarea
              rows={3}
              value={recognitionNote}
              onChange={(e) => setRecognitionNote(e.target.value)}
              placeholder="e.g., Recognized for exceptional dedication this term."
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all bg-slate-50/30 resize-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-4 border-t border-slate-50 pt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={assignBadgeMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignBadgeMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {assignBadgeMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Award size={16} />
                  Assign Badge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBadgeModal;
