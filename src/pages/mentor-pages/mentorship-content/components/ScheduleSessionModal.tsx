import { useState, type FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createLiveSession, updateLiveSession, type UpdateLiveSessionPayload } from '../../../../services/mentorshipsContent';
import ModalOverlay from './ModalOverlay';
import type { ContentItem } from '../types';

interface ScheduleSessionModalProps {
  weekId: number | null;
  editingItem?: ContentItem | null;
  onClose: () => void;
  onSuccess: (title: string, id?: number | string) => void;
}

const ScheduleSessionModal: FC<ScheduleSessionModalProps> = ({ weekId, editingItem, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // فحص إضافي قبل الإرسال
    if (weekId === null || !title.trim() || !date) {
      toast.error('Missing required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update mode
        const payload: UpdateLiveSessionPayload = {
          title: title.trim(),
          date: date.toString(),
          time: {
            hour: Number(hour),
            minute: Number(minute),
            second: 0,
          },
        };
        await updateLiveSession(Number(editingItem.id), payload);
        toast.success('Session updated successfully');
        onSuccess(title.trim(), editingItem.id);
      } else {
        // Create mode
        await createLiveSession({
          title: title.trim(),
          date: date.toString(),
          weekId: Number(weekId),
          time: {
            hour: Number(hour),
            minute: Number(minute),
            second: 0,
            nano: 0,
          },
        });
        toast.success('Session scheduled successfully');
        onSuccess(title.trim());
      }
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const serverErrorMessage = err?.errorMessages?.error;
      toast.error(serverErrorMessage || 'Invalid data sent to server');
      console.error('API Error Response:', err?.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editingItem?.id;

  return (
    <ModalOverlay onClose={onClose} title={isEditing ? 'Edit Session' : 'Schedule Session'}>
      <p className="text-sm text-gray-500 mb-4">
        {isEditing ? 'Update session details below.' : 'Set session details below.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* SESSION TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            placeholder="Enter session title..."
            maxLength={50}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">* DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">HOUR</label>
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MINUTE</label>
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary-from)]"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium">
            {isEditing ? 'Cancel' : 'Cancel'}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-[var(--primary-from)] text-white font-medium disabled:opacity-60">
            {submitting ? 'Saving...' : isEditing ? 'Update Session' : 'Schedule'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export default ScheduleSessionModal;



