import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, HelpCircle } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import { useQuizQuestions } from './hooks/useQuizQuestions';
import QuestionCard from './components/QuestionCard';
import QuestionModal from './components/QuestionModal';
import EmptyQuestionsState from './components/EmptyQuestionsState';

const QuizQuestions: FC = () => {
    const navigate = useNavigate();
    const {
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
    } = useQuizQuestions();

    if (loading) {
        return (
            <DashLayout pageTitle="Quiz Questions">
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashLayout>
        );
    }

    if (error && questions.length === 0) {
        return (
            <DashLayout pageTitle="Quiz Questions">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                        <HelpCircle size={24} />
                        <p>{error || 'Failed to load questions'}</p>
                    </div>
                </div>
            </DashLayout>
        );
    }

    return (
        <DashLayout pageTitle={`My Mentorships / Design Systems / Quizzes / Questions`}>
            <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quiz Questions</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} • Total points: {questions.reduce((sum, q) => sum + q.points, 0)}
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0f5e8b] text-white rounded-xl font-medium hover:bg-[#0a4a6e] transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create Question
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <Search className="text-blue-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        className="flex-1 outline-none border-none text-gray-700 bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {filteredQuestions.length === 0 ? (
                        <EmptyQuestionsState
                            searchQuery={searchQuery}
                            onAddFirst={openCreateModal}
                        />
                    ) : (
                        filteredQuestions.map((question, index) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                index={index}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>

                {/* Back to Quiz Details */}
                <div className="pt-4">
                    <button
                        onClick={() => navigate(`/mentor/mentorships/${mentorshipId}/quizzes/${quizId}`)}
                        className="text-[#0f5e8b] font-medium hover:underline"
                    >
                        ← Back to Quiz Details
                    </button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <QuestionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                editingQuestion={editingQuestion}
                submitting={submitting}
                formData={formData}
                setFormData={setFormData}
            />
        </DashLayout>
    );
};

export default QuizQuestions;
