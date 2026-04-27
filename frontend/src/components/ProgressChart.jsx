import React from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

const ProgressChart = ({ stats }) => {
  // A simple placeholder for a progress chart
  const defaultStats = stats || {
    completionRate: 68,
    coursesCompleted: 4,
    totalCourses: 7,
    learningHours: 32,
    currentStreak: 5,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Learning Progress</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          View Details
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {/* Circular Progress Placeholder */}
        <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-100 stroke-current"
              strokeWidth="10"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-indigo-600 stroke-current transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * defaultStats.completionRate) / 100}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{defaultStats.completionRate}%</span>
            <span className="text-xs text-gray-500 font-medium uppercase mt-1">Completed</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-indigo-50/50 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Courses</p>
              <p className="text-lg font-bold text-gray-900">
                {defaultStats.coursesCompleted} 
                <span className="text-sm font-normal text-gray-400">/{defaultStats.totalCourses}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-orange-50/50 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Day Streak</p>
              <p className="text-lg font-bold text-gray-900">{defaultStats.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
