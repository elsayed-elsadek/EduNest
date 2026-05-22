

import type { FC, ChangeEvent } from 'react';
import { useState, useRef } from 'react';
import { X, Camera, Edit, User } from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import ProfileSection from '../../../components/mentor-components/mentor-profile-com/ProfileSection';
import { useMentorProfile } from '../../../hooks/Usementorprofile';
import type { UpdateMentorProfileRequest } from '../../../types/mentor-profile.types';

//  Edit Modal
interface EditModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}

const EditModal: FC<EditModalProps> = ({ title, onClose, onSave, saving, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
      <div className="flex gap-3 p-6 pt-0 justify-end">
        <button onClick={onClose}
          className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onSave} disabled={saving}
          className="px-5 py-2 rounded-xl bg-[#0f5e8b] text-white text-sm font-semibold hover:bg-[#0c4a6d] transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
);

//  Field 
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

const Field: FC<FieldProps> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    {type === 'textarea' ? (
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5e8b] resize-none" />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]" />
    )}
  </div>
);

// ensure URL has a protocol
const ensureHttps = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Main Page
const ProfilePage: FC = () => {
  const { profile, loading, saving, error, success, saveProfile, uploadImage } = useMentorProfile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  // edit states
  const [editMode, setEditMode] = useState<'personal' | 'bio' | 'links' | null>(null);

  // form fields
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    bio: '', jobTitle: '', yearsOfExperience: 0,
    linkedInLink: '', githubLink: '',
  });

  const openEdit = (mode: 'personal' | 'bio' | 'links') => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      bio: profile.bio ?? '',
      jobTitle: profile.title ?? '',
      yearsOfExperience: parseInt(profile.experience) || 0,
      linkedInLink: profile.links?.linkedin ?? '',
      githubLink: profile.links?.github ?? '',
    });
    setEditMode(mode);
  };

  const handleSave = async () => {
    const payload: UpdateMentorProfileRequest = {
      firstName: form.firstName,
      lastName: form.lastName,
      bio: form.bio,
      jobTitle: form.jobTitle,
      yearsOfExperience: Number(form.yearsOfExperience),
      linkedInLink: form.linkedInLink,
      githubLink: form.githubLink,
    };
    await saveProfile(payload);
    setEditMode(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  if (loading) return (
    <DashLayout pageTitle="Profile">
      <div className="bg-gray-50 min-h-screen px-4 md:px-8 pt-4 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm animate-pulse space-y-6">
            <div className="h-8 w-40 bg-gray-100 rounded-xl" />
            <div className="h-28 bg-gray-100 rounded-2xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </DashLayout>
  );

  return (
    <DashLayout pageTitle="Profile">
      <div className="bg-gray-50 min-h-screen px-4 md:px-8 pt-4 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-50">

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
              {/* Success / Error toasts */}
              {success && (
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                  {success}
                </span>
              )}
              {error && (
                <span className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                  {error}
                </span>
              )}
            </div>

            <div className="space-y-8">

              {/* Profile Header — hidden input for image upload */}
              <input ref={imageInputRef} type="file" accept="image/*"
                className="hidden" onChange={handleImageChange} />

              <div className="flex items-center gap-6 p-6 border border-gray-100 rounded-2xl relative">
                {/* Avatar with camera overlay */}
                <div className="relative shrink-0 group cursor-pointer"
                  onClick={() => imageInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl border-2 border-yellow-400 overflow-hidden bg-gray-100">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="avatar"
                      width={96} height={96}
                          fetchPriority="high"
                        className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  {saving && (
                    <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#0f5e8b] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Name & title */}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{profile?.title || '—'}</p>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                    {profile?.experience}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    Click on photo to change
                  </p>
                </div>

                {/* Edit button */}
                <button onClick={() => openEdit('personal')}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              {/* Personal Information */}
              <ProfileSection title="Personal Information" onEdit={() => openEdit('personal')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                    <p className="text-sm font-bold text-gray-900">{profile?.firstName || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                    <p className="text-sm font-bold text-gray-900">{profile?.lastName || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <p className="text-sm font-bold text-gray-900">{profile?.email || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Job Title</label>
                    <p className="text-sm font-bold text-gray-900">{profile?.title || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Experience</label>
                    <p className="text-sm font-bold text-gray-900">{profile?.experience || '—'}</p>
                  </div>
                </div>
              </ProfileSection>

              {/* Bio */}
              <ProfileSection title="Bio" onEdit={() => openEdit('bio')}>
                <p className="text-sm text-gray-600 leading-relaxed max-w-[900px]">
                  {profile?.bio || 'No bio added yet.'}
                </p>
              </ProfileSection>

              {/* Links */}
              <ProfileSection title="Links" onEdit={() => openEdit('links')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">LinkedIn</label>
                    {profile?.links?.linkedin
                      ? <a href={ensureHttps(profile.links.linkedin)} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-[#0f5e8b] font-medium break-all hover:underline">
                        {profile.links.linkedin}
                      </a>
                      : <p className="text-sm text-gray-400">—</p>
                    }
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">GitHub</label>
                    {profile?.links?.github
                      ? <a href={ensureHttps(profile.links.github)} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-[#0f5e8b] font-medium break-all hover:underline">
                        {profile.links.github}
                      </a>
                      : <p className="text-sm text-gray-400">—</p>
                    }
                  </div>
                </div>
              </ProfileSection>

            </div>
          </div>
        </div>
      </div>

      {/* ── Edit: Personal Info ── */}
      {editMode === 'personal' && (
        <EditModal title="Edit Personal Information" onClose={() => setEditMode(null)} onSave={handleSave} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={form.firstName} onChange={(v) => setForm(f => ({ ...f, firstName: v }))} />
            <Field label="Last Name" value={form.lastName} onChange={(v) => setForm(f => ({ ...f, lastName: v }))} />
          </div>
          {/* Email field is read-only (cannot be changed via backend) */}
          <div className="opacity-60 pointer-events-none">
            <Field label="Email (Cannot be changed)" value={form.email} onChange={() => { }} type="email" />
          </div>
          <Field label="Job Title" value={form.jobTitle} onChange={(v) => setForm(f => ({ ...f, jobTitle: v }))} placeholder="e.g. React Developer" />
          <Field label="Years of Experience" value={String(form.yearsOfExperience)}
            onChange={(v) => setForm(f => ({ ...f, yearsOfExperience: Number(v) }))} type="number" />
        </EditModal>
      )}

      {/* ── Edit: Bio ── */}
      {editMode === 'bio' && (
        <EditModal title="Edit Bio" onClose={() => setEditMode(null)} onSave={handleSave} saving={saving}>
          <Field label="Bio" value={form.bio} onChange={(v) => setForm(f => ({ ...f, bio: v }))}
            type="textarea" placeholder="Tell students about yourself..." />
        </EditModal>
      )}

      {/* ── Edit: Links ── */}
      {editMode === 'links' && (
        <EditModal title="Edit Links" onClose={() => setEditMode(null)} onSave={handleSave} saving={saving}>
          <Field label="LinkedIn URL" value={form.linkedInLink}
            onChange={(v) => setForm(f => ({ ...f, linkedInLink: v }))} placeholder="https://linkedin.com/in/..." />
          <Field label="GitHub URL" value={form.githubLink}
            onChange={(v) => setForm(f => ({ ...f, githubLink: v }))} placeholder="https://github.com/..." />
        </EditModal>
      )}

    </DashLayout>
  );
};

export default ProfilePage;


