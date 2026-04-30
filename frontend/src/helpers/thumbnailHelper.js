/**
 * Helper function to get course thumbnail with fallback
 * @param {Object} course - Course object
 * @returns {string} Thumbnail URL
 */
export function getThumbnail(course) {
  if (!course || typeof course !== 'object') return '/default-thumbnail.svg';

  if (course.thumbnail) return course.thumbnail;
  if (course.thumbnailUrl) return course.thumbnailUrl;

  if (course.videoUrl) {
    const videoId = extractVideoId(course.videoUrl);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  if (course.modules) {
    for (const module of course.modules) {
      for (const lesson of module.lessons || []) {
        if (lesson.type === 'video' && lesson.contentUrl) {
          const videoId = extractVideoId(lesson.contentUrl);
          if (videoId) return `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }
      }
    }
  }

  return '/default-thumbnail.svg';
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube video URL
 * @returns {string|null} Video ID
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
}
