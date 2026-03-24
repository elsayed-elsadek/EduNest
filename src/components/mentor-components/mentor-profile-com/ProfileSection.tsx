

import type { FC, ReactNode } from 'react';
import EditButton from './EditButton';

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
  onEdit: () => void;
}

const ProfileSection: FC<ProfileSectionProps> = ({ title, children, onEdit }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
        <EditButton onClick={onEdit} />
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default ProfileSection;


