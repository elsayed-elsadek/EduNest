
import { Mail, MessageCircle } from 'lucide-react';
import type { FC } from 'react';
import type { Student } from '../../../types/viewStudent.types';

interface ProfileHeaderProps {
  student: Student;
  onMail?: () => void;
  onChat?: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({ student, onMail, onChat }) => {
  const avatarSrc = student.avatar
    ? student.avatar.startsWith('http')
      ? student.avatar
      : `http://localhost:8080${student.avatar}`
    : null;

  const coverSrc = student.coverImage
    ? student.coverImage.startsWith('http')
      ? student.coverImage
      : `http://localhost:8080${student.coverImage}`
    : null;

  return (
    <div className="overflow-hidden">
      {/* Cover */}
      <div className="h-36 relative" style={{ background: 'linear-gradient(to bottom right, #0f5e8b, #0d4a6f)' }}>
        {coverSrc && (
          <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Avatar + Actions */}
      <div className="px-6 pb-5">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0f5e8b, #0d4a6f)' }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onMail}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Mail size={14} className="text-[#0f5e8b]" />
              Mail
            </button>
            <button
              onClick={onChat}
              className="px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: '#0f5e8b' }}
            >
              <MessageCircle size={14} className="text-white" />
              Chat
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{student.name}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{student.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;