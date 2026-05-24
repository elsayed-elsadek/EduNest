import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminAllBadges, useAdminDeleteBadge } from '../../../../services/admin-role-service/Admindashboardservice';

interface DeleteBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getBadgeStyle = (type: string) => {
  const t = type?.toUpperCase();
  if (t === 'ACADEMIC_EXCELLENCE') return { emoji: '🎓', color: '#F59E0B' };
  if (t === 'TOP_MENTOR') return { emoji: '🧑‍🏫', color: '#3B82F6' };
  if (t === 'COMMUNITY_LEADER') return { emoji: '🏆', color: '#10B981' };
  if (t === 'INNOVATOR_AWARD') return { emoji: '💡', color: '#EC4899' };
  return { emoji: '🏅', color: '#64748B' };
};

const DeleteBadgeModal: React.FC<DeleteBadgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [badgeId, setBadgeId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();

  const { data: allBadgesData, isLoading: isBadgesLoading } = useAdminAllBadges();
  const availableBadges = allBadgesData?.apiResponse?.badges || [];

  const deleteBadgeMutation = useAdminDeleteBadge();

  // Set default badge once badges are loaded
  useEffect(() => {
    if (availableBadges.length > 0 && badgeId === null) {
      setBadgeId(availableBadges[0].id);
    }
  }, [availableBadges, badgeId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!badgeId) {
      setErrorMsg('Please select a badge to delete.');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1 font-sans">
        <p className="text-xs font-semibold text-slate-800">
          Are you sure you want to delete this badge globally?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(badgeId);
            }}
            className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right',
      style: {
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      }
    });
  };

  const executeDelete = (id: number) => {
    deleteBadgeMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Admin badge deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['admin', 'badges', 'all'] });
        setBadgeId(null);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        const errMsg =
          error?.response?.data?.errorMessages?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete badge. It has already been assigned and cannot be deleted.';
        setErrorMsg(errMsg);
        toast.error(errMsg);
      },
    });
  };

  const activeBadge = availableBadges.find(b => b.id === badgeId);
  const activeStyle = activeBadge ? getBadgeStyle(activeBadge.type) : { emoji: '🏅', color: '#64748B' };

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
            <h3 className="font-bold text-slate-800 text-base">Delete Admin Badge</h3>
            <p className="text-xs text-slate-400 mt-0.5">Remove an unassigned recognition badge globally</p>
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
              Select Badge to Delete
            </label>
            <div className="relative">
              <select
                value={badgeId || ''}
                onChange={(e) => setBadgeId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all appearance-none cursor-pointer"
                disabled={isBadgesLoading}
              >
                {isBadgesLoading ? (
                  <option>Loading badges...</option>
                ) : availableBadges.length > 0 ? (
                  availableBadges.map(badge => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name} ({badge.type.replace(/_/g, ' ')})
                    </option>
                  ))
                ) : (
                  <option>No badges available</option>
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</div>
            </div>
          </div>

          {/* Icon preview */}
          {!isBadgesLoading && activeBadge && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${activeStyle.color}15` }}
              > 
                {activeStyle.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 text-sm truncate">{activeBadge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{activeBadge.description}</p>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="font-bold">⚠️ Important Notice:</span>
            <span>You can only delete badges that have never been assigned to any user. Assigned badges cannot be deleted.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-4 border-t border-slate-50 pt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteBadgeMutation.isPending || isBadgesLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteBadgeMutation.isPending || isBadgesLoading || availableBadges.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {deleteBadgeMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Badge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteBadgeModal;
