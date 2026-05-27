import type { FC } from 'react';
import { useState } from 'react';

interface Props {
    title: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    error?: string;
    colorScheme?: 'blue' | 'emerald';
}

export const DynamicListInput: FC<Props> = ({
    title,
    items,
    onChange,
    placeholder,
    error,
    colorScheme = 'blue',
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        onChange([...items, trimmed]);
        setInputValue('');
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const colors = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-100',
            btn: 'text-blue-500 hover:bg-blue-100 hover:text-blue-700'
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-100',
            btn: 'text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700'
        }
    };

    const theme = colors[colorScheme];

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">
                {title}
            </p>
            {error && <p className="text-xs text-red-600">{error}</p>}

            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                        <span
                            key={index}
                            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm border ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                            <span className="break-words max-w-[200px] sm:max-w-none">{item}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition touch-manipulation ${theme.btn}`}
                                aria-label="Remove"
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
                    maxLength={15}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    className="flex-1 min-h-[44px] sm:h-11 px-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-from)] focus:bg-white"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="min-h-[44px] sm:h-11 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[var(--primary-from)] text-white text-sm font-semibold shadow-sm hover:bg-[var(--primary-dark)] active:scale-[0.98] transition shrink-0"
                >
                    + Add now
                </button>
            </div>
        </div>
    );
};



