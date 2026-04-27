import { FileText, Calendar, Award, Download, Eye, Target } from 'lucide-react';
import { API_BASE_URL } from '../../../../../services/api';
import type { StudentProjectDetails } from '../../../../../services/student-roleService/submitProject';
import toast from 'react-hot-toast';

interface ProjectDetailsPanelProps {
  projectDetails: StudentProjectDetails;
}

const ProjectDetailsPanel = ({ projectDetails }: ProjectDetailsPanelProps) => {
  const getAttachmentUrl = () => {
    const url = projectDetails?.descriptionUrl;
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
        Project Details
      </h3>

      <div className="space-y-4">
        {/* Brief */}
        {projectDetails.brief && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Brief</h4>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{projectDetails.brief}</p>
          </div>
        )}

        {/* Goal */}
        {projectDetails.goal && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 mt-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Goal
            </h4>
            <p className="text-slate-600 bg-emerald-50 p-3 rounded-xl">{projectDetails.goal}</p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          {/* Points */}
          {projectDetails.points !== null && projectDetails.points !== undefined && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Award className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Points</p>
                <p className="font-semibold text-blue-800">{projectDetails.points}</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {projectDetails.endAt && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
              <Calendar className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-slate-500">End Date</p>
                <p className="font-semibold text-red-800">
                  {new Date(projectDetails.endAt).toLocaleDateString('en-US', {
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

           {/* Start Date */}
           {projectDetails.startAt && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
              <Calendar className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Start Date</p>
                <p className="font-semibold text-purple-800">
                  {new Date(projectDetails.startAt).toLocaleDateString('en-US', {
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
        </div>
        
        {/* Description URL (Attachment) */}
        {projectDetails.descriptionUrl && (
          <div className="flex flex-col p-4 bg-slate-50 rounded-xl gap-4 mt-4">
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
                      const filename = url.split('/').pop() || 'project-file';
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

            <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden h-[400px]">
              <iframe
                src={getAttachmentUrl()}
                className="w-full h-full"
                title="Project Attachment Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPanel;
