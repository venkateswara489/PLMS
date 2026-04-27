import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowRight, BookOpen, PlayCircle } from 'lucide-react';

const QuizResult = () => {
  const { id } = useParams();
  const location = useLocation();

  const result = location.state?.result || null;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {!result && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-600">
            Quiz results are not available yet (attempt saving is not enabled).
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/course/${id}/quiz`}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2 text-gray-400" />
                Retake Quiz
              </Link>
              <Link
                to={`/course/${id}`}
                className="flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
              >
                Continue Course
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        )}
        
        {/* Main Result Card */}
        {result && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 relative">
          
          {/* Top Decorative Banner */}
          <div className={`h-32 w-full absolute top-0 left-0 ${result.passed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}>
            <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, white 20%, white 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, white 20%, white 80%, transparent 80%, transparent)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', opacity: 0.1 }}></div>
          </div>

          <div className="relative pt-24 px-8 pb-10 text-center flex flex-col items-center">
            {/* Score Badge */}
            <div className={`w-28 h-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-6 bg-white z-10 ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
              {result.passed ? (
                <Award className="w-14 h-14" />
              ) : (
                <XCircle className="w-14 h-14" />
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              You scored <span className="font-bold text-gray-900">{result.score}%</span> on this assessment.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mx-auto mb-10">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalQuestions}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium mb-1">Correct</p>
                <p className="text-2xl font-bold text-emerald-700">{result.correctAnswers}</p>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                <p className="text-sm text-indigo-600 font-medium mb-1">Time</p>
                <p className="text-2xl font-bold text-indigo-700">{result.timeSpent}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Link 
                to={`/course/${id}/quiz`}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2 text-gray-400" />
                Retake Quiz
              </Link>
              <Link 
                to={`/course/${id}`}
                className="flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
              >
                Continue Course
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Recommendations Panel */}
        {result && result.recommendations.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 justify-start flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Recommended Review Materials
            </h3>
            
            <div className="space-y-3">
              {result.recommendations.map(rec => (
                <Link 
                  key={rec.id} 
                  to={`/course/${id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {rec.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{rec.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizResult;
