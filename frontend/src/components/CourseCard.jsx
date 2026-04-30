import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, PlayCircle, BookOpen, X } from 'lucide-react';
import { getThumbnail } from '../helpers/thumbnailHelper';
import { apiFetch } from '../lib/api';

const CourseCard = ({ course, onUnenroll }) => {
  const courseId = course.id || course._id;
  const rating = course.rating ?? course.avgRating ?? '4.5';
  const instructorName =
    typeof course.instructor === 'string'
      ? course.instructor
      : (course.instructor?.name || 'Instructor');
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const navigate = useNavigate();

  const thumbnail = getThumbnail(course);

  const handleUnenroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    setIsUnenrolling(true);
    try {
      await apiFetch(`/api/enrollments/${courseId}`, {
        method: 'DELETE',
        auth: true
      });
      
      // Call parent callback to update UI
      if (onUnenroll) {
        onUnenroll(courseId);
      }
      
      // Refresh the page to update state
      navigate(0);
    } catch (error) {
      console.error('Unenroll failed:', error);
      alert('Failed to unenroll. Please try again.');
    } finally {
      setIsUnenrolling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={course.title || 'Course thumbnail'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-thumbnail.svg";
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${thumbnail ? 'hidden' : 'flex'}`}>
          <BookOpen className="w-16 h-16 text-white/85 drop-shadow-sm" aria-hidden />
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          {rating || '4.5'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            {course.category || 'Development'}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {instructorName}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <Clock className="w-4 h-4" />
              <span>{course.duration || ''}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <Users className="w-4 h-4" />
              <span>{course.students || ''}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/course/${courseId}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-indigo-600 outline-none hover:text-white text-indigo-600 py-2.5 rounded-xl font-medium transition-all group/btn"
          >
            <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            <span>{course.enrolled ? 'Continue Course' : 'Enroll Now'}</span>
          </Link>
          
          {course.enrolled && (
            <button
              onClick={handleUnenroll}
              disabled={isUnenrolling}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unenroll from course"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
