import type { FC, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { useState, useRef } from 'react';
import {
    Upload,
    Edit3,
    CheckCircle2,
    X,
    Plus,
    Sparkles,
    ChevronDown,
    Image as ImageIcon,
    Trash2,
    Tag,
    Layers,
    DollarSign,
    Clock,
    Check
} from 'lucide-react';
import { API_BASE_URL } from '../../../../services/api';
import type { MentorshipFormData } from '../types';

interface EditMentorshipFormProps {
    formData: MentorshipFormData;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleAddArrayItem: (arrayName: 'whatWillLearn' | 'tags', value: string) => void;
    handleRemoveArrayItem: (arrayName: 'whatWillLearn' | 'tags', index: number) => void;
    handleImageChange: (file: File | null) => void;
    handleSubmit: (e: FormEvent) => void;
    submitting: boolean;
    deletingCover: boolean;
    onDeleteCoverImage: () => void;
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
    deletingCover,
    onDeleteCoverImage,
    onCancel,
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

    const handleLearnSubmit = (
        e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>
    ) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e && 'relatedTarget' in e && e.relatedTarget instanceof HTMLElement) {
            if (e.relatedTarget.dataset.addButton === 'learn') return;
        }
        if (e) e.preventDefault();
        if (newLearn.trim()) {
            handleAddArrayItem('whatWillLearn', newLearn);
            setNewLearn('');
        }
        setIsAddingLearn(false);
    };

    const handleTagSubmit = (
        e?: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>
    ) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e && 'relatedTarget' in e && e.relatedTarget instanceof HTMLElement) {
            if (e.relatedTarget.dataset.addButton === 'tag') return;
        }
        if (e) e.preventDefault();
        if (newTag.trim()) {
            handleAddArrayItem('tags', newTag);
            setNewTag('');
        }
        setIsAddingTag(false);
    };

    const handleMaxDigits = (e: React.FormEvent<HTMLInputElement>, maxLength: number) => {
        const target = e.target as HTMLInputElement;
        if (target.value.length > maxLength) {
            target.value = target.value.slice(0, maxLength);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-16 px-4">
            
            {/* Header / Cover Image Area */}
            <div className="relative w-full h-[280px] sm:h-[340px] rounded-[32px] bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center overflow-hidden group/cover">
                {formData.coverImageUrl ? (
                    <div className="relative w-full h-full">
                        <img
                            src={formData.coverImageUrl?.startsWith('http') || formData.coverImageUrl?.startsWith('blob:')
                                ? formData.coverImageUrl
                                : `${API_BASE_URL}${formData.coverImageUrl}`}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300" />
                        <button
                            type="button"
                            onClick={onDeleteCoverImage}
                            disabled={deletingCover || submitting}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center hover:bg-red-50 transition-all duration-200"
                            title="Delete cover image"
                        >
                            {deletingCover ? (
                                <span className="animate-spin text-sm">⏳</span>
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                ) : (
                    <div 
                        className="flex flex-col items-center p-6 text-center text-slate-400 cursor-pointer hover:text-slate-500 transition-colors"
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 mb-3">
                            <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-700">No cover image uploaded</span>
                        <span className="text-xs text-slate-400 mt-1">Recommended size: 1200x400px</span>
                    </div>
                )}

                {/* Floating Upload Button */}
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl shadow-md hover:bg-slate-50 active:scale-95 transition-all border border-slate-100"
                >
                    <Upload className="w-4 h-4 text-[var(--primary-500)]" />
                    <span>Upload Cover</span>
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
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column: Title, Description, What to learn, Tags */}
                <div className="flex-1 w-full space-y-8">

                    {/* Title Section */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Mentorship Title</label>
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        onBlur={() => setIsEditingTitle(false)}
                                        autoFocus
                                        className="text-2xl font-bold text-slate-900 border border-[var(--primary-500)] bg-slate-50/50 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20"
                                        placeholder="Mentorship Title"
                                        maxLength={30}
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {formData.title || "Untitled Mentorship"}
                                    </h1>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditingTitle(!isEditingTitle)}
                                className="p-2 text-slate-400 hover:text-[var(--primary-500)] bg-slate-50 rounded-xl transition-colors mt-6 shrink-0"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Description</label>
                                {isEditingDesc ? (
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        onBlur={() => setIsEditingDesc(false)}
                                        autoFocus
                                        maxLength={150}
                                        rows={4}
                                        className="text-sm font-medium text-slate-700 border border-slate-200 bg-slate-50/50 rounded-xl p-3 w-full focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 resize-none"
                                        placeholder="Tell students about this mentorship session..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl break-words">
                                        {formData.description || "No description provided."}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditingDesc(!isEditingDesc)}
                                className="p-2 text-slate-400 hover:text-[var(--primary-500)] bg-slate-50 rounded-xl transition-colors mt-6 shrink-0"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* What Student Will Learn Section */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">What Student Will Learn</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {formData.whatWillLearn.map((item, idx) => (
                                <div key={idx} className="relative bg-slate-50/60 border border-slate-100 rounded-2xl p-4 pr-10 flex items-center gap-3 group">
                                    <div className="w-6 h-6 bg-[var(--primary-500)] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                    </div>
                                    <span className="text-slate-700 text-sm font-semibold truncate">{item}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveArrayItem('whatWillLearn', idx)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Input / Button */}
                            <div className="flex items-center w-full">
                                {isAddingLearn ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            value={newLearn}
                                            onChange={(e) => setNewLearn(e.target.value)}
                                            onBlur={handleLearnSubmit}
                                            onKeyDown={handleLearnSubmit}
                                            maxLength={20}
                                            autoFocus
                                            className="border border-[var(--primary-500)] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none w-full bg-white shadow-inner"
                                            placeholder="Type skill name..."
                                        />
                                        <button
                                            type="button"
                                            data-add-button="learn"
                                            onClick={handleLearnSubmit}
                                            className="bg-[var(--primary-500)] text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:opacity-95 active:scale-95 transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLearn(true)}
                                        className="w-full border-2 border-dashed border-slate-200 text-[var(--primary-500)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/5 transition-all rounded-2xl p-4 flex items-center justify-center gap-1.5 font-bold text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add objective
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tags</h2>
                        <div className="flex flex-wrap gap-2.5">
                            {formData.tags.map((tag, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-full px-3.5 py-1.5 flex items-center gap-2 group shadow-sm">
                                    <span className="text-slate-600 text-xs font-bold">#{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveArrayItem('tags', idx)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Tag Input / Button */}
                            <div className="flex items-center">
                                {isAddingTag ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onBlur={handleTagSubmit}
                                            onKeyDown={handleTagSubmit}
                                            maxLength={20}
                                            autoFocus
                                            className="border border-[var(--primary-500)] rounded-full px-4 py-1.5 text-xs font-bold focus:outline-none w-[130px]"
                                            placeholder="tag name..."
                                        />
                                        <button
                                            type="button"
                                            data-add-button="tag"
                                            onClick={handleTagSubmit}
                                            className="bg-[var(--primary-500)] text-white rounded-full px-3 py-1.5 text-xs font-bold hover:opacity-95 transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingTag(true)}
                                        className="border-2 border-dashed border-slate-200 text-slate-500 hover:text-[var(--primary-500)] hover:border-[var(--primary-500)] transition-all rounded-full px-4 py-1.5 flex items-center gap-1 font-bold text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> New Tag
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Details Card */}
                <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-6">
                    <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm p-6 space-y-6">

                        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                            <h3 className="text-slate-900 font-bold flex items-center gap-2 text-base">
                                <Layers className="w-4 h-4 text-[var(--primary-500)]" />
                                Meta Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditingDetails(!isEditingDetails)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                                    isEditingDetails 
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <Edit3 className="w-3 h-3" />
                                {isEditingDetails ? "Done" : "Edit"}
                            </button>
                        </div>

                        <div className="space-y-4">

                            {/* Category */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Category
                                </span>
                                {isEditingDetails ? (
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        maxLength={20}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50/50 focus:outline-none"
                                    />
                                ) : (
                                    <div className="text-sm font-semibold text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-50">
                                        {formData.category || "Uncategorized"}
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Pricing Structure
                                </span>
                                {isEditingDetails ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onInput={(e) => handleMaxDigits(e, 10)}
                                            onChange={handleInputChange}
                                            className="w-full border border-slate-200 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 rounded-xl pl-7 pr-3 py-2 text-sm font-semibold bg-slate-50/50 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-sm font-semibold text-slate-900 bg-slate-50/60 p-3 rounded-xl border border-slate-50 flex justify-between items-center">
                                        <span>Investment</span>
                                        <span className="text-base font-black text-[var(--primary-500)]">
                                            {formData.price ? `$${formData.price}` : "Free"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Level */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Target Audience Level
                                </span>
                                {isEditingDetails ? (
                                    <div className="relative">
                                        <select
                                            name="difficultyLevel"
                                            value={formData.difficultyLevel}
                                            onChange={handleInputChange}
                                            className="w-full border border-slate-200 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50/50 focus:outline-none appearance-none"
                                        >
                                            <option value="ALL_LEVEL">All Levels</option>
                                            <option value="BEGINNER">Beginner</option>
                                            <option value="INTERMEDIATE">Intermediate</option>
                                            <option value="EXPERT">Expert</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="text-sm font-semibold text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-50">
                                        {formData.difficultyLevel === 'ALL_LEVEL' ? 'All Levels' : formData.difficultyLevel.charAt(0) + formData.difficultyLevel.slice(1).toLowerCase()}
                                    </div>
                                )}
                            </div>

                            {/* Duration */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Expiry / Access Period
                                </span>
                                {isEditingDetails ? (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            onInput={(e) => handleMaxDigits(e, 3)}
                                            placeholder="Months"
                                            className="w-full border border-slate-200 focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50/50 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Months</span>
                                    </div>
                                ) : (
                                    <div className="text-sm font-semibold text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-50">
                                        {formData.duration ? `${formData.duration} Months` : "--"}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Save Changes Button Area */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 bg-[var(--primary-500)] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting ? (
                        <>
                            <span className="animate-spin inline-block text-sm">⏳</span>
                            Saving Changes...
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