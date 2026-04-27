import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getStudentTaskDetails, type StudentTaskDetails, submitTask } from '../../../../services/student-roleService/submitTask';
import { AxiosError } from 'axios';
import AssimentDetailsPanel from './AssimentDetailsPanel';
import StudentSubmissionStatus from './StudentSubmissionStatus';
import SubmissionForm from './SubmissionForm';

interface AssignmentSubmissionProps {
  taskId: number;
}

const AssignmentSubmission = ({ taskId }: AssignmentSubmissionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskDetails, setTaskDetails] = useState<StudentTaskDetails | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  const loadTaskDetails = async () => {
    try {
      setIsLoadingTask(true);
      const details = await getStudentTaskDetails(taskId);
      setTaskDetails(details);
    } catch (error) {
      console.error('Error loading task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setIsLoadingTask(false);
    }
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

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

      await submitTask(taskId, payload);
      await loadTaskDetails(); // Refresh all details naturally
      toast.success('Task submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      const err = error as AxiosError<{ errorMessages?: { error?: string } }>;
      const errorMessage = err?.response?.data?.errorMessages?.error || 'Failed to submit task';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTask) {
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
      {/* Task Details - Left Side */}
      <div className="space-y-6">
        {taskDetails && <AssimentDetailsPanel taskDetails={taskDetails} />}
      </div>

      {/* Submission Section - Right Side */}
      <div className="space-y-6">
        {isLoadingTask ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 rounded mb-4"></div>
              <div className="h-20 bg-slate-200 rounded mb-4"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          taskDetails && <StudentSubmissionStatus taskDetails={taskDetails} />
        )}

        <SubmissionForm
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

export default AssignmentSubmission;