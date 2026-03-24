
import { useState, useRef } from 'react';
import { updateRoomImage } from '../../../services/Roomchatservice';

interface Props {
  roomId:        number;
  roomName:      string;
  currentImage?: string;
  onClose:       () => void;
  onUpdated:     (newImageUrl: string) => void;
}

const RoomImageModal = ({ roomId, roomName, currentImage, onClose, onUpdated }: Props) => {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [file,    setFile   ] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
    .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
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
      const res = await updateRoomImage(roomId, file) as {
        apiResponse?: { imageUrl?: string }
      };
      // Build full URL from relative path returned by backend
      const relativePath = res?.apiResponse?.imageUrl ?? '';
      const newUrl = relativePath
        ? `${BASE_URL}${relativePath}`
        : (preview ?? '');
      onUpdated(newUrl);  // ← passes full URL to parent
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displaySrc = preview
    ? (preview.startsWith('data:') ? preview : `${BASE_URL}${preview}`)
    : null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Change Group Photo</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Preview circle */}
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#2D9CDB]/20 cursor-pointer group"
            onClick={() => inputRef.current?.click()}
          >
            {displaySrc ? (
              <img src={displaySrc} alt={roomName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full bg-[#E8F3FF] flex items-center justify-center text-4xl font-bold text-[#2D9CDB]">
                {roomName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Click the image to select a new photo<br />
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
          </p>

          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp"
            className="hidden" onChange={handleFileChange} />

          <button onClick={() => inputRef.current?.click()}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#2D9CDB]/40 text-[#2D9CDB] text-sm font-medium hover:bg-[#E8F3FF] transition">
            Choose from device
          </button>

          {error && (
            <div className="w-full px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading || !file}
            className="flex-1 py-2.5 rounded-xl bg-[#2D9CDB] text-white text-sm font-medium hover:bg-[#2589c3] transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '✓'} Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomImageModal;