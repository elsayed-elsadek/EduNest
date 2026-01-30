

import type { FC } from 'react';
import { Edit2 } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
}

const EditButton: FC<EditButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      aria-label="Edit"
    >
      <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </button>
  );
};

export default EditButton;