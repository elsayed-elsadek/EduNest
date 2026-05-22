import type { ChangeEvent } from 'react';
import { Upload, Link, Send } from 'lucide-react';

interface SubmissionFormProps {
  file: File | null;
  fileUrl: string;
  isSubmitting: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const SubmissionForm = ({
  file,
  fileUrl,
  isSubmitting,
  onFileChange,
  onUrlChange,
  onSubmit
}: SubmissionFormProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Assignment</h3>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
              disabled={!!fileUrl.trim()}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${fileUrl.trim() ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-[var(--primary-500)]'
                }`}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {file ? file.name : 'Click to upload file'}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-4 text-sm text-slate-500 bg-white">OR</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            External URL
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={fileUrl}
              onChange={onUrlChange}
              placeholder="https://example.com/file.pdf"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
              disabled={!!file}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting || (!file && !fileUrl.trim())}
          className="w-full bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  );
};

export default SubmissionForm;
