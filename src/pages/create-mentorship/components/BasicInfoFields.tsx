import type { FC } from 'react';
import type { MentorshipFormData } from '../types';
import { levelOptions, categoryOptions } from '../constants';

interface Props {
    formData: MentorshipFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setFieldValue: (field: keyof MentorshipFormData, value: any) => void;
    fieldErrors: Record<string, string>;
}

export const BasicInfoFields: FC<Props> = ({ formData, onChange, setFieldValue, fieldErrors }) => (
    <>
        {/* Title & Description */}
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5 sm:mb-2">
                    MENTORSHIP TITLE
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                    className={`w-full min-h-[44px] sm:h-12 px-4 py-3 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white ${fieldErrors.title ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                        }`}
                    placeholder="Enter title here..."
                />
                {fieldErrors.title && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5 sm:mb-2">
                    MENTORSHIP DESCRIPTION
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                    rows={4}
                    className={`w-full min-h-[120px] px-4 py-3 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white resize-none ${fieldErrors.description ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                        }`}
                    placeholder="Enter description here..."
                />
                {fieldErrors.description && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
                )}
            </div>
        </div>

        {/* Level & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
                <p className="text-xs font-semibold text-gray-500 tracking-wide">
                    LEVEL
                </p>
                {(fieldErrors.level || fieldErrors.difficultyLevel) && (
                    <p className="mb-1 text-xs text-red-600">
                        {fieldErrors.difficultyLevel ?? fieldErrors.level}
                    </p>
                )}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                    {levelOptions.map((option) => {
                        const isActive = formData.level === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFieldValue('level', option.value)}
                                className={`min-h-[44px] sm:min-h-[40px] px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold transition select-none touch-manipulation ${isActive
                                        ? 'bg-primary text-white border-[var(--primary-from)] shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--primary-from)]/40 active:bg-gray-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5 sm:mb-2">
                    CATEGORY
                </p>
                <select
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    className={`w-full min-h-[44px] sm:h-12 px-4 py-2.5 pr-10 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white ${fieldErrors.category ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                        }`}
                >
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {fieldErrors.category && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
                )}
            </div>
        </div>

        {/* Price */}
        <div>
            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5 sm:mb-2">
                MENTORSHIP PRICE ($)
            </p>
            <div className="relative max-w-xs sm:max-w-sm">
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={onChange}
                    min={0}
                    step={0.01}
                    className={`w-full min-h-[44px] sm:h-12 pl-4 pr-12 py-2.5 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white ${fieldErrors.price ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                        }`}
                    placeholder="Enter price here..."
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-gray-400 text-xs sm:text-sm pointer-events-none">
                    USD
                </span>
            </div>
            {fieldErrors.price && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
            )}
        </div>
    </>
);



