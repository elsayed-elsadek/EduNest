import type { FC } from 'react';
import type { MentorshipFormData, EntryPeriod } from '../types';

interface Props {
    formData: MentorshipFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (field: keyof MentorshipFormData, value: any) => void;
    fieldErrors: Record<string, string>;
}

export const EntryPeriodFields: FC<Props> = ({ formData, onChange, setFieldValue, fieldErrors }) => (
    <div className="space-y-4">
        <div>
            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-2">
                ENTRY PERIOD
            </p>
            <div className="inline-flex w-full sm:w-auto rounded-full bg-gray-100 p-1 min-h-[44px] sm:min-h-0 items-stretch sm:items-center">
                <button
                    type="button"
                    onClick={() => setFieldValue('entryPeriod', 'LIFETIME' as EntryPeriod)}
                    className={`flex-1 sm:flex-none min-w-0 sm:min-w-[100px] px-4 py-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition touch-manipulation ${formData.entryPeriod === 'LIFETIME'
                            ? 'bg-white text-[#154d71] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Lifetime
                </button>
                <button
                    type="button"
                    onClick={() => setFieldValue('entryPeriod', 'LIMITED' as EntryPeriod)}
                    className={`flex-1 sm:flex-none min-w-0 sm:min-w-[100px] px-4 py-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition touch-manipulation ${formData.entryPeriod === 'LIMITED'
                            ? 'bg-white text-[#154d71] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Limited time
                </button>
            </div>
        </div>

        <div>
            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5 sm:mb-2">
                NUMBER OF MONTH
            </p>
            <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                min={0}
                step={1}
                disabled={formData.entryPeriod !== 'LIMITED'}
                className={`w-full min-h-[44px] sm:h-11 px-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${fieldErrors.duration ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                    }`}
                placeholder="Enter number..."
            />
            {fieldErrors.duration && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.duration}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                After purchase, students can access the mentorship until your selected time.
            </p>
        </div>
    </div>
);



