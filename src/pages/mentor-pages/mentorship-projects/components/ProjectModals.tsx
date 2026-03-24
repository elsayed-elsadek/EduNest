import React, { useState, useEffect } from 'react';
import { type ProjectResponse, updateProject, deleteProject } from '../../../../services/projectService';
import { X, AlertTriangle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProjectModalProps {
  project: ProjectResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    brief: '',
    descriptionUrl: '',
    startAt: '',
    endAt: '',
    points: 100,
    status: 'DRAFT',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || '',
        goal: project.goal || '',
        brief: project.brief || '',
        descriptionUrl: project.descriptionUrl || '',
        startAt: project.startAt ? new Date(project.startAt).toISOString().slice(0, 16) : '',
        endAt: project.endAt ? new Date(project.endAt).toISOString().slice(0, 16) : '',
        points: project.points || 100,
        status: project.status || 'DRAFT',
      });
      setFile(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const formPayload = new FormData();
      // Format dates to expected format: yyyy-MM-dd HH:mm:ss if possible, fallback to string
      const formattedData = {
        ...formData,
        startAt: formData.startAt ? formData.startAt.replace('T', ' ') + ':00' : null,
        endAt: formData.endAt ? formData.endAt.replace('T', ' ') + ':00' : null,
        points: Number(formData.points)
      };
      
      formPayload.append('req', JSON.stringify(formattedData));
      
      if (file) {
        formPayload.append('file', file);
      }

      await updateProject(project.id, formPayload);
      toast.success('Project updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Edit Project</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input required type="number" name="points" value={formData.points} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <input type="text" name="goal" value={formData.goal} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Brief Content</label>
              <textarea name="brief" value={formData.brief} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description URL</label>
              <input type="url" name="descriptionUrl" value={formData.descriptionUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="https://" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start At</label>
              <input required type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End At</label>
              <input required type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment File <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex justify-center text-sm text-gray-600 mt-2">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">{file ? file.name : "Select a new file to replace existing"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteProjectModalProps {
  projectId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ projectId, isOpen, onClose, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || projectId === null) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Project</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete this project? This action cannot be undone and will remove all student submissions associated with it.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 w-full">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors w-full">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
