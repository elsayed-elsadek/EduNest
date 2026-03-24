import type { FC } from 'react';
import { X } from 'lucide-react';

interface ModalOverlayProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalOverlay: FC<ModalOverlayProps> = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
    <div
      className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4 ">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ModalOverlay;



