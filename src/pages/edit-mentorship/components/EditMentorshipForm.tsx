import type { FC, ChangeEvent, FormEvent } from 'react';
import type { MentorshipFormData } from '../types';

interface EditMentorshipFormProps {
    formData: MentorshipFormData;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e: FormEvent) => void;
    submitting: boolean;
    onCancel: () => void;
}

const EditMentorshipForm: FC<EditMentorshipFormProps> = ({
    formData,
    handleInputChange,
    handleSubmit,
    submitting,
    onCancel,
}) => {
    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter mentorship title"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter mentorship description"
                />
            </div>

            {/* Level */}
            <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                </label>
                <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL_LEVEL">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                </select>
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                </label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                />
            </div>

            {/* Status */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto min-h-[44px] sm:h-11 px-6 py-2.5 rounded-xl sm:rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.98] transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto min-h-[44px] sm:h-11 px-8 py-2.5 rounded-xl sm:rounded-2xl bg-[#154d71] text-white text-sm font-semibold shadow-md hover:bg-[#0f3550] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition"
                >
                    {submitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default EditMentorshipForm;
