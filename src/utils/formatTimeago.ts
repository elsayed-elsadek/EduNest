export const formatTimeAgo = (isoDate: string): string => {
  if (!isoDate) return '';
  // Backend sends timestamps without timezone → treat as UTC by appending Z
  const utc  = isoDate.endsWith('Z') || isoDate.includes('+') ? isoDate : isoDate + 'Z';
  const diff  = Date.now() - new Date(utc).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (diff  < 0)    return 'Just now';
  if (mins  < 1)    return 'Just now';
  if (mins  < 60)   return `${mins}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days  < 7)    return `${days}d ago`;
  return new Date(utc).toLocaleDateString([], { month: 'short', day: 'numeric' });
};