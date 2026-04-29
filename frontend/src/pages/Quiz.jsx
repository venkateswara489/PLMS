import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [quizData, setQuizData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        // Minimal “real data” source: course detail. If no quizzes exist yet, show empty state.
        const data = await apiFetch(`/api/courses/${id}`);
        const course = data.course;

        const quizLessons = (course?.modules || []).flatMap((m) =>
          (m.lessons || []).filter((l) => l.type === 'quiz' && Array.isArray(l.questions) && l.questions.length > 0)
        );

        const firstQuiz = quizLessons[0] || null;
        if (!firstQuiz) {
          setQuizData({ title: 'Quiz', timeRemaining: '—', questions: [] });
        } else {
          setQuizData({
            title: firstQuiz.title || 'Quiz',
            timeRemaining: '—',
            questions: firstQuiz.questions.map((q, idx) => ({
              id: idx + 1,
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load quiz');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const questions = quizData?.questions || [];
    const totalQuestions = questions.length;
    
    // Prepare answers object for API
    const answersPayload = {};
    questions.forEach((question, idx) => {
      const selectedIndex = answers[question.id];
      if (selectedIndex !== undefined) {
        answersPayload[question.id] = question.options?.[selectedIndex] || '';
      }
    });

    try {
      setLoading(true);
      const response = await apiFetch(`/api/quiz/${id}/submit`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ answers: answersPayload }),
      });

      const result = response.result;
      navigate(`/course/${id}/quiz/result`, {
        state: {
          result: {
            score: result.score,
            passed: result.passed,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            timeSpent: result.timeSpent,
            recommendations: result.recommendations || [],
          },
        },
      });
    } catch (error) {
      console.error('Quiz submission error:', error);
      setError('Failed to submit quiz. Please try again.');
      
      // Fallback to local calculation if API fails
      const correctAnswers = questions.reduce((count, question) => {
        const selectedIndex = answers[question.id];
        if (selectedIndex === undefined) return count;
        const selectedOption = question.options?.[selectedIndex];
        return selectedOption === question.correctAnswer ? count + 1 : count;
      }, 0);
      const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      navigate(`/course/${id}/quiz/result`, {
        state: {
          result: {
            score,
            passed: score >= 60,
            totalQuestions,
            correctAnswers,
            timeSpent: '—',
            recommendations: [],
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const currentQ = quizData?.questions?.[currentQuestion];
  const totalQuestions = quizData?.questions?.length || 0;
  const progress = totalQuestions ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const isLastQuestion = totalQuestions ? currentQuestion === totalQuestions - 1 : true;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      <div className="w-full max-w-4xl">
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 text-gray-600">
            Loading quiz…
          </div>
        )}
        {error && (
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 mb-6 text-red-700">
            {error}
          </div>
        )}
        {quizData && totalQuestions === 0 && !loading && !error && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-600">
            No quiz is configured for this course yet.
          </div>
        )}
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{quizData?.title || 'Quiz'}</h1>
            <p className="text-gray-500 font-medium text-sm">
              {totalQuestions ? `Question ${currentQuestion + 1} of ${totalQuestions}` : 'No questions available'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-5 py-3 rounded-2xl font-bold tracking-wider tabular-nums border border-red-100 shadow-sm">
            <Clock className="w-5 h-5" />
            {quizData?.timeRemaining || '—'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Container */}
        {currentQ && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 md:p-12 mb-8 relative">
          
          {/* Decorative Number */}
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-200 transform -rotate-6">
            {currentQuestion + 1}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-relaxed pl-8 md:pl-0 mt-4 md:mt-0">
            {currentQ.question}
          </h2>

          <div className="space-y-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`
                    w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 group
                    ${isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}
                  `}
                >
                  <div className={`
                    w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors mt-0.5
                    ${isSelected 
                      ? 'border-indigo-600 bg-indigo-600 shadow-inner' 
                      : 'border-gray-300 group-hover:border-indigo-400'}
                  `}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-lg leading-relaxed ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0 || totalQuestions === 0}
            className={`
              flex items-center px-6 py-3.5 rounded-xl font-bold transition-colors
              ${currentQuestion === 0 
                ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-100' 
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 shadow-sm'}
            `}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={totalQuestions === 0}
              className="flex items-center px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Next Question
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={totalQuestions === 0 || Object.keys(answers).length !== totalQuestions}
              className={`
                flex items-center px-10 py-3.5 rounded-xl font-bold transition-all
                ${totalQuestions > 0 && Object.keys(answers).length === totalQuestions
                  ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200 transform hover:-translate-y-1'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'}
              `}
            >
              Submit Quiz
              <CheckCircle className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Quiz;
