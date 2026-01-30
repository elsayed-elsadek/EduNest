
import  type { FC } from 'react';
import { Search } from 'lucide-react';

interface StudentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const StudentSearch: FC<StudentSearchProps> = ({ 
  value, 
  onChange,
  placeholder = "Search tudent by name or mentorship..."
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-14 pl-12 pr-6 
          bg-white border border-gray-200 rounded-xl
          text-sm text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all
        "
      />
    </div>
  );
};

export default StudentSearch;