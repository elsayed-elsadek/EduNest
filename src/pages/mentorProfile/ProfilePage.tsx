
import type { FC } from 'react';
import { useState } from 'react';
import DashLayout from '../../components/layout/Dash-layout';
import ProfileHeader from '../../components/mentor-profile-com/ProfileHeader';
import ProfileSection from '../../components/mentor-profile-com/ProfileSection';
import type { UserProfile } from '../../types/mentor-profile.types';

const ProfilePage: FC = () => {
  const [profile] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'JohnSmith5@gmail.com',
    title: 'Web Developer',
    experience: '5+ Years Experience',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    links: {
      linkedin: 'http://www.linkedin',
      github: '',
    },
  });

  return (
    <DashLayout pageTitle="Profile">
      <div className="bg-[#F7F7F8] min-h-screen px-4 md:px-8 pt-4 pb-8">
        <div className="max-w-[1200px] mx-auto">

          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-50">

            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1C1E] mb-8">
              My Profile
            </h1>

            <div className="space-y-8">

              {/* Profile Header */}
              <ProfileHeader
                firstName={profile.firstName}
                lastName={profile.lastName}
                title={profile.title}
                experience={profile.experience}
                avatar={profile.avatar}
                onEdit={() => console.log('Edit profile')}
              />

              {/* Personal Information */}
              <ProfileSection
                title="Personal Information"
                onEdit={() => console.log('Edit personal info')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      First Name
                    </label>
                    <p className="text-sm font-bold text-[#1A1C1E]">
                      {profile.firstName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Last Name
                    </label>
                    <p className="text-sm font-bold text-[#1A1C1E]">
                      {profile.lastName}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <p className="text-sm font-bold text-[#1A1C1E]">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </ProfileSection>

              {/* Bio Section */}
              <ProfileSection
                title="Bio"
                onEdit={() => console.log('Edit bio')}
              >
                <p className="text-sm text-gray-600 leading-relaxed max-w-[900px]">
                  {profile.bio || 'No bio added yet.'}
                </p>
              </ProfileSection>

              {/* Links Section */}
              <ProfileSection
                title="Links"
                onEdit={() => console.log('Edit links')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">
                      LinkedIn
                    </label>
                    <p className="text-sm text-[#2176AE] font-medium break-all">
                      {profile.links?.linkedin || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">
                      GitHub
                    </label>
                    <p className="text-sm text-gray-600 font-medium">
                      {profile.links?.github || '-'}
                    </p>
                  </div>
                </div>
              </ProfileSection>

            </div>
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default ProfilePage;