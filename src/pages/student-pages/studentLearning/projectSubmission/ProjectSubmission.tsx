import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getStudentProjectDetails, type StudentProjectDetails, submitProject } from '../../../../services/student-roleService/submitProject';
import { AxiosError } from 'axios';
import ProjectDetailsPanel from './components/ProjectDetailsPanel';
import ProjectSubmissionStatus from './components/ProjectSubmissionStatus';
import ProjectSubmissionForm from './components/ProjectSubmissionForm';

interface ProjectSubmissionProps {
  projectId: number;
}

const ProjectSubmission = ({ projectId }: ProjectSubmissionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectDetails, setProjectDetails] = useState<StudentProjectDetails | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  const loadProjectDetails = useCallback(async () => {
    try {
      setIsLoadingProject(true);
      const details = await getStudentProjectDetails(projectId);
      setProjectDetails(details);
    } catch (error) {
      console.error('Error loading project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoadingProject(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUrl(''); // Clear URL if file is selected
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value);
    setFile(null); // Clear file if URL is entered
  };

  const handleSubmit = async () => {
    if (!file && !fileUrl.trim()) {
      toast.error('Please select a file or provide a URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        file: file || undefined,
        fileUrl: fileUrl.trim() || undefined,
      };

      await submitProject(projectId, payload);
      await loadProjectDetails(); // Refresh all details naturally
      toast.success('Project submitted successfully!');
      
      // Clear form after successful submit
      setFile(null);
      setFileUrl('');
    } catch (error) {
      console.error('Submission error:', error);
      const err = error as AxiosError<{ errorMessages?: { error?: string } }>;
      const errorMessage = err?.response?.data?.errorMessages?.error || 'Failed to submit project';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded mb-6 w-3/4"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Details - Left Side */}
      <div className="space-y-6">
        {projectDetails && <ProjectDetailsPanel projectDetails={projectDetails} />}
      </div>

      {/* Submission Section - Right Side */}
      <div className="space-y-6">
        {isLoadingProject ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 rounded mb-4"></div>
              <div className="h-20 bg-slate-200 rounded mb-4"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          projectDetails && <ProjectSubmissionStatus projectDetails={projectDetails} />
        )}

        <ProjectSubmissionForm
          file={file}
          fileUrl={fileUrl}
          isSubmitting={isSubmitting}
          onFileChange={handleFileChange}
          onUrlChange={handleUrlChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ProjectSubmission;