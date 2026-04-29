import express from 'express';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
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

export default router;
