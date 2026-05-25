import type { FC } from 'react';
import type { MentorshipFormData } from '../types';

interface Props {
    formData: MentorshipFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (field: keyof MentorshipFormData, value: MentorshipFormData[keyof MentorshipFormData]) => void;
    fieldErrors: Record<string, string>;
}

export const EntryPeriodFields: FC<Props> = ({ formData, onChange, fieldErrors }) => (
    <div className="space-y-4">
        <div>
            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-2">
                ACCESS DURATION (MONTHS)
            </p>
            <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                min={0}
                step={1}
                className={`w-full min-h-[44px] sm:h-11 px-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white ${fieldErrors.duration ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                    }`}
                placeholder="Enter number of months"
            />
            {fieldErrors.duration && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.duration}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                After purchase, students can access the mentorship for the entered number of months.
            </p>
        </div>
    </div>
);



