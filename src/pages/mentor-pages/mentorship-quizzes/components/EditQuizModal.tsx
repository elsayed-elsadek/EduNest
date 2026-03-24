import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getQuizDetails, updateQuiz } from '../../../../services/mentorshipsContent/quiz';
import type { UpdateQuizPayload } from '../../../../services/mentorshipsContent/quiz';
import toast from 'react-hot-toast';

interface EditQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizId: number | null;
    onSuccess: () => void;
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({ isOpen, onClose, quizId, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !quizId) return;

        let active = true;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getQuizDetails(quizId);
                if (active) {
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setDurationMinutes(data.durationMinutes || 15);
                    setStatus(data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (active) {
                    toast.error(err?.message || 'Failed to load quiz details');
                    onClose();
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            active = false;
        };
    }, [isOpen, quizId, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizId) return;

        try {
            setSubmitting(true);
            const payload: UpdateQuizPayload = {
                title,
                description,
                durationMinutes,
                status
            };
            await updateQuiz(quizId, payload);
            toast.success('Quiz updated successfully');
            onSuccess();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Edit Quiz</h3>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-[var(--primary-dark)] rounded-lg transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditQuizModal;
