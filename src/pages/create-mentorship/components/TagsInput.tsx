import type { FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
    tags: string[];
    onChange: (tags: string[]) => void;
    error?: string;
}

export const TagsInput: FC<Props> = ({ tags, onChange, error }) => {
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (!trimmed) return;
        if (tags.length >= 5) {
            toast.error('You can add up to 5 tags only');
            return;
        }
        if (tags.includes(trimmed)) {
            setTagInput('');
            return;
        }
        onChange([...tags, trimmed]);
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(tags.filter((t) => t !== tagToRemove));
    };

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">
                TAGS (MAXIMUM 5)
            </p>
            {error && <p className="text-xs text-red-600">{error}</p>}

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:py-1.5 rounded-full bg-purple-50 text-xs sm:text-sm text-purple-700 border border-purple-100"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-purple-500 hover:bg-purple-100 hover:text-purple-700 transition touch-manipulation"
                                aria-label="Remove tag"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                        }
                    }}
                    className="flex-1 min-h-[44px] sm:h-11 px-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#154d71] focus:bg-white"
                    placeholder="Add tag and press Enter..."
                />
                <button
                    type="button"
                    onClick={handleAddTag}
                    className="min-h-[44px] sm:h-11 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#154d71] text-white text-sm font-semibold shadow-sm hover:bg-[#0f3550] active:scale-[0.98] transition shrink-0"
                >
                    + Add now
                </button>
            </div>
            <p className="text-xs text-gray-400">
                You have added {tags.length}/5 tags.
            </p>
        </div>
    );
};
