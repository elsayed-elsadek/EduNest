/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, Award, AlertCircle, Download, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../../../../services/api';
import ContentTypeBadge from '../../../../components/common/ContentTypeBadge';
import type { StudentTaskDetails } from '../../../../services/student-roleService/submitTask';
import FileViewer from '../../../../components/common/FileViewer';
import { resolveFirstFileUrl } from '../../../../utils/fileUrl';

interface StudentSubmissionStatusProps {
  taskDetails: StudentTaskDetails;
}

const StudentSubmissionStatus = ({ taskDetails }: StudentSubmissionStatusProps) => {
  if (!taskDetails.submissionStatus || taskDetails.submissionStatus === 'NOT_SUBMITTED') {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Your Submission
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">You haven't submitted this assignment yet.</p>
          <p className="text-sm text-slate-500 mt-2">Use the form below to submit your work.</p>
        </div>
      </div>
    );
  }

  // Prefer explicit `studentSubmission` object when present from API.
  // Only consider student-owned fields: `submissionUrl` and `uploadedSubmissionPath`.
  const studentSubmission = (taskDetails as any).studentSubmission ?? {
    submissionUrl: taskDetails.submissionUrl,
    uploadedSubmissionPath: (taskDetails as any).uploadedSubmissionPath,
  };

  const studentSubmissionUrl = resolveFirstFileUrl(
    studentSubmission.submissionUrl,
    studentSubmission.uploadedSubmissionPath
  );

  const getMentorPhotoUrl = (photo?: string | null) => {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    const cleanPhoto = photo.startsWith('/') ? photo.substring(1) : photo;
    return `${API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/'}${cleanPhoto}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Your Submission
        </h3>
        <ContentTypeBadge type="TASK" size="sm" />
      </div>

      <div className="space-y-4">
        {/* Submission Status */}
        <div
          className="flex items-center justify-between p-4 rounded-xl border-2"
          style={{
            borderColor:
              taskDetails.submissionStatus === 'SUBMITTED' ? '#10B981' : taskDetails.submissionStatus === 'GRADED' ? '#3B82F6' : '#F59E0B',
            backgroundColor:
              taskDetails.submissionStatus === 'SUBMITTED' ? '#ECFDF5' : taskDetails.submissionStatus === 'GRADED' ? '#EFF6FF' : '#FFFBEB'
          }}
        >
          <div className="flex items-center gap-3">
            {taskDetails.submissionStatus === 'SUBMITTED' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : taskDetails.submissionStatus === 'GRADED' ? (
              <Award className="w-5 h-5 text-blue-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className="font-semibold text-slate-800">Status: {taskDetails.submissionStatus}</p>
            </div>
          </div>
        </div>

        {/* Submission Details Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* File/URL */}
          {studentSubmissionUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <Download className="w-4 h-4 text-slate-600" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Submitted File</p>
                  <a href={studentSubmissionUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-500)] hover:text-[var(--primary-dark)] font-medium underline">
                    View Your submission
                  </a>
                </div>
              </div>

              <div>
                {/* Inline preview */}
                <div className="mt-2">
                  <FileViewer url={studentSubmissionUrl} height="h-[300px]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-600">
              <p className="font-semibold">No submission yet</p>
              <p className="text-sm mt-1">You haven't attached a file or link for this submission.</p>
            </div>
          )}

          {/* Scores */}
          {taskDetails.score !== null && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Award className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Score</p>
                <p className="font-semibold text-blue-800">{taskDetails.score} / {taskDetails.totalPoints}</p>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {taskDetails.feedback && (
          <div className="mt-8 bg-[#0B1A28] text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-700">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1e3a5f] opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <MessageSquare className="w-6 h-6 text-slate-300" />
              <h4 className="font-bold text-lg tracking-wide text-slate-100">Mentor Feedback</h4>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                {taskDetails.mentorPhoto ? (
                  <img
                    src={getMentorPhotoUrl(taskDetails.mentorPhoto)}
                    alt={taskDetails.mentorName || 'Mentor'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-slate-300 uppercase">{(taskDetails.mentorName || 'M')[0]}</span>
                )}
              </div>

              <div className="flex-1 mt-1 min-w-0">
                <p className="italic text-[#aebbd6] text-sm leading-relaxed whitespace-pre-wrap break-words">"{taskDetails.feedback}"</p>
                <p className="text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-wider">— {taskDetails.mentorName || 'Mentor'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubmissionStatus;
