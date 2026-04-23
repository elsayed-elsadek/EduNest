
import { type FC, useState, useEffect } from 'react';
import { X, Plus, Github, Linkedin, Camera } from 'lucide-react';
import type { ProfileData } from '../../../../types/student-role-types/profile.types';

interface EditProfileModalProps {
  isOpen:    boolean;
  profile:   ProfileData;
  saving?:   boolean;
  onClose:   () => void;
  onSave:    (updated: ProfileData) => void;
  onImageChange?: (file: File) => void;
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  saving = false,
  onClose,
  onSave,
  onImageChange,
}) => {
  const [form, setForm]         = useState<ProfileData>(profile);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (isOpen) setForm(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof ProfileData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim().toLowerCase();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImageChange?.(file);
    };
    input.click();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal — fixed size, no scroll */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your scholarly presence</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body (no overflow) ── */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Row 1: Avatar + Name + Role */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0 cursor-pointer group" onClick={handleImageClick}>
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 ring-2 ring-offset-2 ring-[#0c2d48]/20 shadow">
                {form.avatar ? (
                  <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0c2d48] to-blue-400 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {form.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {onImageChange && (
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Name + Role */}
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d48]/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d48]/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Job Title</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => handleChange('role', e.target.value)}
                  placeholder="e.g. Backend Dev"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d48]/20"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Bio */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => handleChange('bio', e.target.value)}
              rows={3}
              placeholder="Briefly describe your research interests and technical background."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d48]/20 resize-none"
            />
          </div>

          {/* Row 3: Skills + Links side by side */}
          <div className="grid grid-cols-2 gap-4">

            {/* Skills */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Skills</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[80px]">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.skills.map(skill => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-[#0c2d48] bg-blue-100 rounded-full"
                    >
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                    placeholder="Add skill..."
                    className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 placeholder:text-gray-400"
                  />
                  <button onClick={handleAddSkill} className="text-[#0c2d48] hover:text-blue-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Links</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Github className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <input
                    type="url"
                    value={form.githubUrl ?? ''}
                    onChange={e => handleChange('githubUrl', e.target.value)}
                    placeholder="GitHub URL"
                    className="flex-1 text-xs bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <input
                    type="url"
                    value={form.linkedinUrl ?? ''}
                    onChange={e => handleChange('linkedinUrl', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="flex-1 text-xs bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer: Save / Cancel ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-[#0c2d48] hover:bg-[#0a2438] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;