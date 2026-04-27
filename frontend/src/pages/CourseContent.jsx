import React, { useEffect, useMemo, useState } from 'react';
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

  const completedKeys = useMemo(() => new Set(enrollment?.completedLessonKeys || []), [enrollment]);
  const progressPercent = enrollment?.progressPercent ?? 0;
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
    } catch (e) {
      setError(e.message || 'Failed to enroll');
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
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-4">{error}</div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 w-full aspect-video relative group">
          {activeLesson ? (
            activeLesson.lesson.type === 'video' && getYouTubeVideoId(getLessonVideoUrl(activeLesson.lesson)) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(getLessonVideoUrl(activeLesson.lesson))}`}
                title={activeLesson.lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
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
          
          {/* Mock Video Controls - only show for video content */}
          {activeLesson?.lesson.type === 'video' && (
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <div className="w-full flex items-center gap-4 text-white">
                <PlayCircle className="w-6 h-6" />
                <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-indigo-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">05:45 / 25:00</span>
              </div>
            </div>
          )}
        </div>

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
