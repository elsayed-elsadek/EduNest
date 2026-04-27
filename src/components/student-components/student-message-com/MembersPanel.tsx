import { useEffect, useState, type FC } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { getRoomMembers, type RoomMemberDto } from '../../../services/Roomchatservice';

interface Props {
  roomId: number;
  roomName: string;
  creatorEmail?: string;
  myEmail: string;
  onClose: () => void;
  onDeleteRoom?: () => void;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const roleColor = (role: string) =>
  role?.toLowerCase() === 'mentor'
    ? 'bg-[#E8F3FF] text-[#2D9CDB]'
    : 'bg-gray-100 text-gray-500';

const MembersPanel: FC<Props> = ({
  roomId,
  roomName,
  creatorEmail,
  myEmail,
  onClose,
  onDeleteRoom,
}) => {
  const [members, setMembers] = useState<RoomMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getRoomMembers(roomId)
      .then(res => setMembers(res.apiResponse?.members ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [roomId]);

  const isCreator = creatorEmail && myEmail && creatorEmail === myEmail;

  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-white border-l border-gray-100 shadow-xl flex flex-col z-20">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Members</h3>
          <p className="text-xs text-gray-400 truncate">{roomName}</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <span className="w-6 h-6 border-2 border-[#2D9CDB] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <AlertTriangle className="w-10 h-10" />
            <p className="text-sm">Failed to load members</p>
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">No members found</p>
        )}

        {!loading &&
          !error &&
          members.map(m => {
            const fullName = `${m.firstName} ${m.lastName}`.trim() || m.email;
            const initials =
              (`${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase() ||
                m.email[0].toUpperCase());
            const src = m.userImageUrl
              ? m.userImageUrl.startsWith('http')
                ? m.userImageUrl
                : `${BASE_URL}${m.userImageUrl}`
              : null;

            return (
              <div
                key={m.userId ?? m.email}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  {src ? (
                    <img
                      src={src}
                      alt={fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2D9CDB] to-[#1a7bc4] flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                {/* Role */}
                {m.role && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${roleColor(m.role)}`}
                  >
                    {m.role}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 space-y-2">
        {!loading && !error && members.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Delete room — creator only */}
        {isCreator && onDeleteRoom && (
          <>
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="w-full py-2 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </button>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs text-red-500 text-center font-medium">
                  Delete this group? This can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDeleteRoom}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MembersPanel;