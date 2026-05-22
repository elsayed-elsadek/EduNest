import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Users,
  MessageSquare,
  UserPlus,
  CheckCircle,
  Loader2,
  Search,
} from 'lucide-react';

import {
  useMentorshipRooms,
  useJoinRoom,
} from '../../../../services/student-roleService/mentorshipDetails.api';

import { API_BASE_URL } from '../../../../services/api';

interface GroupsModalProps {
  mentorshipId: number;
  onClose: () => void;
}

const GroupsModal: FC<GroupsModalProps> = ({ mentorshipId, onClose }) => {
  const navigate = useNavigate();
  const { data: rooms, isLoading, isError } = useMentorshipRooms(
    mentorshipId,
    true
  );
  const joinRoom = useJoinRoom(mentorshipId);

  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter((r) =>
      r.roomName.toLowerCase().includes(search.toLowerCase())
    );
  }, [rooms, search]);

  const handleJoin = async (roomId: number) => {
    await joinRoom.mutateAsync(roomId);
  };

  const handleViewGroup = (
    roomId: number,
    roomName: string,
    coverImage: string | null
  ) => {
    onClose();
    navigate('/student/messages', {
      state: {
        openRoomById: {
          roomId,
          roomName,
          coverImage: coverImage
            ? `${API_BASE_URL}${coverImage}`
            : undefined,
        },
      },
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-xl
            bg-white
            border border-slate-200
            rounded-2xl shadow-2xl
            overflow-hidden
            flex flex-col
            max-h-[80vh]
            animate-[modalIn_0.2s_ease-out]
          "
        >
          {/* HEADER */}
          <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--primary-500)]" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-base">Study Groups</h2>
                  <p className="text-slate-500 text-xs">Join mentorship communities</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="
                  w-9 h-9 rounded-full
                  bg-slate-100 hover:bg-slate-200
                  flex items-center justify-center
                  text-slate-700 hover:text-slate-900
                  transition
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH */}
            <div className="mt-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="
                  w-full pl-9 pr-3 py-2
                  bg-slate-50 border border-slate-200
                  rounded-lg text-sm text-slate-900
                  outline-none focus:border-[var(--primary-500)]/60
                  placeholder:text-slate-400
                "
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 overflow-y-auto space-y-3">
            {/* LOADING */}
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    <div className="h-2 w-1/3 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}

            {/* ERROR */}
            {isError && (
              <div className="text-center py-10 text-red-500 text-sm">
                Failed to load groups.
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && !isError && filteredRooms.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-10 h-10 mx-auto opacity-30 mb-2 text-slate-400" />
                <p className="text-sm">No groups found</p>
              </div>
            )}

            {/* LIST */}
            {!isLoading &&
              !isError &&
              filteredRooms.map((room) => {
                const coverSrc = room.roomCoverImage
                  ? `${API_BASE_URL}${room.roomCoverImage}`
                  : null;

                return (
                  <div
                    key={room.roomId}
                    className="
                      flex items-center gap-4
                      p-3 rounded-xl
                      bg-white hover:bg-slate-50
                      border border-slate-100 hover:border-slate-200
                      transition
                    "
                  >
                    {/* IMAGE */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          className="w-full h-full object-cover"
                          alt={room.roomName}
                        />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium text-sm truncate">
                        {room.roomName}
                      </p>

                      <p className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                        {room.joined ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Joined
                          </>
                        ) : (
                          'Not joined yet'
                        )}
                      </p>
                    </div>

                    {/* ACTION */}
                    {!room.joined ? (
                      <button
                        disabled={joinRoom.isPending}
                        onClick={() => handleJoin(room.roomId)}
                        className="
                          px-3 py-1.5 text-xs font-semibold
                          rounded-lg
                          bg-[var(--primary-500)] hover:bg-[var(--primary-600)]
                          text-white
                          flex items-center gap-1
                          disabled:opacity-50
                        "
                      >
                        {joinRoom.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                        Join
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleViewGroup(
                            room.roomId,
                            room.roomName,
                            room.roomCoverImage
                          )
                        }
                        className="
                          px-3 py-1.5 text-xs font-semibold
                          rounded-lg
                          bg-emerald-50 hover:bg-emerald-100
                          text-emerald-600
                          border border-emerald-100
                          flex items-center gap-1
                        "
                      >
                        <MessageSquare className="w-3 h-3" />
                        Open
                      </button>
                    )}
                  </div>
                );
              })}
          </div>

          {/* FOOTER */}
          <div className="px-5 py-3 border-t border-slate-100 text-center bg-white">
            <p className="text-[11px] text-slate-500">
              Tip: You can search and join groups instantly 
            </p>
          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default GroupsModal;