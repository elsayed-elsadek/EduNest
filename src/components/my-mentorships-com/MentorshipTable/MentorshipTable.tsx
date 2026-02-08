
import type { FC } from 'react';
import MentorshipTableRow from './MentorshipTableRow';
import type { Mentorship } from '../../../types/mentorship.types';

interface MentorshipTableProps {
  mentorships: Mentorship[];
  onDetails: (id: string) => void;
  onAction: (type: 'edit' | 'delete', id: string) => void;
}

const MentorshipTable: FC<MentorshipTableProps> = ({ mentorships, onDetails, onAction }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">

      <table className="w-full min-w-[500px] border-collapse text-left">
        <thead className="bg-[#F9FAFB] border-b border-gray-100">
          <tr>
            <th className="py-5 px-4 md:px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[40%] md:w-[30%]">
              Mentorships
            </th>

            <th className="py-5 px-3 md:px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Rating
            </th>
            {/* Total Enroll:  */}
            <th className="hidden sm:table-cell py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Enroll
            </th>
            {/* Revenue:  */}
            <th className="py-5 px-3 md:px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            {/* Created Date: */}
            <th className="hidden lg:table-cell py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Created Date
            </th>
            <th className="py-5 px-4 md:px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 bg-white">
          {mentorships.map((mentorship) => (
            <MentorshipTableRow
              key={mentorship.id}
              mentorship={mentorship}
              onDetails={onDetails}
              onAction={onAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MentorshipTable;