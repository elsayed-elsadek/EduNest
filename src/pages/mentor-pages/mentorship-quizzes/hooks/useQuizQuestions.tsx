import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../../store/authStore';
import type { Question, CreateQuestionPayload, UpdateQuestionPayload } from '../../../../services/mentorshipsContent/quiz';
import { getQuestionsByQuizId, createQuestion, updateQuestion, deleteQuestion } from '../../../../services/mentorshipsContent/quiz';

export const useQuizQuestions = () => {
    const { id: mentorshipId, quizId } = useParams<{ id: string; quizId: string }>();
    const token = useAuthStore((s) => s.token);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateQuestionPayload>({
        quizId: Number(quizId),
        text: '',
        points: 1,
        correctAnswer: 'A',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: ''
    });

    const loadQuestions = useCallback(async () => {
        if (!quizId) return;
        try {
            setLoading(true);
            setError(null);
            const response = await getQuestionsByQuizId(Number(quizId));
            setQuestions(response.questions);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load questions';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        if (token && quizId) {
            loadQuestions();
        }
    }, [loadQuestions, quizId, token]);

    const resetForm = () => {
        setFormData({
            quizId: Number(quizId),
            text: '',
            points: 1,
            correctAnswer: 'A',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: ''
        });
        setEditingQuestion(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (question: Question) => {
        setEditingQuestion(question);
        setFormData({
            quizId: Number(quizId),
            text: question.text,
            points: question.points,
            correctAnswer: question.correctAnswer,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !quizId) return;

        setSubmitting(true);
        try {
            if (editingQuestion) {
                const payload: UpdateQuestionPayload = {
                    quizId: Number(quizId),
                    text: formData.text,
                    points: formData.points,
                    correctAnswer: formData.correctAnswer,
                    optionA: formData.optionA,
                    optionB: formData.optionB,
                    optionC: formData.optionC,
                    optionD: formData.optionD
                };
                const updated = await updateQuestion(editingQuestion.id, payload);
                setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
                toast.success('Question updated successfully');
            } else {
                const created = await createQuestion(formData);
                setQuestions(prev => [...prev, created]);
                toast.success('Question created successfully');
            }
            closeModal();
        } catch (err: unknown) {
            console.error('Error saving question:', err);
            const errorObj = err as { errorMessages?: { error?: string }; message?: string };
            const message = errorObj?.errorMessages?.error || errorObj?.message || 'Failed to save question';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (questionId: number) => {
        if (!token || !quizId) return;

        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-gray-700 font-medium">Are you sure you want to delete this question?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteQuestion(Number(quizId), questionId);
                                setQuestions(prev => prev.filter(q => q.id !== questionId));
                                toast.success('Question deleted successfully');
                            } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : 'Failed to delete question';
                                toast.error(message);
                            }
                        }}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            icon: '⚠️',
        });
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        mentorshipId,
        quizId,
        questions,
        filteredQuestions,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        isModalOpen,
        editingQuestion,
        submitting,
        formData,
        setFormData,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        handleDelete
    };
};
