import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';
import { getTaskById, updateTask } from '../../../../services/mentorshipsContent/task';
import type { UpdateTaskPayload } from '../../../../services/mentorshipsContent/task';
import toast from 'react-hot-toast';

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
                            // Format to YYYY-MM-DDThh:mm for datetime-local
                            const year = dateObj.getFullYear();
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            const hours = String(dateObj.getHours()).padStart(2, '0');
                            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                            setDueAt(`${year}-${month}-${day}T${hours}:${minutes}`);
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        setDueAt('');
                    }

                    setStatus(data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
                    setFile(null);
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (active) {
                    toast.error(err?.message || 'Failed to load task details');
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

    const handleRemoveFile = () => {
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

            // Format date for backend API if present
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
                status
            };

            await updateTask(taskId, payload, file || undefined);
            toast.success('Task updated successfully');
            onSuccess();
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMessage = err?.errorMessages?.error || err?.message || 'Failed to update task';
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
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="p-6 overflow-y-auto">
                        <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none"
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={dueAt}
                                        onChange={e => setDueAt(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment File (Optional)</label>

                                {!file ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="text-blue-500" size={24} />
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
                                ) : (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                                                <FileIcon className="text-blue-500" size={20} />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
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
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50"
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
