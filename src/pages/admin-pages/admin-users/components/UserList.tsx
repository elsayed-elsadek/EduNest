import React, { useState, useEffect } from 'react';
import type { UserSummaryData } from '../../../../types/admin-role-types/admin-dash.types';
import { Mail, Award, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown, Eye, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../services/api';

interface UserListProps {
  users: UserSummaryData[];
  selectedUser: UserSummaryData | null;
  setSelectedUser: (user: UserSummaryData) => void;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSendEmailClick?: (user: UserSummaryData) => void;
  onAssignBadgeClick?: (user: UserSummaryData) => void;
  onShowBadgesClick?: (user: UserSummaryData) => void;
  onRemoveBadgeClick?: (user: UserSummaryData) => void;
}



const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  setSelectedUser,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSendEmailClick,
  onAssignBadgeClick,
  onShowBadgesClick,
  onRemoveBadgeClick
}) => {


  const [mainFilter, setMainFilter] = useState<'All' | 'Mentors' | 'Students' | 'Banned'>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | 'MENTOR' | 'STUDENT'>('All');
  const [statusFilter, setStatusFilter] = useState<'Any' | 'Active' | 'Inactive'>('Any');
  const [activeMenuUserId, setActiveMenuUserId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuUserId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // تصفية دقيقة وآمنة لعدم إخفاء البيانات القادمة من الـ API
  const filteredUsers = users.filter(user => {
    // 1. الفلتر الرئيسي العلوي
    if (mainFilter === 'Mentors' && user.roleName !== 'MENTOR') return false;
    if (mainFilter === 'Students' && user.roleName !== 'STUDENT') return false;
    if (mainFilter === 'Banned' && user.enabled !== false) return false;

    // 2. فلاتر القوائم المنسدلة (Dropdowns)
    if (roleFilter !== 'All' && user.roleName !== roleFilter) return false;
    if (statusFilter === 'Active' && user.enabled !== true) return false;
    if (statusFilter === 'Inactive' && user.enabled !== false) return false;

    return true;
  });

  return (
    <>
      {/* Filters Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex gap-2 border-b border-slate-100 pb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          {(['All', 'Mentors', 'Students', 'Banned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setMainFilter(f)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${mainFilter === f
                ? 'bg-primary-50 text-primary-500'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {f === 'All'
                ? `All Users (${totalElements})`
                : f === 'Mentors'
                ? `Mentors (${users.filter(u => u.roleName === 'MENTOR').length})`
                : f === 'Students'
                ? `Students (${users.filter(u => u.roleName === 'STUDENT').length})`
                : `Banned (${users.filter(u => !u.enabled).length})`}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <div className="relative flex-1 sm:flex-none min-w-[120px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'All' | 'MENTOR' | 'STUDENT')}
              className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer outline-none appearance-none bg-white pr-8"
            >
              <option value="All">All Roles</option>
              <option value="MENTOR">Mentor</option>
              <option value="STUDENT">Student</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Any' | 'Active' | 'Inactive')}
              className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer outline-none appearance-none bg-white pr-8"
            >
              <option value="Any">Any Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Users List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
        
        {/* الصف المطلوب تماماً (Header Row) - Hidden below md breakpoint */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 text-xs font-bold text-slate-400 tracking-wider bg-slate-50/50">
          <div className="col-span-6">USER DETAILS</div>
          <div className="col-span-3">STATUS</div>
          <div className="col-span-3">ACTION</div>
        </div>

        {/* عرض خلايا الـ allUsersPaginated مباشرة بالأسفل هنا */}
        <div className="flex-1 overflow-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 transition-all cursor-pointer hover:bg-slate-50/80 ${
                  selectedUser?.id === user.id
                    ? 'bg-slate-50 border-l-4 border-l-primary-500 shadow-sm'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                {/* Desktop View Columns (md and up) */}
                {/* 1. تفاصيل المستخدم (USER DETAILS) */}
                <div className="hidden md:flex col-span-6 items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200/60 shadow-sm">
                    {user.profileImageUrl ? (
                      <img 
                        src={`${API_BASE_URL}${user.profileImageUrl}`} 
                        alt={user.firstName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-sm">
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                      {user.email}
                    </p>
                    <div className="mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        user.roleName === 'MENTOR' 
                          ? 'text-sky-600 bg-sky-50 border border-sky-100' 
                          : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                      }`}>
                        {user.roleName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. الحالة (STATUS) */}
                <div className="hidden md:flex col-span-3 items-center">
                  {user.enabled ? (
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
                      Inactive
                    </span>
                  )}
                </div>

                {/* 3. العمليات (ACTION) */}
                <div className="hidden md:flex col-span-3 items-center gap-4 text-slate-400">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAssignBadgeClick) {
                        onAssignBadgeClick(user);
                      }
                    }}
                    className="hover:text-primary-500 transition-colors p-1 hover:bg-slate-100 rounded"
                  >
                    <Award size={18} />
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSendEmailClick) {
                        onSendEmailClick(user);
                      }
                    }}
                    className="hover:text-primary-500 transition-colors p-1 hover:bg-slate-100 rounded"
                  >
                    <Mail size={18} />
                  </button>

                  <div className="relative group inline-block text-left">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id);
                      }}
                      className="hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded flex items-center justify-center"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 transition-all duration-200 transform origin-top-right ${
                        activeMenuUserId === user.id 
                          ? 'visible opacity-100 scale-100 pointer-events-auto' 
                          : 'invisible lg:group-hover:visible opacity-0 lg:group-hover:opacity-100 scale-95 lg:group-hover:scale-100 pointer-events-none lg:group-hover:pointer-events-auto'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveMenuUserId(null);
                          if (onShowBadgesClick) onShowBadgesClick(user);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Eye size={14} className="text-slate-400" />
                        Show Badges
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuUserId(null);
                          if (onRemoveBadgeClick) onRemoveBadgeClick(user);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} className="text-rose-400" />
                        Remove Badge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile View Card (below md breakpoint) */}
                <div className="flex md:hidden col-span-12 flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200/60 shadow-xs">
                        {user.profileImageUrl ? (
                          <img 
                            src={`${API_BASE_URL}${user.profileImageUrl}`} 
                            alt={user.firstName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-sm">
                            {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate max-w-[170px] xs:max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      user.roleName === 'MENTOR' 
                        ? 'text-sky-600 bg-sky-50 border border-sky-100' 
                        : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                    }`}>
                      {user.roleName}
                    </span>
                  </div>

                  <div className="h-[1px] bg-slate-100 w-full" />

                  <div className="flex items-center justify-between">
                    {/* Status Badge */}
                    <div>
                      {user.enabled ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 text-slate-400">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAssignBadgeClick) {
                            onAssignBadgeClick(user);
                          }
                        }}
                        className="hover:text-primary-500 hover:bg-slate-100 transition-colors p-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center"
                        title="Assign Badge"
                      >
                        <Award size={16} />
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSendEmailClick) {
                            onSendEmailClick(user);
                          }
                        }}
                        className="hover:text-primary-500 hover:bg-slate-100 transition-colors p-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center"
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>

                      <div className="relative group inline-block text-left">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id);
                          }}
                          className="hover:text-slate-700 hover:bg-slate-100 transition-colors p-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 transition-all duration-200 transform origin-top-right ${
                            activeMenuUserId === user.id 
                              ? 'visible opacity-100 scale-100 pointer-events-auto' 
                              : 'invisible lg:group-hover:visible opacity-0 lg:group-hover:opacity-100 scale-95 lg:group-hover:scale-100 pointer-events-none lg:group-hover:pointer-events-auto'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveMenuUserId(null);
                              if (onShowBadgesClick) onShowBadgesClick(user);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Eye size={14} className="text-slate-400" />
                            Show Badges
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuUserId(null);
                              if (onRemoveBadgeClick) onRemoveBadgeClick(user);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={14} className="text-rose-400" />
                            Remove Badge
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              No users found matching the selected filters.
            </div>
          )}
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/30">
          <span>
            Showing {totalElements === 0 ? 0 : page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements} users
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default UserList;