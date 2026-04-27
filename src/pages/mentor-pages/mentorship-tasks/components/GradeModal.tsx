import type { FC } from 'react';
import { useState } from 'react';
import { X, Send, Award, Paperclip, AlertCircle, Star } from 'lucide-react';
import type { GradePayload } from '../../../../services/mentorshipsContent/task';
import { gradeTaskSubmission } from '../../../../services/mentorshipsContent/task';
import toast from 'react-hot-toast';
import type { GradeModalProps } from './types';
import { API_BASE_URL } from '../../../../services/api';

const GradeModal: FC<GradeModalProps> = ({ submission, maxPoints, onClose, onGraded }) => {
    const [score, setScore] = useState<string>(
        submission.rawScore !== null ? String(submission.rawScore) : ''
    );
    const [feedback, setFeedback] = useState<string>(submission.feedback || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const parsedScore = Number(score);
        if (isNaN(parsedScore) || parsedScore < 0) {
            toast.error('Please enter a valid score');
            return;
        }
        if (parsedScore > maxPoints) {
            toast.error(`Score cannot exceed ${maxPoints}`);
            return;
        }
        try {
            setSubmitting(true);
            const payload: GradePayload = {
                score: parsedScore,
                feedback: feedback.trim() || undefined,
            };
            await gradeTaskSubmission(submission.submissionId, payload);
            toast.success('Graded successfully! ✨');
            onGraded();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message || 'Failed to grade submission');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between bg-[var(--primary-500)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Award size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Grade Submission</h3>
                            <p className="text-sm text-blue-100">{submission.studentFullName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X size={18} className="text-white" />
                    </button>
                </div>

                {/* Submission meta */}
                <div className="px-6 pt-4 pb-2 flex flex-wrap gap-3">
                    {submission.isLate && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                            <AlertCircle size={12} /> Late Submission
                        </span>
                    )}

                    {/* Student submission file — shown prominently */}
                    {(submission.fileUrl || submission.uploadedFilePath) && (
                        <div className="w-full mt-1">
                            {submission.fileUrl ? (
                                <a
                                    href={submission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                                        <Paperclip size={15} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-blue-500 mb-0.5">Student Submission File</p>
                                        <p className="truncate text-blue-800">{submission.uploadedFilePath?.split('/').pop() ?? 'Open File'}</p>
                                    </div>
                                    <span className="text-xs text-blue-500 group-hover:text-blue-700 transition-colors shrink-0">Open ↗</span>
                                </a>
                            ) : (
                                <div className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                                        <Paperclip size={15} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-blue-500 mb-0.5">Submitted File</p>
                                        <a 
                                            href={(() => {
                                                const path = submission.uploadedFilePath;
                                                if (!path) return '';
                                                if (path.startsWith('http')) return path;
                                                let clean = path.startsWith('/') ? path.substring(1) : path;
                                                if (clean.startsWith('app/')) clean = clean.substring(4);
                                                return `${API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL+'/'}${clean}`;
                                            })()}
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="block truncate text-blue-800 hover:underline"
                                        >
                                            {submission.uploadedFilePath?.split('/').pop()}
                                        </a>
                                    </div>
                                    <span className="text-xs text-blue-500 group-hover:text-blue-700 transition-colors shrink-0">Open ↗</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="px-6 py-4 space-y-5">
                    {/* Score */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Score
                            <span className="text-gray-400 font-normal ml-1">(max {maxPoints})</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                max={maxPoints}
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder={`0 – ${maxPoints}`}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-800 font-semibold transition-all"
                            />
                            <Star size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-amber-400" />
                        </div>
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                        <textarea
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Write constructive feedback for the student..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-gray-700 resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r bg-[#0f5e8b] hover:bg-[#0f5e8b] rounded-xl  disabled:opacity-60 shadow-sm hover:shadow transition-all"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                            <Send size={16} />
                        )}
                        {submitting ? 'Submitting...' : 'Submit Grade'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
        </>
    );
};

export default GradeModal;

