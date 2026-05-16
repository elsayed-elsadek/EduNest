import { type FC, useState } from 'react';
import { Landmark, Pencil,  Save } from 'lucide-react';
import type { CommissionSettingsProps } from '../../../types/admin-role-types/adminConfigrations.types';

const CommissionSettings: FC<CommissionSettingsProps> = ({
  platformFee,
  onEdit,
  onSave,
 
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [feeValue,  setFeeValue ] = useState(platformFee);

  const handleEdit = () => {
    setIsEditing(true);
    onEdit();
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(feeValue);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <Landmark className="w-5 h-5 text-[#0f5e8b]" />
        <h3 className="text-base font-bold text-gray-900">Commission Settings</h3>
      </div>

      {/* Fee Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">

        {/* Edit Button (top-right) */}
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#0f5e8b] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}

        {/* Label */}
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
          Platform Fee
        </p>

        {/* Fee Display or Input */}
        {isEditing ? (
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={feeValue}
              min={0}
              max={100}
              step={0.1}
              onChange={(e) => setFeeValue(parseFloat(e.target.value) || 0)}
              className="w-28 px-3 py-1.5 text-3xl font-bold text-gray-900 bg-white border border-[#0f5e8b] rounded-lg outline-none focus:ring-2 focus:ring-[#0f5e8b]/20"
            />
            <span className="text-xl font-bold text-gray-500">%</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-bold text-gray-900">{feeValue}</span>
            <span className="text-xl font-bold text-gray-500">%</span>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Standard operational deduction applied to all institutional revenue streams
          processed through the EduNest ecosystem.
        </p>

       
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0f5e8b] text-white text-sm font-bold rounded-xl hover:bg-[#0a4a6e] transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          Save Commission Settings
        </button>
      </div>
    </div>
  );
};

export default CommissionSettings;