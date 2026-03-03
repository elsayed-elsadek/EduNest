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
        });
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
          <label className="block text-xs font-semibold text-gray-500 mb-1">PROJECT DESCRIPTION LINK (PDF/DOC)</label>
          <input
            type="url"
            value={descriptionUrl}
            onChange={(e) => setDescriptionUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Paste PDF/Google Docs link......"
          />
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



