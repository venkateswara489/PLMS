import express from 'express';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student: get quiz data for a course
router.get('/:courseId', requireAuth, requireRole('student'), async (req, res) => {
  try {
    console.log('GET /api/quiz/:courseId called');
    console.log('Course ID:', req.params.courseId);

    const { courseId } = req.params;

    // Get course and find quiz lessons
    const course = await Course.findById(courseId).select('modules');
    if (!course) {
      console.log('Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find quiz questions from course modules
    const quizLessons = (course.modules || []).flatMap((m) =>
      (m.lessons || []).filter((l) => l.type === 'quiz' && Array.isArray(l.questions) && l.questions.length > 0)
    );

    console.log('Quiz lessons found:', quizLessons.length);

    if (quizLessons.length === 0) {
      console.log('No quiz found in course');
      return res.status(404).json({ message: 'No quiz found in this course' });
    }

    const quizLesson = quizLessons[0];
    const quizData = {
      courseId,
      title: quizLesson.title || 'Quiz',
      questions: quizLesson.questions.map((q, idx) => ({
        id: q._id || q.questionText,
        question: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }))
    };

    console.log('Quiz data prepared:', { title: quizData.title, questionCount: quizData.questions.length });
    return res.json(quizData);
  } catch (error) {
    console.error('Get quiz error:', error);
    return res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
});

// Student: submit quiz answers
router.post('/:courseId/submit', requireAuth, requireRole('student'), async (req, res) => {
  try {
    console.log('POST /api/quiz/:courseId/submit called');
    console.log('Course ID:', req.params.courseId);
    console.log('User ID:', req.user._id);
    console.log('Answers received:', req.body.answers);

    const { courseId } = req.params;
    const { answers } = req.body; // answers: { questionId: selectedOption }

    if (!answers || typeof answers !== 'object') {
      console.log('Invalid answers format');
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Get course and find quiz lessons
    const course = await Course.findById(courseId).select('modules');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find quiz questions from course modules
    const quizLessons = (course.modules || []).flatMap((m) =>
      (m.lessons || []).filter((l) => l.type === 'quiz' && Array.isArray(l.questions) && l.questions.length > 0)
    );

    console.log('Quiz lessons found:', quizLessons.length);

    if (quizLessons.length === 0) {
      console.log('No quiz found in course');
      return res.status(404).json({ message: 'No quiz found in this course' });
    }

    const quizLesson = quizLessons[0];
    const questions = quizLesson.questions;

    console.log('Questions to grade:', questions.length);

    // Calculate score
    let correctCount = 0;
    const answerDetails = [];

    for (const question of questions) {
      const questionId = question._id || `${question.questionText}`;
      const selectedOption = answers[questionId];
      const isCorrect = selectedOption === question.correctAnswer;

      console.log(`Question: ${questionId}, Selected: ${selectedOption}, Correct: ${question.correctAnswer}, IsCorrect: ${isCorrect}`);

      if (isCorrect) correctCount++;

      answerDetails.push({
        questionId,
        selectedOption: selectedOption || '',
        isCorrect
      });
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    console.log('Score calculated:', { correctCount, totalQuestions, score });

    // Save result to database
    let result;
    try {
      result = await Result.create({
        userId: req.user._id,
        quizId: courseId, // Using courseId as quizId since quiz is embedded in course
        score,
        answers: answerDetails,
        submittedAt: new Date()
      });
    } catch (saveError) {
      console.error('Failed to save quiz result:', saveError);
      return res.status(500).json({ 
        message: 'Failed to save quiz result. Please try again.',
        error: 'Database save error'
      });
    }

    // Calculate progress after quiz completion
    const totalLessons = (course.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    
    // Get current progress
    let progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        completedLessons: [],
        progressPercentage: 0
      });
    }

    // Mark quiz lesson as completed
    const quizLessonId = `${quizLessons.length - 1}:0`; // Last module, first lesson (quiz)
    if (!progress.completedLessons.includes(quizLessonId)) {
      progress.completedLessons.push(quizLessonId);
    }

    // Calculate progress percentage
    const completedCount = progress.completedLessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isCompleted = progressPercentage >= 90;

    // Update progress
    progress.progressPercentage = progressPercentage;
    progress.lastAccessedAt = new Date();
    try {
      await progress.save();
    } catch (progressError) {
      console.error('Failed to save progress after quiz completion:', progressError);
      // Don't fail the entire request since quiz result was saved
      // But log the error for monitoring
    }

    // Update enrollment if exists
    await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      { 
        progressPercent: progressPercentage,
        completedLessonKeys: progress.completedLessons
      },
      { upsert: true }
    );

    return res.status(201).json({
      result: {
        score,
        passed: score >= 60,
        totalQuestions,
        correctAnswers: correctCount,
        timeSpent: '---',
        recommendations: [],
        progressPercentage,
        completedLessons: progress.completedLessons,
        isCompleted
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
});

// Student: get recent quiz results for the logged-in user
router.get('/results/me', requireAuth, requireRole('student'), async (req, res) => {
  try {
    console.log('GET /api/quiz/results/me called');
    console.log('User ID:', req.user._id);

    const results = await Result.find({ userId: req.user._id })
      .sort({ submittedAt: -1 })
      .limit(6);

    const courseIds = results.map((result) => result.quizId).filter(Boolean);
    const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
    const courseMap = new Map(courses.map((course) => [String(course._id), course.title]));

    const items = results.map((result) => ({
      id: result._id,
      courseId: result.quizId,
      courseTitle: courseMap.get(String(result.quizId)) || 'Course',
      score: result.score,
      submittedAt: result.submittedAt,
      totalQuestions: Array.isArray(result.answers) ? result.answers.length : 0,
      passed: result.score >= 60
    }));

    console.log('Returning results:', items.length);
    return res.json({ results: items });
  } catch (error) {
    console.error('Get recent quiz results error:', error);
    return res.status(500).json({ message: 'Failed to fetch recent results', error: error.message });
  }
});

// Student: get all quiz results for a specific user (for dashboard)
router.get('/results/user/:userId', requireAuth, requireRole('student'), async (req, res) => {
  try {
    console.log('GET /api/quiz/results/user/:userId called');
    console.log('Target User ID:', req.params.userId);

    const { userId } = req.params;

    // Users can only see their own results
    if (String(req.user._id) !== String(userId)) {
      console.log('Unauthorized access attempt');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const results = await Result.find({ userId })
      .sort({ submittedAt: -1 });

    const courseIds = results.map((result) => result.quizId).filter(Boolean);
    const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
    const courseMap = new Map(courses.map((course) => [String(course._id), course.title]));

    const items = results.map((result) => ({
      id: result._id,
      courseId: result.quizId,
      courseTitle: courseMap.get(String(result.quizId)) || 'Course',
      score: result.score,
      submittedAt: result.submittedAt,
      totalQuestions: Array.isArray(result.answers) ? result.answers.length : 0,
      passed: result.score >= 60
    }));

    console.log('Returning all results for user:', items.length);
    return res.json({ results: items });
  } catch (error) {
    console.error('Get user quiz results error:', error);
    return res.status(500).json({ message: 'Failed to fetch user results', error: error.message });
  }
});

// Student: get quiz results for a course
router.get('/:courseId/results', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const results = await Result.find({
      userId: req.user._id,
      quizId: req.params.courseId
    }).sort({ submittedAt: -1 });

    return res.json({ results });
  } catch (error) {
    console.error('Get quiz results error:', error);
    return res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
});

export default router;
