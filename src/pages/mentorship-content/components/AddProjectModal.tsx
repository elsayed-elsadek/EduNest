import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createProject, updateProject, type UpdateProjectPayload } from '../../../services/mentorshipsContent';
import { formatDateTimeLocal } from '../../../utils/helpers';
import ModalOverlay from './ModalOverlay';
import type { ApiError } from '../../../types/auth';
import type { ContentItem } from '../types';

interface AddProjectModalProps {
  weekId: number | null;
  editingItem?: ContentItem | null;
  onClose: () => void;
  onSuccess: (title: string, id?: number | string) => void;
}

const AddProjectModal: FC<AddProjectModalProps> = ({ weekId, editingItem, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [brief, setBrief] = useState('');
  const [descriptionUrl, setDescriptionUrl] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [points, setPoints] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekId || !title.trim() || !goal.trim() || !brief.trim() || !startAt || !endAt) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update mode
        const payload: UpdateProjectPayload = {
          title: title.trim(),
          goal: goal.trim(),
          brief: brief.trim(),
          descriptionUrl: descriptionUrl.trim() || undefined,
          startAt: formatDateTimeLocal(startAt),
          endAt: formatDateTimeLocal(endAt),
          points: points || 0,
        };
        console.log('Updating project', { id: editingItem.id, payload });
        const res = await updateProject(Number(editingItem.id), payload);
        console.log('Update response', res);
        toast.success('Project updated successfully');
        onSuccess(title.trim(), editingItem.id);
      } else {
        // Create mode
        await createProject({
          weekId,
          title: title.trim(),
          goal: goal.trim(),
          brief: brief.trim(),
          descriptionUrl: descriptionUrl.trim() || undefined,
          startAt: formatDateTimeLocal(startAt),
          endAt: formatDateTimeLocal(endAt),
          points: points || 0,
        }, attachmentFile || undefined);
        toast.success('Project added successfully');
        onSuccess(title.trim());
      }
    } catch (err) {
      console.error('Project save error', err);
      const serverError = (err as ApiError).errorMessages?.error || (err as Error).message;
      toast.error(serverError || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem?.id;

  return (
    <ModalOverlay onClose={onClose} title={isEditing ? 'Edit Project' : 'Add Project'}>
      <p className="text-sm text-gray-500 mb-4">
        {isEditing ? 'Update project info below.' : 'Please add project info below.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* PROJECT NAME</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Enter project name........"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* PROJECT GOAL</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Briefly explain the main goal of the project........"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* PROJECT BRIEF</label>
          <input
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Write a brief overview of project's goals and scope"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">PROJECT DESCRIPTION LINK OR ATTACHMENT</label>
          <div className="space-y-2">
            <input
              type="url"
              value={descriptionUrl}
              onChange={(e) => {
                setDescriptionUrl(e.target.value);
                if (e.target.value) setAttachmentFile(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
              placeholder="Paste PDF/Google Docs link......"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentFile(file);
                      setDescriptionUrl('');
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <span className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {attachmentFile ? attachmentFile.name : 'Upload File'}
                </span>
              </label>
              {attachmentFile && (
                <button
                  type="button"
                  onClick={() => setAttachmentFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">* START DATE</label>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">* END DATE</label>
            <input
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* TOTAL POINTS</label>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Set total points"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium">
            {isEditing ? 'Cancel' : 'Save as Draft'}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60">
            {submitting ? 'Saving...' : isEditing ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default AddProjectModal;



