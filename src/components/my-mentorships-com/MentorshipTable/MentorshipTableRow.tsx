
import type { FC } from 'react';
import { Fragment } from 'react';
import { Eye, MoreVertical, Star, Edit2, Trash2 } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import type { Mentorship } from '../../../types/mentorship.types';

interface MentorshipTableRowProps {
  mentorship: Mentorship;
  onDetails: (id: string) => void;
  onAction: (type: 'edit' | 'delete', id: string) => void;
}

const MentorshipTableRow: FC<MentorshipTableRowProps> = ({
  mentorship,
  onDetails,
  onAction,
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">

      {/* 1. Mentorship Info */}
      <td className="py-4 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#FFF4ED] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
            <span className="text-base md:text-xl">{mentorship.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[12px] md:text-sm font-bold text-[#1A1C1E] line-clamp-1 leading-tight">
              {mentorship.title}
            </h3>
            <p className="hidden md:block text-[11px] text-gray-400 font-medium mt-0.5">
              {mentorship.level}
            </p>
          </div>
        </div>
      </td>

      {/* 2. Rating */}
      <td className="py-4 px-3 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5">
          <span className="text-[9px] text-gray-400 font-bold md:hidden uppercase">Rating</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#F9A63A] text-[#F9A63A]" />
            <span className="text-[12px] md:text-sm font-bold text-[#1A1C1E]">
              {mentorship.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </td>

      {/* 3. Total Enroll */}
      <td className="hidden sm:table-cell py-4 px-4 md:px-6 font-bold text-[#1A1C1E] text-sm">
        {mentorship.totalEnrolled}
      </td>

      {/* 4. Revenue */}
      <td className="py-4 px-3 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1.5">
          <span className="text-[9px] text-gray-400 font-bold md:hidden uppercase">Revenue</span>
          <span className="text-[12px] md:text-sm font-bold text-[#1A1C1E]">
            ${mentorship.revenue}
          </span>
        </div>
      </td>

      {/* 5. Created Date */}
      <td className="hidden lg:table-cell py-4 px-6 text-sm text-gray-400 font-medium text-nowrap">
        {mentorship.createdDate}
      </td>

      {/* 6. Actions */}
      <td className="py-4 px-4 md:px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDetails(mentorship.id)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DCEEFA] text-[#2176AE] hover:bg-[#2176AE] hover:text-white transition-all"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">Details</span>
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-1.5 rounded-lg border border-[#DCEEFA] text-[#2176AE] hover:bg-gray-50 transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition duration-75 ease-in"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-xl shadow-xl border border-gray-100 focus:outline-none z-50 py-1 overflow-hidden">

                {/* View Details Mobile */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDetails(mentorship.id)}
                      className={`${active ? 'bg-gray-50' : ''} flex md:hidden items-center w-full px-4 py-2.5 text-[11px] font-bold text-gray-700 gap-2`}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  )}
                </Menu.Item>

                {/* Edit Action */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction('edit', mentorship.id)}
                      className={`${active ? 'bg-gray-50' : ''} flex items-center w-full px-4 py-2.5 text-[11px] font-bold text-gray-700 gap-2`}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Mentorship
                    </button>
                  )}
                </Menu.Item>

                {/* Delete Action */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction('delete', mentorship.id)}
                      className={`${active ? 'bg-red-50' : ''} flex items-center w-full px-4 py-2.5 text-[11px] font-bold text-red-600 gap-2`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </td>
    </tr>
  );
};

export default MentorshipTableRow;