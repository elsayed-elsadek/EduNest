import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSendEmail } from '../../../../services/admin-role-service/Admindashboardservice';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // استدعاء الـ Hook الخاص بالـ API
  const sendEmailMutation = useAdminSendEmail();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    // تنفيذ الـ Request
    sendEmailMutation.mutate(
      { userId, subject, message },
      {
        onSuccess: () => {
          // تفريغ الحقول وإغلاق المودل عند النجاح
          setSubject('');
          setMessage('');
          onClose();
          toast.success('Email sent successfully!');
        },
        onError: (error: any) => {
          const errMsg = error?.response?.data?.message || 'Failed to send email. Try again.';
          setErrorMsg(errMsg);
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md mx-4 relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Send Email</h3>
            <p className="text-xs text-slate-400 mt-0.5">To: <span className="font-semibold text-[var(--primary-500)]">{userName}</span></p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Important Account Update, Reminder..."
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all bg-slate-50/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your email message here..."
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/10 transition-all bg-slate-50/30 resize-none"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-4 border-t border-slate-50 pt-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={sendEmailMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendEmailMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;
