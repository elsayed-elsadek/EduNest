

import React from 'react';
import { Award, CheckCircle, Clock, AlertCircle, Download, Link } from 'lucide-react';
import type { TaskSubmission, ProjectStatistics } from '../../../../services/projectService';
import { getAssetUrl } from '../../../../config/env';
import { isSafeExternalUrl } from '../../../../utils/safeExternalUrl';

type Props = {
  submissionsList: TaskSubmission[];
  stats: ProjectStatistics | null;
  page: number;
  submissionsPage: { totalPages: number } | null | undefined;
  onPageChange: (nextPage: number) => void;
  onOpenGradeModal: (submission: TaskSubmission) => void;
};

export const ProjectSubmissionsTable: React.FC<Props> = ({
  submissionsList,
  stats,
  page,
  submissionsPage,
  onPageChange,
  onOpenGradeModal,
}) => {

  const getLinkUrl = (sub: TaskSubmission): string | null => {
    return sub.fileUrl && sub.fileUrl.trim() !== '' ? sub.fileUrl : null;
  };

  const getFileUrl = (sub: TaskSubmission): string | null => {
    if (sub.uploadedFilePath && sub.uploadedFilePath.trim() !== '') {
      const filename = sub.uploadedFilePath.split('/').pop();
      return getAssetUrl(`/uploads/submissions/${filename}`) ?? null;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Student Submissions</h2>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium w-[25%]">Student Name</th>
              <th className="p-4 font-medium w-[20%]">Submitted At</th>
              <th className="p-4 font-medium w-[15%]">Status</th>
              <th className="p-4 font-medium w-[10%]">Link</th>
              <th className="p-4 font-medium w-[10%]">File</th>
              <th className="p-4 font-medium w-[10%]">Score</th>
              <th className="p-4 font-medium text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissionsList.length > 0 ? (
              submissionsList.map((sub) => (
                <tr key={sub.submissionId} className="hover:bg-gray-50 transition-colors">

                  <td className="p-4 font-medium text-gray-900 break-words whitespace-normal max-w-[200px]">
                    {sub.studentFullName}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        size={14}
                        className={sub.isLate ? 'text-red-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'}
                      />
                      <span className={sub.isLate ? 'text-red-600 font-medium break-words' : 'break-words'}>
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    {sub.status === 'GRADED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        <CheckCircle size={12} /> Graded
                      </span>
                    ) : sub.status === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                        <AlertCircle size={12} /> Needs Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {sub.status}
                      </span>
                    )}
                  </td>

                  {/* Link Column */}
                  <td className="p-4">
                    {isSafeExternalUrl(getLinkUrl(sub)) ? (
                        <a
                          href={getLinkUrl(sub)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Link size={14} className="flex-shrink-0" /> View Link
                        </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* File Column */}
                  <td className="p-4">
                    {isSafeExternalUrl(getFileUrl(sub)) ? (
                      <a
                        href={getFileUrl(sub)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <Download size={14} className="flex-shrink-0" /> View File
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  <td className="p-4 font-medium">
                    {sub.status === 'GRADED' ? (
                      <span className="text-green-600 break-all">
                        {sub.finalScore || sub.rawScore || 0} / {stats?.totalPoints || 100}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => onOpenGradeModal(sub)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors ml-auto"
                    >
                      <Award size={16} /> Grade
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {submissionsPage && submissionsPage.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-900 font-medium px-2">
              {page + 1} of {submissionsPage.totalPages}
            </span>
            <button
              disabled={page >= submissionsPage.totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};