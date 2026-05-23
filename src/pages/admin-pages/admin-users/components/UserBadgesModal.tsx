import React from 'react';
import { X, Trash2, Award, Crown, Handshake, Lightbulb, Medal, Loader2, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useAdminUserBadges, 
  useAdminRemoveBadge, 
  ADMIN_USER_DETAILS_KEY 
} from '../../../../services/admin-role-service/Admindashboardservice';

interface UserBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  mode: 'view' | 'remove';
  onSuccess?: () => void;
}

type BadgeDetails = {
  icon: typeof Award;
  color: string;
  bg: string;
};

const getBadgeDetails = (type?: string, name?: string): BadgeDetails => {
  const t = `${type || ''} ${name || ''}`.toUpperCase();
  if (t.includes('ACADEMIC') || t.includes('EXCELLENCE')) {
    return { icon: Award, color: '#F59E0B', bg: 'bg-amber-50 text-amber-800 border-amber-100 hover:border-amber-200' };
  }
  if (t.includes('MENTOR') || t.includes('TOP')) {
    return { icon: Crown, color: '#3B82F6', bg: 'bg-blue-50 text-blue-800 border-blue-100 hover:border-blue-200' };
  }
  if (t.includes('LEADER') || t.includes('COMMUNITY')) {
    return { icon: Medal, color: '#10B981', bg: 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:border-emerald-200' };
  }
  if (t.includes('HELPFUL') || t.includes('HAND')) {
    return { icon: Handshake, color: '#8B5CF6', bg: 'bg-purple-50 text-purple-800 border-purple-100 hover:border-purple-200' };
  }
  if (t.includes('INNOVATOR') || t.includes('AWARD')) {
    return { icon: Lightbulb, color: '#EC4899', bg: 'bg-rose-50 text-rose-800 border-rose-100 hover:border-rose-200' };
  }
  return { icon: Medal, color: '#64748B', bg: 'bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-200' };
};

const UserBadgesModal: React.FC<UserBadgesModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  mode,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useAdminUserBadges(userId);
  const removeBadgeMutation = useAdminRemoveBadge();

  if (!isOpen) return null;

  const badges = data?.apiResponse?.badges || [];

  const handleRemove = (userBadgeId: number, badgeName: string) => {
    toast.promise(
      new Promise((resolve, reject) => {
        removeBadgeMutation.mutate(userBadgeId, {
          onSuccess: () => {
            // Invalidate our query to reload badges
            queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'badges', userId] });
            // Invalidate user details sidebar in AdminUsers.tsx
            queryClient.invalidateQueries({ queryKey: ADMIN_USER_DETAILS_KEY });
            if (onSuccess) onSuccess();
            resolve(true);
          },
          onError: (err: unknown) => {
            reject(err);
          },
        });
      }),
      {
        loading: `Removing badge "${badgeName}"...`,
        success: `Badge "${badgeName}" removed successfully!`,
        error: (err: unknown) => {
          const errorObj = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };

          const message =
            errorObj?.response?.data?.message ||
            errorObj?.message ||
            'Failed to remove badge';

          return message;
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out animate-in fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4 relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Award className="text-primary-500" size={20} />
              {mode === 'remove' ? 'Remove User Badges' : 'Assigned Admin Badges'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              User: <span className="font-semibold text-primary-600">{userName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-primary-500" size={32} />
              <span className="text-sm font-medium">Fetching active badges...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-rose-500">
              <p className="font-semibold">Error retrieving badges</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 text-xs text-primary-500 underline font-medium hover:text-primary-600"
              >
                Try again
              </button>
            </div>
          ) : badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center gap-2">
              <Award className="text-slate-200" size={48} />
              <p className="font-semibold text-sm">No badges assigned yet.</p>
              <p className="text-xs text-slate-400/80 max-w-xs">
                You can assign badges to this user using the Award button in the list.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {badges.map((badge) => {
                const details = getBadgeDetails(badge.badgeType, badge.badgeName);
                const BadgeIcon = details.icon;
                const isAwardedAtValid = badge.awardedAt && !isNaN(Date.parse(badge.awardedAt));
                const formattedDate = isAwardedAtValid 
                  ? new Date(badge.awardedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A';

                return (
                  <div 
                    key={badge.id}
                    className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 gap-3 ${details.bg}`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="mt-0.5 text-slate-700">
                        <BadgeIcon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm tracking-wide break-words">
                          {badge.badgeName || badge.badgeType}
                        </div>
                        {badge.badgeDescription && (
                          <p className="text-xs opacity-80 mt-1 leading-relaxed break-words">
                            {badge.badgeDescription}
                          </p>
                        )}

                        {/* Recognition Note & Date */}
                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] opacity-75 font-semibold">
                          {badge.recognitionNote && (
                            <span className="flex items-center gap-1.5 bg-white/40 border border-black/[0.03] px-2 py-0.5 rounded">
                              <FileText size={11} />
                              Note: {badge.recognitionNote}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 bg-white/40 border border-black/[0.03] px-2 py-0.5 rounded">
                            <Calendar size={11} />
                            Awarded: {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Type Label & Remove Action */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {badge.badgeType && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/60 border border-current/10 uppercase tracking-wider">
                          {badge.badgeType.replace(/_/g, ' ')}
                        </span>
                      )}
                      {mode === 'remove' && (
                        <button
                          onClick={() => handleRemove(badge.id, badge.badgeName || badge.badgeType)}
                          className="p-2 bg-rose-100/60 hover:bg-rose-200/80 text-rose-600 rounded-lg transition-colors border border-rose-200"
                          title="Remove Badge"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserBadgesModal;
