import { useState, useRef } from 'react';
import { updateRoomImage } from '../../../services/Roomchatservice';

interface Props {
  roomId: number;
  roomName: string;
  currentImage?: string;
  onClose: () => void;
  onUpdated: (newImageUrl: string) => void;
}

const RoomImageModal = ({ roomId, roomName, currentImage, onClose, onUpdated }: Props) => {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/$/, '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = (await updateRoomImage(roomId, file)) as {
        apiResponse?: { imageUrl?: string };
      };
      const relativePath = res?.apiResponse?.imageUrl ?? '';
      const newUrl = relativePath ? `${BASE_URL}${relativePath}` : preview ?? '';
      onUpdated(newUrl);
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Change Group Image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Current Preview */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt={roomName}
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={() => {
                  setPreview(currentImage ?? null);
                  setFile(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Input */}
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-[#0c2d48] bg-[#0c2d48]/5 text-sm font-medium text-[#0c2d48] hover:bg-[#0c2d48]/10 transition"
            >
              📸 Choose Image
            </button>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              JPG, PNG. Max 5MB
            </p>
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !file}
            className="flex-1 py-2.5 rounded-xl bg-[#0c2d48] text-white text-sm font-medium hover:bg-[#083a62] transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '✓'
            )}{' '}
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomImageModal;