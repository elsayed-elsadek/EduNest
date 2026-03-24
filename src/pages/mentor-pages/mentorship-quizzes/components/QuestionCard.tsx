import type { FC } from 'react';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import type { Question } from '../../../../services/mentorshipsContent/quiz';

interface QuestionCardProps {
    question: Question;
    index: number;
    onEdit: (question: Question) => void;
    onDelete: (id: number) => void;
}

const QuestionCard: FC<QuestionCardProps> = ({ question, index, onEdit, onDelete }) => {
    const getOptionClass = (option: string, correctAnswer: string) => {
        const baseClass = "px-3 py-2 rounded-lg text-sm font-medium border transition-all ";
        if (option === correctAnswer) {
            return baseClass + "bg-green-100 border-green-300 text-green-700";
        }
        return baseClass + "bg-gray-50 border-gray-200 text-gray-600";
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 bg-[#0f5e8b] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                            {question.points} point{question.points !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {question.text}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={getOptionClass('A', question.correctAnswer)}>
                            <span className="font-bold">A:</span> {question.optionA}
                        </div>
                        <div className={getOptionClass('B', question.correctAnswer)}>
                            <span className="font-bold">B:</span> {question.optionB}
                        </div>
                        <div className={getOptionClass('C', question.correctAnswer)}>
                            <span className="font-bold">C:</span> {question.optionC}
                        </div>
                        <div className={getOptionClass('D', question.correctAnswer)}>
                            <span className="font-bold">D:</span> {question.optionD}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                            Correct Answer: {question.correctAnswer}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
