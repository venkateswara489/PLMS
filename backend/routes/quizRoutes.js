import express from 'express';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student: submit quiz answers
router.post('/:courseId/submit', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // answers: { questionId: selectedOption }

    if (!answers || typeof answers !== 'object') {
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

    if (quizLessons.length === 0) {
      return res.status(404).json({ message: 'No quiz found in this course' });
    }

    const quizLesson = quizLessons[0];
    const questions = quizLesson.questions;

    // Calculate score
    let correctCount = 0;
    const answerDetails = [];

    for (const question of questions) {
      const questionId = question._id || `${question.questionText}`;
      const selectedOption = answers[questionId];
      const isCorrect = selectedOption === question.correctAnswer;

      if (isCorrect) correctCount++;

      answerDetails.push({
        questionId,
        selectedOption: selectedOption || '',
        isCorrect
      });
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Save result to database
    const result = await Result.create({
      userId: req.user._id,
      quizId: courseId, // Using courseId as quizId since quiz is embedded in course
      score,
      answers: answerDetails,
      submittedAt: new Date()
    });

    return res.status(201).json({
      result: {
        score,
        passed: score >= 60,
        totalQuestions,
        correctAnswers: correctCount,
        timeSpent: '—',
        recommendations: []
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
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
