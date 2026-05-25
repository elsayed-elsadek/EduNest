import type { FC } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, User, Medal } from 'lucide-react';
import { useMentorshipLeaderboard } from '../../../../services/student-roleService/mentorshipLeaderboard.api';
// import { getImageUrl } from '../../../../utils/imageUtils';
import LeaderboardRow from './components/LeaderboardRow';
import api from '../../../../services/api';

const LeaderBoard: FC = () => {
  const { mentorshipId } = useParams();
  const normalizedId = Number(mentorshipId ?? '');
  const hasValidId = Number.isFinite(normalizedId) && normalizedId > 0;

  const { data, isLoading } = useMentorshipLeaderboard(normalizedId, hasValidId);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasValidId) {
    return (
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 shadow-sm">
        <p className="text-lg font-semibold">Invalid mentorship ID</p>
        <p className="mt-2 text-sm">Please verify the mentorship link and try again.</p>
      </div>
    );
  }

  const allStudents = data?.leaderboard.content || [];
  const topThree = allStudents.slice(0, 3);
  const remainingStudents = allStudents.filter(student =>
    student.studentFullName.toLowerCase().includes(searchTerm.toLowerCase())
  ); 

  // Helper for Podium UI - standardized fonts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPodiumCard = (student: any, rank: number, isWinner = false, orderClass = '') => (
    <div className={`relative flex flex-col items-center text-center transition-all duration-500 w-full max-w-[320px] ${orderClass} ${
      isWinner 
        ? 'bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border-4 border-[var(--primary-500)] shadow-2xl scale-105 p-6 sm:p-8 z-20 md:-mb-6' 
        : 'bg-white text-slate-900 rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 z-10'
    }`}>
      <div className="flex flex-col items-center mb-6 relative pt-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold absolute -top-12 z-10 shadow-md ${
          isWinner ? 'bg-yellow-400 text-gray-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {isWinner ? (
            <Medal className="text-gray-600 w-5 h-5" />
          ) : ( 
            <span className="text-sm font-bold">#{rank}</span>
          )}
        </div>
        <div className={`h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl ring-4 ${
          isWinner ? 'ring-[var(--primary-500)]/50 bg-gradient-to-br from-slate-800 to-slate-900' : 'ring-slate-100 bg-slate-100'
        }`}>
          {student.studentProfileImageUrl ? (
            <img src={student.studentProfileImageUrl!.startsWith('http') ?
               student.studentProfileImageUrl 
               : `${api.defaults.baseURL?.replace(/\/api\/v1\/?$/, '')?.replace(/\/$/, '')
                 || 'http://localhost:8080'}${student.studentProfileImageUrl}`}
                  alt={student.studentFullName}
                   className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
              <User className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className={`text-lg sm:text-xl font-bold leading-tight truncate max-w-[240px] ${isWinner ? 'text-white' : 'text-slate-900'}`}>
          {student.studentFullName}
        </h3>
        <p className={`text-xs font-semibold mt-1 uppercase tracking-wide ${
          isWinner ? 'text-slate-300' : 'text-slate-500'
        }`}>
          {student.studentLevel || 'Scholar'}
        </p>
      </div>

      <div className={`grid grid-cols-2 gap-4 pt-6 border-t w-full ${
        isWinner ? 'border-slate-700' : 'border-slate-100'
      }`}>
        <div>
          {/* تعديل هنا من الباك اند */}
          <p className="text-xl sm:text-2xl font-bold truncate">{student.lastBadgeTitle || '0'}</p>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 truncate">{student.lastBadgeCategory || 'No Badge'}</p>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold truncate">{student.totalPoints.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Points</p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="leaderboard" className="bg-[#F8FAFC] min-h-screen py-10 px-4">
      <div className=" mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-100 pb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary-500)]">Global Academic Standings</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mt-2">Scholarly Excellence Leaderboard</h2>
          </div>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="bg-white rounded-3xl border border-slate-100 px-4 sm:px-6 py-3 sm:py-4 text-center shadow-sm flex-1 sm:flex-none min-w-[100px] sm:min-w-[130px]">
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{isLoading ? '—' : data?.totalStudents ?? '0'}</p>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Total Scholars</p>
            </div>
            <div className="bg-slate-950 rounded-3xl px-4 sm:px-6 py-3 sm:py-4 text-center shadow-xl flex-1 sm:flex-none min-w-[100px] sm:min-w-[130px]">
              <p className="text-xl sm:text-2xl font-bold text-white">#{isLoading ? '—' : data?.userRank ?? '-'}</p>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Your Rank</p>
            </div>
          </div>
        </div> 

        {/* Podium */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 pt-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 w-full max-w-[300px] bg-white rounded-[2.5rem] animate-pulse" />)
          ) : (
            <>
              {topThree[1] && renderPodiumCard(topThree[1], 2, false, 'order-2 md:order-1')}
              {topThree[0] && renderPodiumCard(topThree[0], 1, true, 'order-1 md:order-2')}
              {topThree[2] && renderPodiumCard(topThree[2], 3, false, 'order-3 md:order-3')}
            </>
          )}
        </div>

        {/* Table Contributors */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[var(--primary-500)] rounded-full" /> Top Contributors
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contributors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">
                <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-semibold">Loading leaderboard...</p>
              </div>
            ) : remainingStudents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No contributors yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {searchTerm ? `No contributors match "${searchTerm}"` : 'Be the first to contribute!'}
                </p>
              </div>
            ) : (
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 sm:px-6 py-4 text-left font-bold">Rank</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold">Scholar</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold hidden md:table-cell">Badge</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold hidden sm:table-cell">Category</th>
                    <th className="px-4 sm:px-6 py-4 text-right font-bold">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {remainingStudents.map((student) => (
                    <LeaderboardRow 
                      key={student.studentEmail} 
                      student={{ ...student, rank: allStudents.findIndex(s => s.studentEmail === student.studentEmail) +1 }} 
                      highlight={data?.currentUser?.studentEmail === student.studentEmail} 
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div> 
      </div>
    </section>
  );
};

export default LeaderBoard;