import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronDown, ChevronUp, MessageSquare, Download } from 'lucide-react';
import { apiFetch } from '../lib/api';

const CourseContent = () => {
  const { id } = useParams();
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize completed lessons from enrollment
  useEffect(() => {
    if (enrollment?.completedLessonKeys) {
      setCompletedLessons(new Set(enrollment.completedLessonKeys));
    }
  }, [enrollment]);

  const getYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

    // If a plain 11-char id is stored directly, use it as-is.
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) return trimmedUrl;

    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        const shortId = parsed.pathname.split('/').filter(Boolean)[0];
        return shortId && shortId.length === 11 ? shortId : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
        const watchId = parsed.searchParams.get('v');
        if (watchId && watchId.length === 11) return watchId;

        if (parsed.pathname.startsWith('/embed/')) {
          const embedId = parsed.pathname.split('/')[2];
          return embedId && embedId.length === 11 ? embedId : null;
        }

        if (parsed.pathname.startsWith('/shorts/')) {
          const shortsId = parsed.pathname.split('/')[2];
          return shortsId && shortsId.length === 11 ? shortsId : null;
        }
      }
    } catch {
      // Fall back to regex parsing for malformed URLs.
    }

    const fallback = normalizedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return fallback?.[1] || null;
  };

  const getLessonVideoUrl = (lesson) => {
    if (!lesson || typeof lesson !== 'object') return '';
    return lesson.contentUrl || lesson.content || course?.youtubeUrl || '';
  };

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const courseData = await apiFetch(`/api/courses/${id}`);
        if (cancelled) return;
        setCourse(courseData.course || null);

        if (user?.role === 'student') {
          try {
            const enrollData = await apiFetch(`/api/enrollments/course/${id}`, { auth: true });
            if (!cancelled) setEnrollment(enrollData.enrollment || null);
          } catch {
            if (!cancelled) setEnrollment(null);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load course');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id, user?.role]);

  // Set first video lesson as active when course loads
  useEffect(() => {
    if (course?.modules && !activeLesson) {
      for (const module of course.modules) {
        if (module.lessons) {
          const firstVideoLesson = module.lessons.find(lesson => lesson.type === 'video');
          if (firstVideoLesson) {
            setActiveLesson({
              moduleIndex: course.modules.indexOf(module),
              lessonIndex: module.lessons.indexOf(firstVideoLesson),
              lesson: firstVideoLesson
            });
            break;
          }
        }
      }
    }
  }, [course, activeLesson]);

    // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }
  }, []);

  // Create YouTube player when lesson changes
  useEffect(() => {
    if (!activeLesson || activeLesson.lesson.type !== 'video' || !playerReady) return;

    const videoId = getYouTubeVideoId(getLessonVideoUrl(activeLesson.lesson));
    if (!videoId) return;

    // Clean up previous player
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }

    // Create new player
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          setIsVideoPlaying(true);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsVideoPlaying(true);
          } else {
            setIsVideoPlaying(false);
          }
        }
      }
    });

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [activeLesson, playerReady]);

  // Track video progress for display only (no auto-completion)
  useEffect(() => {
    if (!isVideoPlaying || !playerRef.current) return;

    const interval = setInterval(() => {
      try {
        const player = playerRef.current;
        if (player.getCurrentTime && player.getDuration) {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          
          if (duration > 0) {
            const progress = Math.round((currentTime / duration) * 100);
            setVideoProgress(progress);
          }
        }
      } catch (err) {
        console.error('Progress tracking failed:', err);
      }
    }, 1000);

    intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  const completedKeys = useMemo(() => new Set(enrollment?.completedLessonKeys || []), [enrollment]);
  const progressPercent = Math.min(100, Math.max(0, enrollment?.progressPercent ?? 0));
  const modules = course?.modules || [];

  const getIconForType = (type, completed, isCurrent) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    switch(type) {
      case 'video': return <PlayCircle className={`w-5 h-5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />;
      case 'pdf': return <FileText className={`w-5 h-5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />;
      case 'note': return <FileText className={`w-5 h-5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />;
      case 'quiz': return <MessageSquare className={`w-5 h-5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />;
      default: return <PlayCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleEnroll = async () => {
    try {
      const data = await apiFetch(`/api/courses/${id}/enroll`, { method: 'POST', auth: true });
      setEnrollment(data.enrollment);
      // Refresh enrollment data
      const enrollData = await apiFetch(`/api/enrollments/course/${id}`, { auth: true });
      setEnrollment(enrollData.enrollment || data.enrollment);
    } catch (e) {
      setError(e.message || 'Failed to enroll');
    }
  };

  const handleMarkAsCompleted = async () => {
    console.log('Mark as Completed clicked');
    
    if (!activeLesson) {
      console.log('No active lesson found');
      return;
    }
    
    const lessonId = `${activeLesson.moduleIndex}:${activeLesson.lessonIndex}`;
    const userId = user?._id;
    console.log('User ID:', userId, 'Lesson ID:', lessonId, 'Course ID:', id);
    
    if (!userId) {
      console.log('No user ID found');
      setError('User not logged in');
      return;
    }
    
    try {
      console.log('Sending API request to /api/progress/complete');
      const response = await apiFetch('/api/progress/complete', {
        method: 'POST',
        auth: true,
        body: {
          userId,
          courseId: id,
          lessonId
        }
      });

      console.log('API Response:', response);

      if (response.success) {
        console.log('Lesson marked as completed successfully');

        setCompletedLessons(prev => new Set([...prev, lessonId]));

        if (enrollment) {
          setEnrollment(prev => ({
            ...prev,
            progressPercent: response.progressPercentage,
            completedLessonKeys: response.completedLessons
          }));
        }

        setError(response.message || 'Lesson marked as completed');
        setTimeout(() => setError(''), 3000);
      } else {
        console.log('API returned failure:', response);
        setError(response.message || 'Failed to mark lesson as completed');
      }
    } catch (e) {
      console.error('Error marking lesson as completed:', e);
      setError(e.message || 'Failed to mark lesson as completed');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      
      {/* Main Content Area (Video) */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {loading && (
          <div className="p-6 text-gray-600">Loading course…</div>
        )}
        {error && (
          <div className="p-6">
            <div className={`border rounded-2xl p-4 ${
              error.includes('completed') || error.includes('Course completed')
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-white border-red-100 text-red-700'
            }`}>{error}</div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 w-full aspect-video relative">
          {activeLesson ? (
            activeLesson.lesson.type === 'video' ? (
              <div id="youtube-player" className="w-full h-full" style={{ pointerEvents: 'auto' }}></div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-indigo-600/90 hover:bg-indigo-600 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                    <PlayCircle className="w-10 h-10 text-white fill-current ml-1" />
                  </div>
                  <p className="text-lg font-medium">{activeLesson.lesson.title}</p>
                  <p className="text-sm opacity-75">
                    {activeLesson.lesson.type === 'pdf' ? 'PDF Document' : 
                     activeLesson.lesson.type === 'note' ? 'Notes' : 
                     activeLesson.lesson.type === 'quiz' ? 'Quiz' : 'Video Content'}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-indigo-600/90 hover:bg-indigo-600 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                  <PlayCircle className="w-10 h-10 text-white fill-current ml-1" />
                </div>
                <p className="text-lg font-medium">Select a lesson to begin</p>
                <p className="text-sm opacity-75">Choose a lesson from the curriculum</p>
              </div>
            </div>
          )}
        </div>

        {/* Mark as Completed Button */}
        {activeLesson && enrollment && user?.role === 'student' && (
          <div className="p-6 lg:px-10">
            <div className="max-w-5xl mx-auto">
              {completedLessons.has(`${activeLesson.moduleIndex}:${activeLesson.lessonIndex}`) ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Completed
                </div>
              ) : (
                <button
                  onClick={handleMarkAsCompleted}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{course?.title || 'Course'}</h1>
              <p className="text-lg text-gray-600">
                {course?.instructor?.name ? `Instructor: ${course.instructor.name}` : ''}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <Download className="mr-2 -ml-1 h-4 w-4 text-gray-400" />
                Resources
              </button>
              {user?.role === 'student' && !enrollment ? (
                <button
                  onClick={handleEnroll}
                  className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Enroll
                </button>
              ) : (
                <Link 
                  to={`/course/${id}/quiz`}
                  className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Start Quiz
                </Link>
              )}
            </div>
          </div>

          <div className="prose prose-indigo max-w-none text-gray-600 pb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lesson Overview</h3>
            <p className="leading-relaxed mb-4">
              {course?.description || 'This course description will appear here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Course Curriculum Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 overflow-y-auto flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
          
          <div className="mb-2 flex justify-between items-center text-sm font-medium text-gray-700">
            <span>Progress: {progressPercent}%</span>
            <span className="text-indigo-600">{enrollment ? 'Enrolled' : 'Not enrolled'}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {modules.map((module, moduleIndex) => (
            <div key={`${moduleIndex}-${module.title}`} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-sm">
              <button 
                onClick={() => setActiveModule(activeModule === moduleIndex ? null : moduleIndex)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 lg:truncate">
                    Section {moduleIndex + 1}: {module.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {(module.lessons || []).length} lessons
                  </p>
                </div>
                {activeModule === moduleIndex ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {activeModule === moduleIndex && (
                <div className="bg-white border-t border-gray-100 divide-y divide-gray-50">
                  {(module.lessons || []).map((lesson, lessonIndex) => {
                    const key = `${moduleIndex}:${lessonIndex}`;
                    const completed = completedKeys.has(key);
                    const isActive = activeLesson && activeLesson.moduleIndex === moduleIndex && activeLesson.lessonIndex === lessonIndex;
                    return (
                    <div 
                      key={`${key}-${lesson.title}`} 
                      className={`
                        flex items-center justify-between p-4 cursor-pointer transition-colors
                        ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => setActiveLesson({ moduleIndex, lessonIndex, lesson })}
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="mt-0.5">
                          {getIconForType(lesson.type, completed, isActive)}
                        </div>
                        <div className="min-w-0">
                          <p className={`
                            text-sm font-medium truncate mb-0.5
                            ${isActive ? 'text-indigo-700' : 'text-gray-700'}
                          `}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500">
                              {lesson.durationSeconds ? `${Math.round(lesson.durationSeconds / 60)} min` : ''}
                             </span>
                             {lesson.type === 'quiz' && (
                               <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-1.5 rounded">Quiz</span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default CourseContent;
