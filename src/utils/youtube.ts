/**
 * YouTube Utility Helpers for SignBridge AI
 * Provides robust extraction of video IDs, embed URLs, and direct watch links
 * Supporting standard watch URLs, embed URLs, youtu.be shortlinks, and YouTube Shorts.
 */

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  // YouTube Shorts: /shorts/ID
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  // Standard watch query: ?v=ID or &v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // Embed format: /embed/ID
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // youtu.be shortlink: youtu.be/ID
  const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuMatch) return youtuMatch[1];
  return null;
}

export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || Boolean(getYouTubeVideoId(url));
}

export function getYouTubeEmbedUrl(url?: string): string {
  if (!url) return '';
  const id = getYouTubeVideoId(url);
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=0`;
  }
  return url;
}

export function getYouTubeWatchUrl(url?: string): string {
  if (!url) return '';
  const id = getYouTubeVideoId(url);
  if (id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
}
