import { FileText, Calendar, Clock, Award, Download, Eye } from 'lucide-react';
import { API_BASE_URL } from '../../../../services/api';
import type { StudentTaskDetails } from '../../../../services/student-roleService/submitTask';
import FileViewer from '../../../../components/common/FileViewer';
import toast from 'react-hot-toast';

interface AssimentDetailsPanelProps {
  taskDetails: StudentTaskDetails;
}

const AssimentDetailsPanel = ({ taskDetails }: AssimentDetailsPanelProps) => {
  const getAttachmentUrl = () => {
    const url = taskDetails?.attachmentUrl || taskDetails?.uploadedAttachmentPath;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    let cleanPath = url.startsWith('/') ? url.substring(1) : url;
    if (cleanPath.startsWith('app/')) {
        cleanPath = cleanPath.substring(4);
    }
    
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    return `${baseUrl}${cleanPath}`;
  };

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
        
        {/* Attachment */}
        {(taskDetails.attachmentUrl || taskDetails.uploadedAttachmentPath) && (
          <div className="flex flex-col p-4 bg-slate-50 rounded-xl gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Attachment</p>
                  <p className="text-xs text-slate-500">Resource file</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    const url = getAttachmentUrl();
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
                      console.error('Force download failed:', err);
                      toast.error('Direct download unavailable, opening file...');
                      window.open(url, '_blank'); // fallback
                    }
                  }}
                  className="flex items-center gap-1.5 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={getAttachmentUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm bg-[var(--primary-500)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--primary-dark)] font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Page
                </a>
              </div>
            </div>

            <div className="w-full">
              <FileViewer url={getAttachmentUrl()} height="h-[420px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssimentDetailsPanel;
