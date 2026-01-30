
import type { FC } from 'react';
import EditButton from './EditButton';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  title: string;
  experience: string;
  avatar?: string;
  onEdit: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  title,
  experience,
  avatar,
  onEdit,
}) => {
  return (
    <div className="relative group rounded-2xl border border-gray-100 p-4 transition-all">
      <div className="flex flex-col md:flex-row items-center md:items-center gap-5">

        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-xl overflow-hidden p-[3px] bg-[#FACC15]">
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-gray-50">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1A1C1E] text-white text-2xl font-bold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* info section */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-bold text-[#1A1C1E]">
            {firstName} {lastName}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            {title}
          </p>
          <div className="inline-block mt-1 px-2 py-0.5 bg-gray-50 rounded-md">
            <p className="text-[11px] md:text-xs font-bold text-[#1A1C1E] uppercase tracking-wider">
              {experience}
            </p>
          </div>
        </div>


        <div className="absolute top-3 right-3 md:static transform scale-90">
          <EditButton onClick={onEdit} />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;