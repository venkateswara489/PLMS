import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Very simple recommender:
// - prefer categories that match user interests
// - exclude already-enrolled courses
router.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  const interests = (req.user.profile?.interests || []).map((s) => String(s).trim()).filter(Boolean);

  const enrolled = await Enrollment.find({ student: req.user._id }).select('course');
  const excludeIds = enrolled.map((e) => e.course);

  const query = {
    status: 'published',
    _id: { $nin: excludeIds },
  };
  if (interests.length > 0) query.category = { $in: interests };

  const items = await Course.find(query)
    .select('title description category difficulty instructor status thumbnailUrl avgRating ratingsCount createdAt')
    .populate('instructor', 'name role')
    .sort({ avgRating: -1, createdAt: -1 })
    .limit(6);

  return res.json({ items });
});

export default router;

