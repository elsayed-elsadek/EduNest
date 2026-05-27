import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createTask as createTaskApi, updateTask, type UpdateTaskPayload } from '../../../../services/mentorshipsContent';
import { formatDateTimeLocal } from '../../../../utils/helpers';
import ModalOverlay from './ModalOverlay';
import type { ApiError } from '../../../../types/auth';
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
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
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
        // Create mode - pass file if selected
        await createTaskApi({
          title: title.trim(),
          weekId,
          description: description.trim() || undefined,
          points: totalPoints || 0,
          passPoints: minPassPoints || 0,
          estimatedMinutes,
          dueAt: deadline ? formatDateTimeLocal(deadline) : undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
          status: 'DRAFT',
        }, attachmentFile || undefined);
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
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Enter assignment name....."
            maxLength={50}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ADD DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
           maxLength={50}
            placeholder="Enter assignment description......."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">DEADLINE</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
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
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="e.g. 120"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ATTACHMENT (optional)</label>
          <div className="space-y-2">
            {/* URL Input */}
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => {
                setAttachmentUrl(e.target.value);
                if (e.target.value) setAttachmentFile(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
              placeholder="Link to file (e.g., Google Drive)"
            />
            {/* OR separator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            {/* File Upload */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentFile(file);
                      setAttachmentUrl('');
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
            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Assignment' : 'Save Assignment'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default AddAssignmentModal;

