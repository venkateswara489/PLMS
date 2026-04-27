import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function resolveInstructorId(req) {
  if (req.user.role === 'admin' && req.query.instructorId) {
    return new mongoose.Types.ObjectId(String(req.query.instructorId));
  }
  return req.user._id;
}

router.get('/courses', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const instructorId = req.user.role === 'admin' && req.query.instructorId ? req.query.instructorId : req.user._id;

  const items = await Course.find({ instructor: instructorId })
    .select('title description category difficulty status thumbnailUrl avgRating ratingsCount createdAt updatedAt')
    .sort({ updatedAt: -1 });

  return res.json({ items });
});

/**
 * Enrollment counts + progress analytics per course, plus platform-wide summary for this instructor.
 */
router.get('/analytics', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const instructorId = resolveInstructorId(req);

    const courses = await Course.find({ instructor: instructorId })
      .select('_id title status category difficulty')
      .sort({ updatedAt: -1 })
      .lean();

    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json({
        summary: {
          totalUniqueStudents: 0,
          totalEnrollments: 0,
          avgProgressPercent: 0,
          totalCompleted: 0,
        },
        courses: [],
        recentActivity: [],
      });
    }

    const perCourseStats = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: '$course',
          enrollmentCount: { $sum: 1 },
          avgProgress: { $avg: '$progressPercent' },
          completedCount: {
            $sum: { $cond: [{ $gte: ['$progressPercent', 100] }, 1, 0] },
          },
        },
      },
    ]);

    const statsByCourseId = Object.fromEntries(
      perCourseStats.map((s) => [
        String(s._id),
        {
          enrollmentCount: s.enrollmentCount,
          avgProgress: Math.round((s.avgProgress || 0) * 10) / 10,
          completedCount: s.completedCount,
        },
      ])
    );

    const uniqueStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });

    const overallAgg = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          avgProgress: { $avg: '$progressPercent' },
          completedCount: {
            $sum: { $cond: [{ $gte: ['$progressPercent', 100] }, 1, 0] },
          },
        },
      },
    ]);

    const overall = overallAgg[0] || {
      totalEnrollments: 0,
      avgProgress: 0,
      completedCount: 0,
    };

    const coursesWithStats = courses.map((c) => {
      const st = statsByCourseId[String(c._id)] || {
        enrollmentCount: 0,
        avgProgress: 0,
        completedCount: 0,
      };
      return {
        courseId: c._id,
        title: c.title,
        status: c.status,
        category: c.category,
        difficulty: c.difficulty,
        enrollmentCount: st.enrollmentCount,
        avgProgressPercent: st.avgProgress,
        completedCount: st.completedCount,
      };
    });

    const recentActivity = await Enrollment.find({ course: { $in: courseIds } })
      .sort({ lastAccessedAt: -1, updatedAt: -1 })
      .limit(12)
      .populate('student', 'name email')
      .populate('course', 'title')
      .select('student course progressPercent lastAccessedAt updatedAt')
      .lean();

    const activity = recentActivity.map((e) => ({
      studentName: e.student?.name || 'Student',
      studentEmail: e.student?.email || '',
      courseTitle: e.course?.title || 'Course',
      progressPercent: e.progressPercent ?? 0,
      lastAccessedAt: e.lastAccessedAt || e.updatedAt,
    }));

    return res.json({
      summary: {
        totalUniqueStudents: uniqueStudents.length,
        totalEnrollments: overall.totalEnrollments,
        avgProgressPercent: Math.round((overall.avgProgress || 0) * 10) / 10,
        totalCompleted: overall.completedCount,
      },
      courses: coursesWithStats,
      recentActivity: activity,
    });
  } catch (err) {
    console.error('Instructor analytics error:', err);
    return res.status(500).json({ message: 'Failed to load analytics' });
  }
});

export default router;

