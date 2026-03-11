
import { useState, useRef } from 'react';
import { createRoom } from '../../services/Roomchatservice';

interface Props {
  onClose:   () => void;
  onCreated: () => void;
}

const CreateRoomModal = ({ onClose, onCreated }: Props) => {
  const [roomName,     setRoomName    ] = useState('');
  const [mentorshipId, setMentorshipId] = useState('');
  const [loading,      setLoading     ] = useState(false);
  const [error,        setError       ] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const name = roomName.trim();
    const mid  = Number(mentorshipId.trim());
    if (!name)           { setError('Enter a room name'); return; }
    if (!mid || isNaN(mid)) { setError('Enter a valid Mentorship ID'); return; }

    setLoading(true);
    setError(null);
    try {
      await createRoom(mid, name);
      onCreated();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(msg ?? 'Failed to create room. Check the Mentorship ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create New Group</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. React Study Group"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mentorship ID</label>
            <input
              type="number"
              value={mentorshipId}
              onChange={(e) => setMentorshipId(e.target.value)}
              placeholder="Enter Mentorship ID"
              min={1}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-gray-400 mt-1">
              Only students enrolled in this mentorship can join
            </p>
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !roomName.trim() || !mentorshipId.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#2D9CDB] text-white text-sm font-medium hover:bg-[#2589c3] transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '✓'} Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;