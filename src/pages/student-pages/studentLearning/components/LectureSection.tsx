import { useLecture } from '../../../../services/student-roleService/lecture.api';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface LectureSectionProps {
  lectureId: number;
  fallbackTitle: string;
}

const getEmbedUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop() || '';
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop() || '';
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Dailymotion
    if (hostname.includes('dailymotion.com') || hostname.includes('dai.ly')) {
      const videoId = urlObj.pathname.split('/').pop() || '';
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Google Drive
    if (hostname.includes('drive.google.com')) {
      const fileId = urlObj.pathname.split('/').pop() || '';
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return url;
  } catch {
    return url;
  }
};

const isDirectVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext)) || lowerUrl.startsWith('blob:');
};

const isEmbeddableUrl = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname.includes('youtube') ||
      hostname.includes('youtu.be') ||
      hostname.includes('vimeo') ||
      hostname.includes('dailymotion') ||
      hostname.includes('dai.ly') ||
      hostname.includes('drive.google.com')
    );
  } catch {
    return false;
  }
};

const LectureSection = ({ lectureId, fallbackTitle }: LectureSectionProps) => {
  const { data: lectureData, isLoading } = useLecture(lectureId);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white p-8 shadow-lg">
        <LoadingSpinner />
      </div>
    );
  }

  const lectureUrl = lectureData?.apiResponse?.lecture?.lectureUrl;
  const title = lectureData?.apiResponse?.lecture?.title || fallbackTitle;

  if (!lectureUrl) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg text-center">
        <h3 className="mb-2 text-xl font-bold text-slate-900">{fallbackTitle}</h3>
        <p className="text-slate-600">Lecture content is currently unavailable.</p>
      </div>
    );
  }

  const isDirectVideo = isDirectVideoUrl(lectureUrl);
  const isEmbeddable = isEmbeddableUrl(lectureUrl);

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="overflow-hidden rounded-3xl bg-black shadow-lg">
        <div className="relative w-full aspect-video">
          {isDirectVideo ? (
            <video
              src={lectureUrl}
              className="w-full h-full"
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : isEmbeddable ? (
            <iframe
              src={getEmbedUrl(lectureUrl)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
              <p className="mb-4 text-lg">This content cannot be embedded directly.</p>
              <a
                href={lectureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[var(--primary-500)] px-6 py-3 font-bold text-white transition hover:opacity-90"
              >
                Watch on {new URL(lectureUrl).hostname}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Lecture Info */}
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">
          Continue your learning journey by watching this lecture.
        </p>
      </div>
    </div>
  );
};

export default LectureSection;

