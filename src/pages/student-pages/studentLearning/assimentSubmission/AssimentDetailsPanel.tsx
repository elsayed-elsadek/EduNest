import { FileText, Calendar, Clock, Award, Download, Eye, ExternalLink } from 'lucide-react';
import { getAssetUrl } from '../../../../config/env';
import type { StudentTaskDetails } from '../../../../services/student-roleService/submitTask';
import FileViewer from '../../../../components/common/FileViewer';
import toast from 'react-hot-toast';
import logger from '../../../../utils/logger';

interface AssimentDetailsPanelProps {
  taskDetails: StudentTaskDetails;
}

const AssimentDetailsPanel = ({ taskDetails }: AssimentDetailsPanelProps) => {
  // Build URL helper
  const buildUrl = (candidate?: string | null): string => {
    if (!candidate) return '';
    const trimmed = String(candidate).trim();
    if (!trimmed) return '';
    const clean = trimmed.replace(/^\/?app\//, '');
    return getAssetUrl(clean) ?? '';
  };

  // Separate functions for file and link
  const getFileUrl = () => buildUrl(taskDetails?.uploadedAttachmentPath);
  const getLinkUrl = () => buildUrl(taskDetails?.attachmentUrl);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Assignment Details
      </h3>

      <div className="space-y-4">
        {/* Description */}
        {taskDetails.description && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{taskDetails.description}</p>
          </div>
        )}

        {/* Task Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Points */}
          {taskDetails.points && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Award className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Points</p>
                <p className="font-semibold text-blue-800">{taskDetails.points}</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {taskDetails.dueAt && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
              <Calendar className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-slate-500">Due Date</p>
                <p className="font-semibold text-red-800">
                  {new Date(taskDetails.dueAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Estimated Time */}
          {taskDetails.estimatedMinutes && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
              <Clock className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Estimated Time</p>
                <p className="font-semibold text-purple-800">{taskDetails.estimatedMinutes} minutes</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Resources Section */}
        {(getFileUrl() || getLinkUrl()) && (
          <div className="mt-6">
            <h4 className="font-semibold text-slate-800 mb-3">Resources</h4>
            <div className="space-y-3">
              {/* Link Resource */}
              {getLinkUrl() && (
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Resource Link</p>
                      <p className="text-xs text-slate-500">External resource</p>
                    </div>
                  </div>

                  <a
                    href={getLinkUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Link
                  </a>
                </div>
              )}

              {/* File Resource */}
              {getFileUrl() && (
                <div className="flex flex-col p-4 bg-slate-50 rounded-xl gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">File</p>
                        <p className="text-xs text-slate-500">Mentor provided file</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          const url = getFileUrl();
                          if (!url) return;
                          try {
                            const toastId = toast.loading('Starting download...');
                            const response = await fetch(url);
                            if (!response.ok) throw new Error('File fetch failed');
                            const blob = await response.blob();
                            const objectUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = objectUrl;
                            const filename = url.split('/').pop() || 'assignment-file';
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(objectUrl);
                            toast.success('Download complete', { id: toastId });
                          } catch (err) {
                            logger.error('Force download failed:', err);
                            toast.error('Direct download unavailable, opening file...');
                            window.open(url, '_blank');
                          }
                        }}
                        className="flex items-center gap-1.5 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <a
                        href={getFileUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm bg-[var(--primary-500)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--primary-dark)] font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View File
                      </a>
                    </div>
                  </div>

                  <div className="w-full">
                    <FileViewer url={getFileUrl()} height="h-[300px]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No resources message */}
        {!getFileUrl() && !getLinkUrl() && (
          <div className="flex flex-col p-4 bg-slate-50 rounded-xl gap-2 mt-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-800">Resources</span>
            </div>
            <p>No resources provided.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssimentDetailsPanel;
