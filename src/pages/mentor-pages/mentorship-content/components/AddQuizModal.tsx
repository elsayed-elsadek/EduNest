import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createQuiz, updateQuiz, type UpdateQuizPayload } from '../../../../services/mentorshipsContent';
import ModalOverlay from './ModalOverlay';
import type { ContentItem } from '../types';

interface AddQuizModalProps {
  weekId: number | null;
  editingItem?: ContentItem | null;
  onClose: () => void;
  onSuccess: (title: string, id?: number | string) => void;
}

const AddQuizModal: FC<AddQuizModalProps> = ({ weekId, editingItem, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekId || !title.trim()) {
      toast.error('Enter quiz title');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update mode
        const payload: UpdateQuizPayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes: durationMinutes || 1,
        };
        await updateQuiz(Number(editingItem.id), payload);
        toast.success('Quiz updated successfully');
        onSuccess(title.trim(), editingItem.id);
      } else {
        // Create mode
        await createQuiz({
          weekId,
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes: durationMinutes || 1,
        });
        toast.success('Quiz created successfully');
        onSuccess(title.trim());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem?.id;

  return (
    <ModalOverlay onClose={onClose} title={isEditing ? 'Edit Quiz' : 'Create Quiz'}>
      <p className="text-sm text-gray-500 mb-4">
        {isEditing ? 'Update quiz details' : 'Add questions and set correct answers'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* QUIZ TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Enter quiz name ......"
            maxLength={50}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">QUIZ DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Enter quiz description ......"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* TIME DURATION (minutes)</label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Set time duration"
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium">
            {isEditing ? 'Cancel' : 'Cancel'}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60">
            {submitting ? 'Saving...' : isEditing ? 'Update Quiz' : 'Save'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default AddQuizModal;



