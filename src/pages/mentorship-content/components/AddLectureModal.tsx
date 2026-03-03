import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createLecture, updateLecture, type UpdateLecturePayload } from '../../../services/mentorshipsContent';
import ModalOverlay from './ModalOverlay';
import type { ContentItem } from '../types';

interface AddLectureModalProps {
  weekId: number | null;
  editingItem?: ContentItem | null;
  onClose: () => void;
  onSuccess: (title: string, id?: number | string) => void;
}

const AddLectureModal: FC<AddLectureModalProps> = ({ weekId, editingItem, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [lectureUrl, setLectureUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      // Note: we don't have lectureUrl from the item, so it starts empty
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekId || !title.trim() || !lectureUrl.trim()) {
      toast.error('Enter lecture name and video URL');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update mode
        const payload: UpdateLecturePayload = {
          title: title.trim(),
          lectureUrl: lectureUrl.trim(),
        };
        await updateLecture(Number(editingItem.id), payload);
        toast.success('Lecture updated successfully');
        onSuccess(title.trim(), editingItem.id);
      } else {
        // Create mode
        await createLecture({ weekId, title: title.trim(), lectureUrl: lectureUrl.trim() });
        toast.success('Lecture added successfully');
        onSuccess(title.trim());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lecture');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem?.id;

  return (
    <ModalOverlay onClose={onClose} title={isEditing ? 'Edit Lecture' : 'Add Lecture File'}>
      <p className="text-sm text-gray-500 mb-4">
        {isEditing ? 'Update lesson content' : 'Add lesson content below.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* LECTURE NAME</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)] focus:border-transparent"
            placeholder="Enter lecture name..."
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* VIDEO SOURCE</label>
          <input
            type="url"
            value={lectureUrl}
            onChange={(e) => setLectureUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)] focus:border-transparent"
            placeholder="Enter link of video"
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium">
            {isEditing ? 'Cancel' : 'Save as Draft'}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60">
            {submitting ? 'Saving...' : isEditing ? 'Update Lecture' : 'Save Lecture'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default AddLectureModal;



