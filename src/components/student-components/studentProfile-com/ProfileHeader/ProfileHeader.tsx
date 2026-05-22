
import type { FC } from 'react';
import { Github, Linkedin, Pencil, Mail, Settings } from 'lucide-react';
import type { ProfileHeaderProps } from './ProfileHeader.types';

const ProfileHeader: FC<ProfileHeaderProps> = ({ profile, onEditProfile }) => {
  const { firstName, lastName, role, email, avatar, githubUrl, linkedinUrl } = profile;
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 ring-2 ring-gray-100">
          {avatar ? (
            <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0c2d48] to-blue-400 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {/* Settings badge */}
        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0c2d48] rounded-full flex items-center justify-center shadow-md">
          <Settings className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>

        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-[#0c2d48] bg-blue-50 border border-blue-200 rounded-md uppercase">
            {role}
          </span>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* GitHub */}
          <a
            href={githubUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub Profile
          </a>

          {/* LinkedIn */}
          <a
            href={linkedinUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            LinkedIn Profile
          </a>

          {/* Edit Profile */}
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0c2d48] rounded-lg hover:bg-[#0a2438] transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
                
      </div>
    </div>
  );
};

export default ProfileHeader;