import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createTask, updateTask, type UpdateTaskPayload } from '../../../services/mentorshipsContent';
import { formatDateTimeLocal } from '../../../utils/helpers';
import ModalOverlay from './ModalOverlay';
import type { ApiError } from '../../../types/auth';
import type { ContentType, ContentItem } from '../types';

interface AddAssignmentModalProps {
  weekId: number | null;
  editingItem?: ContentItem | null;
  onClose: () => void;
  onSuccess: (item: { type: ContentType; title: string; isDraft?: boolean; id?: number | string }, id?: number | string) => void;
}

const AddAssignmentModal: FC<AddAssignmentModalProps> = ({ weekId, editingItem, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [minPassPoints, setMinPassPoints] = useState(60);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Enter assignment name');
      return;
    }
    if (!weekId || weekId <= 0) {
      toast.error('Invalid module');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update mode
        const payload: UpdateTaskPayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          points: totalPoints || 0,
          passPoints: minPassPoints || 0,
          estimatedMinutes,
          dueAt: deadline ? formatDateTimeLocal(deadline) : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        };
        await updateTask(Number(editingItem.id), payload);
        toast.success('Assignment updated successfully');
        onSuccess({ type: 'assignment', title: title.trim(), isDraft: true, id: editingItem.id });
      } else {
        // Create mode
        await createTask({
          title: title.trim(),
          weekId,
          description: description.trim() || undefined,
          points: totalPoints || 0,
          passPoints: minPassPoints || 0,
          estimatedMinutes,
          dueAt: deadline ? formatDateTimeLocal(deadline) : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
          status: 'DRAFT',
        });
        toast.success('Assignment created successfully');
        onSuccess({ type: 'assignment', title: title.trim(), isDraft: true });
      }
    } catch (err) {
      const serverError = (err as ApiError).errorMessages?.error;
      toast.error(
        serverError || (err instanceof Error ? err.message : 'Failed to save assignment')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem?.id;

  return (
    <ModalOverlay onClose={onClose} title={isEditing ? 'Edit Assignment' : 'Add Assignment'}>
      <p className="text-sm text-gray-500 mb-4">
        {isEditing ? 'Update assignment details' : 'Please add assignment contents below.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* ASSIGNMENT NAME</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
            placeholder="Enter assignment name....."
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ADD DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
            placeholder="Enter assignment description......."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">DEADLINE</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">TOTAL POINTS</label>
            <input
              type="number"
              min={0}
              value={totalPoints}
              onChange={(e) => setTotalPoints(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
              placeholder="Set total points"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MINIMUM PASS POINTS</label>
            <input
              type="number"
              min={0}
              value={minPassPoints}
              onChange={(e) => setMinPassPoints(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
              placeholder="Set pass points"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ESTIMATED MINUTES (optional)</label>
          <input
            type="number"
            min={0}
            value={estimatedMinutes ?? ''}
            onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
            placeholder="e.g. 120"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ATTACHMENT URL (optional)</label>
          <input
            type="url"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#154d71]"
            placeholder="Link to file"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50"
          >
            {isEditing ? 'Cancel' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#154d71] text-white font-medium disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Assignment' : 'Save Assignment'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default AddAssignmentModal;
