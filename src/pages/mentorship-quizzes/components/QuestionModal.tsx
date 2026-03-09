import type { FC } from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { Question, CreateQuestionPayload } from '../../../services/mentorshipsContent/quiz';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingQuestion: Question | null;
    submitting: boolean;
    formData: CreateQuestionPayload;
    setFormData: (data: CreateQuestionPayload) => void;
}

const QuestionModal: FC<QuestionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingQuestion,
    submitting,
    formData,
    setFormData
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingQuestion ? 'Edit Question' : 'Create New Question'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            placeholder="Enter your question..."
                            required
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]/20 focus:border-[#0f5e8b] transition-all resize-none"
                        />
                    </div>

                    {/* Points */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]/20 focus:border-[#0f5e8b] transition-all"
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Answer Options <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['A', 'B', 'C', 'D'].map((opt) => (
                                <div key={opt}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Option {opt}</label>
                                    <input
                                        type="text"
                                        value={(formData as any)[`option${opt}`]}
                                        onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                        placeholder={`Option ${opt}`}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]/20 focus:border-[#0f5e8b] transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Correct Answer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            {['A', 'B', 'C', 'D'].map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${formData.correctAnswer === option
                                            ? 'bg-green-50 border-green-300 text-green-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        value={option}
                                        checked={formData.correctAnswer === option}
                                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                        className="sr-only"
                                    />
                                    <span className="font-bold">{option}</span>
                                    {formData.correctAnswer === option && (
                                        <CheckCircle size={16} className="text-green-500" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 bg-[#0f5e8b] text-white rounded-xl font-medium hover:bg-[#0a4a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionModal;
