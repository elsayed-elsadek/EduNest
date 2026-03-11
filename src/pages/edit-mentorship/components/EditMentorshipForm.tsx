import type { FC, ChangeEvent, FormEvent } from 'react';
import { Book, FileText, Tag, Zap, Clock, DollarSign, CheckCircle2, Hash, Info } from 'lucide-react';
import type { MentorshipFormData } from '../types';

interface EditMentorshipFormProps {
    formData: MentorshipFormData;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayInputChange: (arrayName: 'whatWillLearn' | 'tags', value: string) => void;
    handleSubmit: (e: FormEvent) => void;
    submitting: boolean;
    onCancel: () => void;
}

const EditMentorshipForm: FC<EditMentorshipFormProps> = ({
    formData,
    handleInputChange,
    handleArrayInputChange,
    handleSubmit,
    submitting,
    onCancel,
}) => {
    const inputBaseClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white";
    const labelClasses = "block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2";
    const helperTextClasses = "text-xs text-gray-500 mt-1.5 flex items-center gap-1.5";
    const iconClasses = "w-4 h-4 text-gray-600";

    return (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            {/* Section: Basic Information */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Basic Information
                </h3>
                
                {/* Title */}
                <div className="mb-6">
                    <label htmlFor="title" className={labelClasses}>
                        <Book className={iconClasses} />
                        <span>Title *</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className={inputBaseClasses}
                        placeholder="Advanced React Development with TypeScript"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className={labelClasses}>
                        <FileText className={iconClasses} />
                        <span>Description</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`${inputBaseClasses} resize-none`}
                        placeholder="Learn modern React patterns, hooks, state management, and build production-ready applications. This comprehensive course covers everything from basics to advanced concepts."
                    />
                    <p className={helperTextClasses}>
                        <Info size={14} />
                        <span>Be detailed about your mentorship content and learning goals</span>
                    </p>
                </div>
            </div>

            {/* Section: Program Details */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    Program Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Category */}
                    <div>
                        <label htmlFor="category" className={labelClasses}>
                            <Tag className={iconClasses} />
                            <span>Category</span>
                        </label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={inputBaseClasses}
                            placeholder="Web Development"
                        />
                    </div>

                    {/* Difficulty Level */}
                    <div>
                        <label htmlFor="difficultyLevel" className={labelClasses}>
                            <Zap className={iconClasses} />
                            <span>Difficulty Level</span>
                        </label>
                        <select
                            id="difficultyLevel"
                            name="difficultyLevel"
                            value={formData.difficultyLevel}
                            onChange={handleInputChange}
                            className={`${inputBaseClasses} appearance-none cursor-pointer`}
                        >
                            <option value="ALL_LEVEL">All Levels</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="EXPERT">Expert</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Duration */}
                    <div>
                        <label htmlFor="duration" className={labelClasses}>
                            <Clock className={iconClasses} />
                            <span>Duration (hours)</span>
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            className={inputBaseClasses}
                            placeholder="24"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className={labelClasses}>
                            <DollarSign className={`${iconClasses} text-green-600`} />
                            <span>Price</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={inputBaseClasses}
                                placeholder="99.99"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Learning Outcomes */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                    Learning Outcomes
                </h3>

                {/* What Will Learn */}
                <div className="mb-6">
                    <label htmlFor="whatWillLearn" className={labelClasses}>
                        <CheckCircle2 className={iconClasses} />
                        <span>What Will Students Learn?</span>
                    </label>
                    <textarea
                        id="whatWillLearn"
                        value={formData.whatWillLearn.join(', ')}
                        onChange={(e) => handleArrayInputChange('whatWillLearn', e.target.value)}
                        rows={3}
                        className={`${inputBaseClasses} resize-none`}
                        placeholder="Master React Hooks, TypeScript Best Practices, State Management with Redux, Build Real-world Projects"
                    />
                    <p className={helperTextClasses}>
                        <span>→</span>
                        <span>Separate items with commas for better organization</span>
                    </p>
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className={labelClasses}>
                        <Hash className={iconClasses} />
                        <span>Tags</span>
                    </label>
                    <textarea
                        id="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleArrayInputChange('tags', e.target.value)}
                        rows={2}
                        className={`${inputBaseClasses} resize-none`}
                        placeholder="React, TypeScript, JavaScript, Frontend, Web Development"
                    />
                    <p className={helperTextClasses}>
                        <span>→</span>
                        <span>Help students discover your mentorship with relevant tags</span>
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm bg-white hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all duration-200 shadow-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-[var(--primary-dark)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <span className="inline-block animate-spin">⏳</span>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <span>✓</span>
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default EditMentorshipForm;



