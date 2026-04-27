import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialQuestions = [
  {
    id: 1,
    text: '',
    type: 'multiple',
    options: ['', ''],
    correct: 0,
    points: 5,
  },
];

const CourseQuizManager = () => {
  const [activeTab, setActiveTab] = useState('upload');

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    instructor: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    credits: '',
    file: '',
  });

  const [modules, setModules] = useState([
    { id: 1, title: '', type: 'video', content: '' },
  ]);

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    courseCode: '',
    duration: '',
    passingScore: '',
    description: '',
  });
  const [questions, setQuestions] = useState(initialQuestions);

  const [courses, setCourses] = useState(() => {
    const data = localStorage.getItem('courseQuizManagerCourses');
    return data ? JSON.parse(data) : [];
  });
  const [quizzes, setQuizzes] = useState(() => {
    const data = localStorage.getItem('courseQuizManagerQuizzes');
    return data ? JSON.parse(data) : [];
  });

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('courseQuizManagerCourses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('courseQuizManagerQuizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      code: '',
      instructor: '',
      description: '',
      category: '',
      level: '',
      duration: '',
      credits: '',
      file: '',
    });
    setModules([{ id: 1, title: '', type: 'video', content: '' }]);
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { id: Date.now(), title: '', type: 'video', content: '' },
    ]);
  };

  const removeModule = (id) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const updateModule = (id, field, value) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleCourseUpload = (event) => {
    event.preventDefault();

    const newCourse = {
      id: Date.now(),
      ...courseForm,
      modules,
      uploadDate: new Date().toLocaleDateString(),
    };

    setCourses((prev) => [...prev, newCourse]);
    resetCourseForm();
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const resetQuizForm = () => {
    setQuizForm({ title: '', courseCode: '', duration: '', passingScore: '', description: '' });
    setQuestions(initialQuestions);
  };

  const handleQuizCreation = (event) => {
    event.preventDefault();

    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      return;
    }

    const newQuiz = {
      id: Date.now(),
      ...quizForm,
      questions: validQuestions,
      createdDate: new Date().toLocaleDateString(),
    };

    setQuizzes((prev) => [...prev, newQuiz]);
    resetQuizForm();
    setQuizSuccess(true);
    setTimeout(() => setQuizSuccess(false), 2500);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), text: '', type: 'multiple', options: ['', ''], correct: 0, points: 5 },
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestionField = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateQuestionOption = (questionId, index, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const courseList = useMemo(() => courses, [courses]);
  const quizList = useMemo(() => quizzes, [quizzes]);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-8 px-6">
          <h1 className="text-3xl font-bold">📚 Course builder</h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100">
            Instructor tools — upload course materials and create quizzes in one place.
          </p>
        </header>

        <div className="tabs flex border-b border-gray-200 bg-gray-50">
          {['upload', 'quiz', 'view'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button flex-1 py-4 text-center font-semibold text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-white border-b-4 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'upload' && 'Course Upload'}
              {tab === 'quiz' && 'Create Quiz'}
              {tab === 'view' && 'View Content'}
            </button>
          ))}
        </div>

        <div className="content p-6 sm:p-8">
          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2 className="text-2xl font-bold mb-5">📤 Upload Course Material</h2>

              {uploadSuccess && (
                <div className="success-message mb-6 show">
                  ✓ Course uploaded successfully!
                </div>
              )}

              <form onSubmit={handleCourseUpload} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="courseName">Course Name *</label>
                    <input
                      id="courseName"
                      type="text"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="courseCode">Course Code *</label>
                    <input
                      id="courseCode"
                      type="text"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="instructor">Instructor Name *</label>
                    <input
                      id="instructor"
                      type="text"
                      value={courseForm.instructor}
                      onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Photography">Photography</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="level">Level *</label>
                    <select
                      id="level"
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration (hours) *</label>
                    <input
                      id="duration"
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                </div>

                <div className="form-group">
                  <label htmlFor="courseDescription">Course Description *</label>
                  <textarea
                    id="courseDescription"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[100px] focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="courseFile">Upload Course Material *</label>
                  <input
                    id="courseFile"
                    type="text"
                    placeholder="Paste file URL"
                    value={courseForm.file}
                    onChange={(e) => setCourseForm({ ...courseForm, file: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="text-lg font-semibold mt-6 mb-2">Modules</div>
                <div className="space-y-4">
                  {modules.map((module, idx) => (
                    <div key={module.id} className="module-item border border-gray-200 p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Module {idx + 1}</h4>
                        {modules.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 text-sm hover:text-red-700"
                            onClick={() => removeModule(module.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={module.title}
                          placeholder="Module title"
                          onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                          required
                        />
                        <select
                          value={module.type}
                          onChange={(e) => updateModule(module.id, 'type', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="video">Video</option>
                          <option value="reading">Reading</option>
                          <option value="assignment">Assignment</option>
                        </select>
                        <input
                          type="text"
                          value={module.content}
                          placeholder="Content URL or description"
                          onChange={(e) => updateModule(module.id, 'content', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addModule}
                    className="text-indigo-700 font-semibold text-sm hover:text-indigo-900"
                  >
                    + Add Module
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn btn-primary bg-indigo-600 text-white rounded-lg px-5 py-2 hover:bg-indigo-700" >Upload Course</button>
                  <button type="button" className="btn btn-secondary bg-gray-200 text-gray-700 rounded-lg px-5 py-2 hover:bg-gray-300" onClick={resetCourseForm}>Clear Form</button>
                  <button type="button" className="btn-secondary bg-slate-100 text-slate-700 rounded-lg px-5 py-2 hover:bg-slate-200" onClick={() => navigate('/instructor-dashboard')}>
                    Back
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="tab-content">
              <h2 className="text-2xl font-bold mb-5">❓ Create Quiz</h2>

              {quizSuccess && (
                <div className="success-message mb-6 show">✓ Quiz created successfully!</div>
              )}

              <form onSubmit={handleQuizCreation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="quizTitle">Quiz Title *</label>
                    <input
                      id="quizTitle"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="relatedCourse">Related Course Code *</label>
                    <input
                      id="relatedCourse"
                      value={quizForm.courseCode}
                      onChange={(e) => setQuizForm({ ...quizForm, courseCode: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quizDuration">Duration (minutes) *</label>
                    <input
                      id="quizDuration"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="passingScore">Passing Score (%) *</label>
                    <input
                      id="passingScore"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="quizDescription">Quiz Description</label>
                  <textarea
                    id="quizDescription"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[80px] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="question-item border border-indigo-100 p-4 rounded-lg bg-indigo-50">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h3 className="font-semibold">Question {idx + 1}</h3>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            onClick={() => removeQuestion(q.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Question Text *</label>
                        <textarea
                          value={q.text}
                          onChange={(e) => updateQuestionField(q.id, 'text', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div className="form-group">
                          <label>Question Type *</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestionField(q.id, 'type', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            required
                          >
                            <option value="multiple">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Points *</label>
                          <input
                            type="number"
                            min="1"
                            value={q.points}
                            onChange={(e) => updateQuestionField(q.id, 'points', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {(q.type === 'multiple' || q.type === 'true-false') && (
                        <div className="space-y-2">
                          <legend className="text-sm font-medium text-gray-700">Options *</legend>
                          {(q.type === 'multiple' ? q.options : ['True', 'False']).map((opt, optIdx) => {
                            if (q.type === 'true-false') {
                              return (
                                <div key={optIdx} className="option-item">
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={String(q.correct) === String(optIdx)}
                                    onChange={() => updateQuestionField(q.id, 'correct', optIdx)}
                                  />
                                  <span className="text-sm">{opt}</span>
                                </div>
                              );
                            }

                            return (
                              <div key={optIdx} className="option-item">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={String(q.correct) === String(optIdx)}
                                  onChange={() => updateQuestionField(q.id, 'correct', optIdx)}
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  placeholder={`Option ${optIdx + 1}`}
                                  onChange={(e) => updateQuestionOption(q.id, optIdx, e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1"
                                />
                              </div>
                            );
                          })}

                          {q.type === 'multiple' && q.options.length < 6 && (
                            <button
                              type="button"
                              className="btn btn-secondary text-sm text-indigo-600"
                              onClick={() => updateQuestionField(q.id, 'options', [...q.options, ''])}
                            >
                              + Add option
                            </button>
                          )}
                        </div>
                      )}

                      {q.type === 'short-answer' && (
                        <div className="text-sm text-gray-500">Short answer questions don't require options.</div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn btn-secondary text-indigo-700 bg-indigo-100 px-4 py-2 rounded-lg hover:bg-indigo-200"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn btn-primary bg-indigo-600 text-white rounded-lg px-5 py-2 hover:bg-indigo-700">Create Quiz</button>
                  <button type="button" onClick={resetQuizForm} className="btn btn-secondary bg-gray-200 text-gray-700 rounded-lg px-5 py-2 hover:bg-gray-300">Clear Form</button>
                  <button type="button" className="btn-secondary bg-slate-100 text-slate-700 rounded-lg px-5 py-2 hover:bg-slate-200" onClick={() => navigate('/instructor-dashboard')}>
                    Back
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="tab-content">
              <h2 className="text-2xl font-bold mb-5">📋 Uploaded Content</h2>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">📚 Courses</h3>
                {courseList.length === 0 ? (
                  <p className="text-gray-500">No courses uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {courseList.map((course) => (
                      <div key={course.id} className="list-item p-4 bg-gray-50 border rounded-lg flex justify-between items-start">
                        <div>
                          <div className="list-item-title text-lg font-semibold">{course.name}</div>
                          <div className="list-item-desc text-sm text-gray-600">Code: {course.code} | Instructor: {course.instructor} | Category: {course.category} | Level: {course.level}</div>
                          <div className="list-item-desc text-sm text-gray-600">Duration: {course.duration}h | Credits: {course.credits} | Uploaded: {course.uploadDate}</div>
                          <div className="list-item-desc text-sm text-gray-600">Modules: {course.modules?.length ?? 0}</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                          onClick={() => setCourses((prev) => prev.filter((c) => c.id !== course.id))}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4">❓ Quizzes</h3>
                {quizList.length === 0 ? (
                  <p className="text-gray-500">No quizzes created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {quizList.map((quiz) => (
                      <div key={quiz.id} className="list-item p-4 bg-gray-50 border rounded-lg flex justify-between items-start">
                        <div>
                          <div className="list-item-title text-lg font-semibold">{quiz.title}</div>
                          <div className="list-item-desc text-sm text-gray-600">Course: {quiz.courseCode} | Questions: {quiz.questions.length} | Duration: {quiz.duration} min | Passing: {quiz.passingScore}%</div>
                          <div className="list-item-desc text-sm text-gray-600">Created: {quiz.createdDate}</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                          onClick={() => setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id))}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseQuizManager;
