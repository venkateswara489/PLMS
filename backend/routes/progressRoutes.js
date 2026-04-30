import express from 'express';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /progress/update - Update progress for a course
router.post('/update', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { courseId, progress } = req.body;

    if (!courseId || progress === undefined) {
      return res.status(400).json({ message: 'courseId and progress are required' });
    }

    const progressValue = Math.min(100, Math.max(0, Number(progress)));
    const isCompleted = progressValue >= 90;

    // Update or create progress record
    const progressRecord = await Progress.findOneAndUpdate(
      { userId: req.user._id, courseId },
      {
        userId: req.user._id,
        courseId,
        progressPercentage: progressValue,
        lastAccessedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return res.json({
      progress: progressValue,
      completed: isCompleted,
      message: isCompleted ? 'Course completed!' : 'Progress updated'
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
});

// GET /progress/:userId - Get user's progress stats
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own data or is admin
    if (String(req.user._id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const progressRecords = await Progress.find({ userId });
    const enrollments = await Progress.find({ userId }).distinct('courseId');

    const totalCourses = enrollments.length;
    const completedCourses = progressRecords.filter(p => p.progressPercentage >= 90).length;
    const avgProgress = totalCourses > 0 
      ? Math.round(progressRecords.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / totalCourses)
      : 0;

    return res.json({
      totalCourses,
      completedCourses,
      avgProgress,
      progressRecords
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
  }
});

// GET /progress/course/:courseId - Get progress for specific course
router.get('/course/:courseId', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.json({ progress: 0, completed: false });
    }

    return res.json({
      progress: progress.progressPercentage || 0,
      completed: progress.progressPercentage >= 90,
      completedLessons: progress.completedLessons || [],
      timeSpent: progress.timeSpent || 0
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    return res.status(500).json({ message: 'Failed to fetch course progress', error: error.message });
  }
});

// POST /progress/complete - Mark lesson as completed
router.post('/complete', requireAuth, requireRole('student'), async (req, res) => {
  try {
    console.log('POST /api/progress/complete called');
    console.log('Request body:', req.body);
    console.log('User ID from auth:', req.user._id);
    
    const courseId = req.body?.courseId;
    const lessonId = req.body?.lessonId;
    const userId = req.user._id;

    if (!courseId || !lessonId) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing fields: courseId and lessonId are required' });
    }

    console.log('Processing lesson completion for user:', userId, 'course:', courseId, 'lesson:', lessonId);

    // Update progress record
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      { 
        $addToSet: { completedLessons: lessonId },
        lastAccessedAt: new Date()
      },
      { new: true, upsert: true }
    );

    console.log('Progress record updated:', progress);

    // Calculate progress percentage
    const course = await Course.findById(courseId).select('modules');
    
    let totalLessons = 0;
    if (course && course.modules) {
      totalLessons = course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    }

    const completedCount = progress.completedLessons.length;
    const progressPercentage = totalLessons > 0 ? Math.min(100, Math.max(0, Math.round((completedCount / totalLessons) * 100))) : 0;
    const isCompleted = progressPercentage >= 90;

    console.log('Progress calculation:', { totalLessons, completedCount, progressPercentage, isCompleted });

    // Update progress percentage
    progress.progressPercentage = progressPercentage;
    await progress.save();

    console.log('Progress saved with percentage:', progressPercentage);

    // Update enrollment if exists
    const enrollmentUpdate = await Enrollment.findOneAndUpdate(
      { student: userId, course: courseId },
      { 
        progressPercent: progressPercentage,
        completedLessonKeys: progress.completedLessons
      }
    );

    console.log('Enrollment updated:', enrollmentUpdate);

    const response = {
      success: true,
      lessonId,
      progressPercentage,
      completedLessons: progress.completedLessons,
      isCompleted,
      message: isCompleted ? 'Course completed!' : 'Lesson marked as completed'
    };

    console.log('Sending response:', response);
    return res.json(response);
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    return res.status(500).json({ message: 'Failed to mark lesson as completed', error: error.message });
  }
});

export default router;
