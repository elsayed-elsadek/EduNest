import React, { useState } from 'react';
import { X, Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminCreateBadge } from '../../../../services/admin-role-service/Admindashboardservice';

interface CreateBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BADGE_TYPES = [
  { value: 'ACADEMIC_EXCELLENCE', label: 'Academic Excellence', emoji: '🎓', color: '#F59E0B', desc: 'For outstanding academic contributions.' },
  { value: 'TOP_MENTOR', label: 'Top Mentor', emoji: '🧑‍🏫', color: '#3B82F6', desc: 'For exceptional guidance and mentoring.' },
  { value: 'COMMUNITY_LEADER', label: 'Community Leader', emoji: '🏆', color: '#10B981', desc: 'For positive community engagement and impact.' },
  { value: 'INNOVATOR_AWARD', label: 'Innovator Award', emoji: '💡', color: '#EC4899', desc: 'For creativity and innovative work.' },
] as const;

const CreateBadgeModal: React.FC<CreateBadgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<typeof BADGE_TYPES[number]['value']>('ACADEMIC_EXCELLENCE');
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();
  const createBadgeMutation = useAdminCreateBadge();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !description.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    createBadgeMutation.mutate(
      { name, description, type },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setType('ACADEMIC_EXCELLENCE');
          queryClient.invalidateQueries({ queryKey: ['admin', 'badges', 'all'] });
          onClose();
          toast.success('Admin badge created successfully!');
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error: any) => {
          const errMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to create admin badge.';
          setErrorMsg(errMsg);
          toast.error(errMsg);
        },
      }
    );
  };

  const selectedBadgeType = BADGE_TYPES.find(b => b.value === type) ?? BADGE_TYPES[0];

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
            <h3 className="font-bold text-slate-800 text-base">Create Admin Badge</h3>
            <p className="text-xs text-slate-400 mt-0.5">Design a new system recognition badge</p>
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

          {/* Badge Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Badge Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Code Master, Super Scholar"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all bg-slate-50/30"
              required
            />
          </div>

          {/* Select Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Badge Type
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all appearance-none cursor-pointer"
              >
                {BADGE_TYPES.map(bt => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</div>
            </div>
          </div>

          {/* Icon preview */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${selectedBadgeType.color}15` }}
            > 
              {selectedBadgeType.emoji}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedBadgeType.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedBadgeType.desc}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Awarded for outstanding technical excellence and contribution to group projects."
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all bg-slate-50/30 resize-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-4 border-t border-slate-50 pt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={createBadgeMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBadgeMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createBadgeMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Award size={16} />
                  Create Badge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBadgeModal;
