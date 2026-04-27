import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Clock, CheckCircle } from 'lucide-react';

const QuizCard = ({ quiz, courseId }) => {
  const isCompleted = quiz.status === 'completed';

  return (
    <div className={`
      relative p-5 rounded-2xl border transition-all
      ${isCompleted 
        ? 'bg-green-50/50 border-green-100 hover:border-green-200' 
        : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}
    `}>
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Score: {quiz.score}%</span>
          </div>
        </div>
      )}

      <div className="pr-20 mb-4">
        <h4 className="font-bold text-gray-900 text-lg">{quiz.title}</h4>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{quiz.description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          <span>{quiz.questionsCount || 10} Questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{quiz.duration || '15 mins'}</span>
        </div>
      </div>

      <Link 
        to={`/course/${quiz.courseId || courseId}/quiz`}
        className={`
          flex items-center justify-center w-full py-2.5 rounded-xl font-medium transition-all
          ${isCompleted
            ? 'bg-white border text-gray-700 hover:bg-gray-50'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'}
        `}
      >
        {isCompleted ? 'Review Quiz' : 'Start Quiz'}
      </Link>
    </div>
  );
};

export default QuizCard;
