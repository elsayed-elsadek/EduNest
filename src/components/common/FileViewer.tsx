import React, { useMemo, useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    mammoth?: {
      convertToHtml?: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    };
  }
}

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
const VIDEO_EXT = ['mp4', 'webm', 'ogg'];
const AUDIO_EXT = ['mp3', 'wav', 'ogg'];
const PDF_EXT = ['pdf'];
const OFFICE_EXT = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

async function downloadFile(url: string, fallbackName = 'file') {
  try {
    const toastId = toast.loading('Starting download...');
    const response = await fetch(url);
    if (!response.ok) throw new Error('File fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    const filename = url.split('/').pop() || fallbackName;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    toast.success('Download complete', { id: toastId });
  } catch (err) {
    console.error('Download failed', err);
    toast.error('Download failed. Opening in new tab...');
    window.open(url, '_blank');
  }
}

interface FileViewerProps {
  url: string;
  className?: string;
  height?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ url, className = '', height = 'h-[420px]' }) => {
  const cleanedUrl = useMemo(() => (url || '').trim(), [url]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [convertedHtml, setConvertedHtml] = useState<string | null>(null);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(null);
    if (!cleanedUrl) return;

    const tryFetchBlob = async () => {
      // Only attempt blob preview for common web-renderable types
      if (!cleanedUrl) return;
      setLoading(true);
      try {
        const resp = await fetch(cleanedUrl, { credentials: 'include' });
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        const blob = await resp.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!mounted) return;
        setPreviewUrl(objectUrl);
      } catch (err) {
        console.warn('Preview fetch failed', err);
        if (mounted) setPreviewError('Preview not available for this file or server blocked access.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Only fetch blobs for types we can render via blob URL
    const ext = (() => {
      try {
        const p = cleanedUrl.split('?')[0].split('/').pop() || '';
        const dot = p.split('.');
        return dot.length > 1 ? dot[dot.length - 1].toLowerCase() : '';
      } catch {
        return '';
      }
    })();

    if (ext === 'docx') {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cleanedUrl)}&embedded=true`;

      const tryDocx = async () => {
        setLoading(true);
        setPreviewError(null);
        setConvertedHtml(null);
        setPreviewUrl(null);
        setEmbedFailed(false);

        try {
          const resp = await fetch(cleanedUrl, { credentials: 'include' });
          if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
          const arrayBuffer = await resp.arrayBuffer();

          try {
            // attempt to use window.mammoth (if loaded) or load mammoth from installed package/CDN at runtime
            const loadMammoth = async () => {
              if (typeof window !== 'undefined' && window.mammoth) return window.mammoth;

              try {
                const mod = await import('mammoth');
                const mammothLib = (mod && (mod.default || mod)) as Window['mammoth'] | undefined;
                if (mammothLib) {
                  window.mammoth = mammothLib;
                  return mammothLib;
                }
              } catch (e) {
                console.warn('Dynamic import of mammoth failed, falling back to CDN', e);
              }

              await new Promise<void>((resolve, reject) => {
                const existing = document.querySelector('script[data-mammoth-cdn]');
                if (existing) return resolve();
                const s = document.createElement('script');
                s.src = 'https://unpkg.com/mammoth/mammoth.browser.min.js';
                s.setAttribute('data-mammoth-cdn', '1');
                s.onload = () => resolve();
                s.onerror = () => reject(new Error('Failed to load mammoth from CDN'));
                document.head.appendChild(s);
              });
              return window.mammoth;
            };

            const mammoth = await loadMammoth();
            if (!mammoth || !mammoth.convertToHtml) throw new Error('mammoth not available');
            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            if (mounted) {
              setConvertedHtml(value as string);
              setPreviewError(null);
            }
          } catch (mErr) {
            console.warn('mammoth conversion failed, falling back to Google Docs Viewer', mErr);
            if (mounted) setPreviewUrl(googleViewerUrl);
          }
        } catch (err) {
          console.warn('Docx fetch failed', err);
          if (mounted) setPreviewError('Preview unavailable for this file or server blocked access.');
        } finally {
          if (mounted) setLoading(false);
        }
      };

      tryDocx();
      return () => { mounted = false; };
    }

    if (IMAGE_EXT.includes(ext) || VIDEO_EXT.includes(ext) || AUDIO_EXT.includes(ext) || PDF_EXT.includes(ext)) {
      tryFetchBlob();
    }

    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cleanedUrl]);

  if (!cleanedUrl) return null;

  const ext = (() => {
    try {
      const p = cleanedUrl.split('?')[0].split('/').pop() || '';
      const dot = p.split('.');
      return dot.length > 1 ? dot[dot.length - 1].toLowerCase() : '';
    } catch {
      return '';
    }
  })();

  const isImage = IMAGE_EXT.includes(ext);
  const isVideo = VIDEO_EXT.includes(ext);
  const isAudio = AUDIO_EXT.includes(ext);
  const isPdf = PDF_EXT.includes(ext);
  const isDocx = ext === 'docx';
  const isOffice = OFFICE_EXT.includes(ext);
  const isLink = !ext || (!isImage && !isVideo && !isAudio && !isPdf && !isOffice);

  const officeEmbed = isOffice && !isDocx
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanedUrl)}`
    : null;

  return (
    <div className={`w-full bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}>
      <div className={`w-full ${height} bg-black/5 ${isDocx ? 'overflow-hidden' : 'flex items-center justify-center'}`}>
        {loading && (
          <div className="text-center text-slate-500">Loading preview...</div>
        )}

        {!loading && isImage && (
          <img src={previewUrl || cleanedUrl} alt="attachment" className="max-w-full max-h-full object-contain" />
        )}

        {!loading && isVideo && (
          <video src={previewUrl || cleanedUrl} controls className="w-full h-full object-contain" />
        )}

        {!loading && isAudio && (
          <audio src={previewUrl || cleanedUrl} controls className="w-full" />
        )}

        {!loading && isPdf && (
          // prefer blob previewUrl when available to avoid CORS/iframe blocks
          <iframe src={previewUrl || cleanedUrl} className="w-full h-full" title="Document preview" />
        )}

        {!loading && ext === 'docx' && convertedHtml && (
          <div className="w-full h-full overflow-y-auto p-6" style={{ maxHeight: '100%' }}>
            <div
              className="prose prose-sm max-w-none"
              style={{
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8',
                color: '#1a1a1a',
              }}
              dangerouslySetInnerHTML={{ __html: convertedHtml }}
            />
          </div>
        )}

        {!loading && ext === 'docx' && !convertedHtml && previewUrl && (
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title="Document preview"
            onError={() => {
              if (previewUrl?.startsWith('https://docs.google.com/viewer')) {
                setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanedUrl)}`);
                return;
              }
              setEmbedFailed(true);
              setPreviewError('Preview unavailable. You can download the file to view it locally.');
            }}
            onLoad={() => setEmbedFailed(false)}
          />
        )}

        {!loading && isOffice && officeEmbed && !embedFailed && (
          <iframe
            src={officeEmbed}
            className="w-full h-full"
            title="Document preview"
            onError={() => setEmbedFailed(true)}
            onLoad={() => setEmbedFailed(false)}
          />
        )}

        {!loading && isOffice && embedFailed && (
          <div className="p-6 text-center text-slate-700">
            <FileText className="mx-auto mb-3 w-8 h-8 text-slate-500" />
            <p className="font-semibold">Cannot preview Office document</p>
            <p className="text-sm text-slate-500 mb-4">This often happens for Word/Excel/PowerPoint files or when the server blocks embedding.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (officeEmbed) window.open(officeEmbed, '_blank', 'noopener');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Open in Office Online
              </button>

              <button
                onClick={() => {
                  window.open(cleanedUrl, '_blank', 'noopener');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-500)] text-white px-3 py-1.5 text-sm font-medium hover:opacity-95"
              >
                Open
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">If preview still fails, download and open locally.</p>
          </div>
        )}

        {!loading && isLink && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <ExternalLink className="w-10 h-10 text-slate-400" />
            <div className="text-center">
              <p className="font-semibold text-slate-700">Submitted Link</p>
              <p className="text-sm text-slate-500 mt-1 break-all max-w-xs">{cleanedUrl}</p>
            </div>
            <a
              href={cleanedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-500)] text-white px-5 py-2 text-sm font-medium hover:opacity-95"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {!loading && !isLink && !isImage && !isVideo && !isAudio && !isPdf && !isOffice && (
          <div className="text-center p-6 text-slate-600">
            <FileText className="mx-auto mb-3 w-8 h-8 text-slate-500" />
            <p className="font-semibold">Preview not available</p>
            <p className="text-sm">Open or download the file to view it.</p>
          </div>
        )}

        {!loading && previewError && (
          <div className="text-center p-4 text-sm text-amber-600">{previewError}</div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-3">
        {!isLink && (
          <button
            onClick={() => downloadFile(cleanedUrl)}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}

        <a
          href={cleanedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-500)] text-white px-3 py-1.5 text-sm font-medium hover:opacity-95"
        >
          <ExternalLink className="w-4 h-4" />
          {isLink ? 'Open Link' : 'Open'}
        </a>
      </div>
    </div>
  );
};

export default FileViewer;
