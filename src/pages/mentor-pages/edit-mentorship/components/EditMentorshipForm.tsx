import type { FC, ChangeEvent, FormEvent } from 'react';
import { useState, useRef } from 'react';
import {
    Upload,
    Edit3,
    CheckCircle2,
    X,
    Plus,
    Sparkles,
    MousePointer2,
    ChevronDown,
    Image as ImageIcon
} from 'lucide-react';
import type { MentorshipFormData } from '../types';

interface EditMentorshipFormProps {
    formData: MentorshipFormData;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleAddArrayItem: (arrayName: 'whatWillLearn' | 'tags', value: string) => void;
    handleRemoveArrayItem: (arrayName: 'whatWillLearn' | 'tags', index: number) => void;
    handleImageChange: (file: File | null) => void;
    handleSubmit: (e: FormEvent) => void;
    submitting: boolean;
    onCancel: () => void;
}

const EditMentorshipForm: FC<EditMentorshipFormProps> = ({
    formData,
    handleInputChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleImageChange,
    handleSubmit,
    submitting,
}) => {
    // Local UI states
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);

    const [newLearn, setNewLearn] = useState('');
    const [isAddingLearn, setIsAddingLearn] = useState(false);

    const [newTag, setNewTag] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleLearnSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        if (newLearn.trim()) {
            handleAddArrayItem('whatWillLearn', newLearn);
            setNewLearn('');
        }
        setIsAddingLearn(false);
    };

    const handleTagSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        if (newTag.trim()) {
            handleAddArrayItem('tags', newTag);
            setNewTag('');
        }
        setIsAddingTag(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">

            {/* Header / Cover Image Area */}
            <div className="relative w-full h-[320px] rounded-3xl bg-gray-100 mb-8 mt-2 shadow-sm border border-gray-200 flex items-center justify-center overflow-visible">
                {formData.coverImageUrl ? (
                    <img
                        src={formData.coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover rounded-3xl"
                    />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 cursor-pointer"
                      onClick={() => imageInputRef.current?.click()}
                    >
                        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                        <span className="font-medium text-lg">No cover image uploaded</span>
                        
                    </div>
                )}

                {/* Floating Upload Button */}
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="absolute -right-6 -bottom-6 w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:scale-105 transition-transform border border-gray-100 group z-10"
                    title="Change Cover Image"
                >
                    <Upload className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                </button>
                <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleImageChange(e.target.files[0]);
                        }
                    }}
                />
            </div>

            {/* Main Content: 2 Column Layout */}
            <div className="flex flex-col lg:flex-row gap-10">

                {/* Left Column: Title, Description, What to learn, Tags */}
                <div className="flex-1 flex flex-col gap-8">

                    {/* Title Section */}
                    <div>
                        <div className="flex items-center gap-3">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    onBlur={() => setIsEditingTitle(false)}
                                    autoFocus
                                    className="text-3xl font-bold text-gray-900 border-b-2 border-primary focus:outline-none bg-transparent w-full"
                                    placeholder="Mentorship Title"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {formData.title || "Untitled Mentorship"}
                                </h1>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsEditingTitle(!isEditingTitle)}
                                className="text-gray-500 hover:text-primary transition-colors"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-2 w-full">
                                <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Description
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingDesc(!isEditingDesc)}
                                        className="text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </span>
                                {isEditingDesc ? (
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        onBlur={() => setIsEditingDesc(false)}
                                        autoFocus
                                        rows={4}
                                        className="text-gray-700 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Mentorship Description"
                                    />
                                ) : (
                                    <p className="text-gray-700 leading-relaxed max-w-3xl">
                                        {formData.description || "No description provided."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* What Student Will Learn Section */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4">What Student Will Learn</h2>
                        <div className="flex flex-wrap gap-4">
                            {formData.whatWillLearn.map((item, idx) => (
                                <div key={idx} className="relative bg-white border border-[#e2e8f0] rounded-xl pl-12 pr-6 py-4 min-w-[200px] shadow-sm flex items-center">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-gray-800 text-sm font-medium pr-4">{item}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveArrayItem('whatWillLearn', idx)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Button / Input */}
                            <div className="flex items-center">
                                {isAddingLearn ? (
                                    <input
                                        type="text"
                                        value={newLearn}
                                        onChange={(e) => setNewLearn(e.target.value)}
                                        onBlur={handleLearnSubmit}
                                        onKeyDown={handleLearnSubmit}
                                        autoFocus
                                        className="border-2 border-primary rounded-full px-4 py-2 text-sm focus:outline-none w-[200px]"
                                        placeholder="Type and press Enter..."
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLearn(true)}
                                        className="border border-gray-300 bg-gray-50 text-primary hover:bg-[var(--primary-500)] hover:bg-opacity-10 hover:text-white transition-colors rounded-full px-4 py-2 flex items-center gap-1 font-medium text-sm h-10"
                                    >
                                        <Plus className="w-4 h-4" /> Add new
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4 mt-4">Tags</h2>
                        <div className="flex flex-wrap gap-3">
                            {formData.tags.map((tag, idx) => (
                                <div key={idx} className="border border-[#cbd5e1] rounded-full px-4 py-1.5 flex items-center justify-between gap-2 shadow-sm bg-white">
                                    <span className="text-gray-700 text-sm font-medium">{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveArrayItem('tags', idx)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Button / Input */}
                            <div className="flex items-center">
                                {isAddingTag ? (
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onBlur={handleTagSubmit}
                                        onKeyDown={handleTagSubmit}
                                        autoFocus
                                        className="border-2 border-primary rounded-full px-4 py-1.5 text-sm focus:outline-none w-[150px]"
                                        placeholder="Add tag..."
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingTag(true)}
                                        className="border border-gray-300 bg-gray-50 text-primary hover:bg-[var(--primary-500)] hover:bg-opacity-10 hover:text-white transition-colors rounded-full px-4 py-1.5 flex items-center gap-1 font-medium text-sm shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add new
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Details Card */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-6">

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-primary font-bold flex items-center gap-1.5 text-lg">
                                Details
                                <span className="bg-yellow-100 p-1 rounded-md inline-flex">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                </span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditingDetails(!isEditingDetails)}
                                className="text-gray-600 font-medium text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                {isEditingDetails ? "Done" : "Edit Details"}
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">

                            {/* Category */}
                            <div className="flex items-center border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3 w-1/3 text-gray-800 font-semibold text-sm">
                                    <MousePointer2 className="w-4 h-4 text-gray-500" />
                                    Category
                                </div>
                                <div className="w-2/3 flex items-center justify-between pl-4">
                                    {isEditingDetails ? (
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full border-b border-primary focus:outline-none text-sm text-gray-600 bg-gray-50 py-1"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-600 truncate">: {formData.category || "Uncategorized"}</span>
                                    )}
                                    {!isEditingDetails && <ChevronDown className="w-4 h-4 text-gray-800" />}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3 w-1/3 text-gray-800 font-semibold text-sm">
                                    <MousePointer2 className="w-4 h-4 text-gray-500" />
                                    Price
                                </div>
                                <div className="w-2/3 flex items-center justify-between pl-4">
                                    {isEditingDetails ? (
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full border-b border-primary focus:outline-none text-sm text-gray-600 bg-gray-50 py-1"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-600 truncate">: {formData.price ? `$${formData.price}` : "Free"}</span>
                                    )}
                                    {!isEditingDetails && <ChevronDown className="w-4 h-4 text-gray-800" />}
                                </div>
                            </div>

                            {/* Level */}
                            <div className="flex items-center border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3 w-1/3 text-gray-800 font-semibold text-sm">
                                    <MousePointer2 className="w-4 h-4 text-gray-500" />
                                    Level
                                </div>
                                <div className="w-2/3 flex items-center justify-between pl-4">
                                    {isEditingDetails ? (
                                        <select
                                            name="difficultyLevel"
                                            value={formData.difficultyLevel}
                                            onChange={handleInputChange}
                                            className="w-full border-b border-primary focus:outline-none text-sm text-gray-600 bg-gray-50 py-1"
                                        >
                                            <option value="ALL_LEVEL">All Levels</option>
                                            <option value="BEGINNER">Beginner</option>
                                            <option value="INTERMEDIATE">Intermediate</option>
                                            <option value="EXPERT">Expert</option>
                                        </select>
                                    ) : (
                                        <span className="text-sm text-gray-600 truncate">: {formData.difficultyLevel === 'ALL_LEVEL' ? 'All Levels' : formData.difficultyLevel.charAt(0) + formData.difficultyLevel.slice(1).toLowerCase()}</span>
                                    )}
                                    {!isEditingDetails && <ChevronDown className="w-4 h-4 text-gray-800" />}
                                </div>
                            </div>

                            {/* Duration / Expiry Period */}
                            <div className="flex items-center">
                                <div className="flex items-center gap-3 w-[45%] text-gray-800 font-semibold text-sm">
                                    <MousePointer2 className="w-4 h-4 text-gray-500" />
                                    Expiry Period
                                </div>
                                <div className="w-[55%] flex items-center justify-between pl-2">
                                    {isEditingDetails ? (
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            placeholder="Months"
                                            className="w-full border-b border-primary focus:outline-none text-sm text-gray-600 bg-gray-50 py-1"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-600 truncate">: {formData.duration ? `${formData.duration} Months` : "--"}</span>
                                    )}
                                    {!isEditingDetails && <ChevronDown className="w-4 h-4 text-gray-800" />}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end mt-4 lg:-mt-12">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 flex items-center gap-2 z-10"
                >
                    {submitting ? (
                        <>
                            <span className="animate-spin inline-block">⏳</span>
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>

        </form>
    );
};

export default EditMentorshipForm;
