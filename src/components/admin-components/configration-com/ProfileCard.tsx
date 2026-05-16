import type { FC } from 'react';
import { Pencil } from 'lucide-react';
import type { ProfileCardProps } from '../../../types/admin-role-types/adminConfigrations.types';

const ProfileCard: FC<ProfileCardProps> = ({ profile, onEditProfile }) => {
  const { name, email, avatar, headline, role } = profile;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden bg-[#e8f3fa]">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0f5e8b]">
                  {name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{email}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* headline badge — falls back to role */}
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-[#0f5e8b] bg-[#e8f3fa] rounded uppercase">
              {headline && headline.trim() !== '' ? headline : role}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0f5e8b] hover:text-[#0a4a6e] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;