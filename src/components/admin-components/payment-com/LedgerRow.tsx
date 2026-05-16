import type { FC } from 'react';
import type { LedgerRowProps } from '../../../types/admin-role-types/admin-payment.types';

const LedgerRow: FC<LedgerRowProps> = ({ record }) => {
  const {
    userName, userAvatar, email,
    mentorName, mentorshipTitle,
    date, time, amount, platformProfit,
  } = record;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

      {/* User */}
      <td className="py-4 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#e8f3fa] flex-shrink-0 flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[#0f5e8b]">
                {userName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <p className="text-[13px] font-bold text-gray-900 whitespace-nowrap">{userName}</p>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 px-3">
        <span className="text-[12.5px] text-gray-600">{email}</span>
      </td>

      {/* Mentor Name */}
      <td className="py-4 px-3">
        <span className="text-[12.5px] font-semibold text-gray-800">{mentorName}</span>
      </td>

      {/* Mentorship Title */}
      <td className="py-4 px-3">
        <span className="text-[12.5px] text-gray-700">{mentorshipTitle}</span>
      </td>

      {/* Date */}
      <td className="py-4 px-3">
        <p className="text-[12.5px] text-gray-700 font-medium whitespace-nowrap">{date}</p>
        <p className="text-[11px] text-gray-400">{time}</p>
      </td>

      {/* Platform Profit */}
      <td className="py-4 px-3">
        <span className="text-[12.5px] text-gray-700 font-medium">{platformProfit}</span>
      </td>

      {/* Amount */}
      <td className="py-4 pl-3 pr-4">
        <span className="text-[14px] font-bold text-gray-900">{amount}</span>
      </td>
    </tr>
  );
};

export default LedgerRow;