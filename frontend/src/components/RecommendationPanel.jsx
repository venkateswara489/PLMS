import React from 'react';
import CourseCard from './CourseCard';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationPanel = ({ recommendations }) => {
  const recommendedCourses = Array.isArray(recommendations) ? recommendations : [];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
        <Sparkles className="w-48 h-48" />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute top-1/2 -right-12 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-400/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Personalized Picks for You
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Level up your skills with these courses
          </h2>
          
          <p className="text-indigo-200 text-lg max-w-lg">
            Based on your recent activity, we think you'll love these hand-picked learning paths to accelerate your career.
          </p>
          
          <Link 
            to="/courses"
            className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg mt-2"
          >
            Explore All Courses
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="w-full md:w-[45%] lg:w-[40%] text-gray-900">
          {recommendedCourses.length > 0 ? (
            <div className="transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-2xl rounded-2xl">
              <CourseCard course={recommendedCourses[0]} />
            </div>
          ) : (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 text-indigo-100">
              <p className="font-semibold">No recommendations yet.</p>
              <p className="text-sm mt-1 text-indigo-200/80">Complete a course lesson to get personalized picks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;
