import type { FC } from 'react';
import { Plus, HelpCircle } from 'lucide-react';

interface EmptyQuestionsStateProps {
    searchQuery: string;
    onAddFirst: () => void;
}

const EmptyQuestionsState: FC<EmptyQuestionsStateProps> = ({ searchQuery, onAddFirst }) => {
    return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try a different search term' : 'Start by creating your first question'}
            </p>
            {!searchQuery && (
                <button
                    onClick={onAddFirst}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f5e8b] text-white rounded-lg font-medium hover:bg-[#0a4a6e] transition-colors"
                >
                    <Plus size={18} />
                    Create Question
                </button>
            )}
        </div>
    );
};

export default EmptyQuestionsState;
