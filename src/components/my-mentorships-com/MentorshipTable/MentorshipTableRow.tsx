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
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFF4ED] flex items-center justify-center flex-shrink-0">
            <span className="text-xl">{mentorship.icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1C1E] line-clamp-1">{mentorship.title}</h3>
            <p className="text-[11px] text-gray-400 font-medium">Level - {mentorship.level}</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-[#F9A63A] text-[#F9A63A]" />
          <span className="text-sm font-bold text-[#1A1C1E]">{mentorship.rating.toFixed(1)}</span>
        </div>
      </td>

      <td className="py-4 px-6 font-bold text-[#1A1C1E] text-sm">{mentorship.totalEnrolled}</td>
      <td className="py-4 px-6 font-bold text-[#1A1C1E] text-sm">${mentorship.revenue}</td>
      <td className="py-4 px-6 text-sm text-gray-400 font-medium">{mentorship.createdDate}</td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDetails(mentorship.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DCEEFA] text-[#2176AE] hover:bg-[#2176AE] hover:text-white transition-all group"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">Details</span>
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-1.5 rounded-lg border border-[#DCEEFA] text-[#2176AE] hover:bg-gray-50 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white rounded-xl shadow-lg border border-gray-100 focus:outline-none z-50 overflow-hidden">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => onAction('edit', mentorship.id)}
                        className={`${active ? 'bg-gray-50' : ''} flex items-center w-full px-4 py-2 text-xs font-bold text-gray-700 gap-2`}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => onAction('delete', mentorship.id)}
                        className={`${active ? 'bg-red-50' : ''} flex items-center w-full px-4 py-2 text-xs font-bold text-red-600 gap-2`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </td>
    </tr>
  );
};

export default MentorshipTableRow;