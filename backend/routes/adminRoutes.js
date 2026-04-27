import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', requireAuth, requireRole('admin'), async (req, res) => {
  const [totalUsers, totalStudents, totalInstructors, totalAdmins, totalCourses, publishedCourses] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments({}),
      Course.countDocuments({ status: 'published' }),
    ]);

  const recentUsers = await User.find({})
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  return res.json({
    stats: {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
    },
    recentUsers,
  });
});

// All courses (for admin moderation / deletion)
router.get('/courses', requireAuth, requireRole('admin'), async (req, res) => {
  const items = await Course.find({})
    .select('title description category difficulty status thumbnailUrl avgRating instructor createdAt updatedAt')
    .populate('instructor', 'name email role')
    .sort({ updatedAt: -1 });

  return res.json({ items });
});

export default router;

