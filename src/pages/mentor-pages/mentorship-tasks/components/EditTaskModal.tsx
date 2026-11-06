import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';
import { getTaskById, updateTask } from '../../../../services/mentorshipsContent/task';
import type { UpdateTaskPayload } from '../../../../services/mentorshipsContent/task';
import toast from 'react-hot-toast';
import logger from '../../../../utils/logger';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: number | null;
    onSuccess: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, taskId, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(10);
    const [passPoints, setPassPoints] = useState(5);
    const [estimatedMinutes, setEstimatedMinutes] = useState(15);
    const [dueAt, setDueAt] = useState('');
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

    const [file, setFile] = useState<File | null>(null);
    const [attachmentUrl, setAttachmentUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !taskId) return;

        let active = true;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getTaskById(taskId);
                if (active) {
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setPoints(data.points || 10);
                    setPassPoints(data.passPoints || 5);
                    setEstimatedMinutes(data.estimatedMinutes || 15);

                    if (data.dueAt) {
                        try {
                            const dateObj = new Date(data.dueAt);
                            const year = dateObj.getFullYear();
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            const hours = String(dateObj.getHours()).padStart(2, '0');
                            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                            setDueAt(`${year}-${month}-${day}T${hours}:${minutes}`);
                        } catch (e) {
                            logger.error(e);
                        }
                    } else {
                        setDueAt('');
                    }

                    setStatus(data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
                    setFile(null);
                    setAttachmentUrl(data.attachmentUrl || '');
                }
            } catch (err) {
                if (active) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load task details';
                    toast.error(errorMessage);
                    onClose();
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            active = false;
        };
    }, [isOpen, taskId, onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskId) return;

        try {
            setSubmitting(true);

            let formattedDueAt = dueAt;
            if (dueAt) {
                formattedDueAt = dueAt.replace('T', ' ');
                if (formattedDueAt.length === 16) {
                    formattedDueAt += ':00';
                }
            }

            const payload: UpdateTaskPayload = {
                title,
                description,
                points,
                passPoints,
                estimatedMinutes,
                dueAt: formattedDueAt || undefined,
                status,
                attachmentUrl: attachmentUrl.trim() || undefined
            };

            await updateTask(taskId, payload, file || undefined);

            toast.success('Task updated successfully');
            onSuccess();
            onClose();
        } catch (err: unknown) {
            // التعامل الآمن مع الأخطاء بدون استخدام any لضمان عدم وجود أخطاء في الـ Linter
            let errorMessage = 'Failed to update task';
            if (err && typeof err === 'object') {
                const errorObj = err as { errorMessages?: { error?: string }; message?: string };
                errorMessage = errorObj.errorMessages?.error || errorObj.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden relative max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Edit Task</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="p-6 overflow-y-auto">
                        <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    maxLength={50}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    value={description}
                                    maxLength={150}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Points <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={points}
                                        onChange={e => setPoints(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pass Points <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max={points}
                                        value={passPoints}
                                        onChange={e => setPassPoints(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Minutes</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={estimatedMinutes}
                                        onChange={e => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={dueAt}
                                        onChange={e => setDueAt(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors bg-white"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ATTACHMENT <span className="text-gray-500 font-normal">(optional)</span></label>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Link to file</label>
                                        <input
                                            type="url"
                                            value={attachmentUrl}
                                            onChange={e => setAttachmentUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">OR Upload File</label>

                                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${
                                            file ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' : 'border-gray-300 bg-white'
                                        }`}>
                                            <div className="space-y-2 text-center w-full max-w-md mx-auto">
                                                {file ? (
                                                    <div className="flex flex-col items-center p-2 rounded-lg">
                                                        <div className="relative p-3 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-xl mb-2">
                                                            <FileIcon className="h-10 w-10" />
                                                            <button 
                                                                type="button"
                                                                onClick={handleRemoveFile}
                                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-md transition-colors"
                                                                title="Remove file"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-800 break-all max-w-xs">{file.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
                                                        <p className="text-xs text-[var(--primary-500)] font-medium mt-2 bg-[var(--primary-500)]/10 px-2 py-0.5 rounded-full">Ready to upload</p>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="cursor-pointer group flex flex-col items-center"
                                                    >
                                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <Upload className="text-gray-400 group-hover:text-[var(--primary-500)] transition-colors" size={24} />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or replace file</p>
                                                        <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-task-form"
                        disabled={submitting || loading}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;