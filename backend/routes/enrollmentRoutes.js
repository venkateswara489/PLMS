import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function getTotalLessons(course) {
  let total = 0;
  for (const mod of course.modules || []) {
    total += (mod.lessons || []).length;
  }
  return total;
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

async function withComputedProgress(enrollment) {
  const course = await Course.findById(enrollment.course).select('modules');
  if (!course) return enrollment;

  const total = getTotalLessons(course);
  const completed = new Set(enrollment.completedLessonKeys || []).size;
  const pct = total === 0 ? 0 : Math.round(clamp01(completed / total) * 100);

  if (enrollment.progressPercent !== pct) {
    enrollment.progressPercent = pct;
    await enrollment.save();
  }
  return enrollment;
}

// Student: my enrollments
router.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnailUrl avgRating ratingsCount createdAt updatedAt',
      populate: { path: 'instructor', select: 'name role' },
    });

  // Best-effort refresh progress in background-ish (sequential but small for demo)
  for (const e of enrollments) {
    await withComputedProgress(e);
  }

  return res.json({ enrollments });
});

// Student: enrollment for a course
router.get('/course/:courseId', requireAuth, requireRole('student'), async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnailUrl avgRating ratingsCount modules',
      populate: { path: 'instructor', select: 'name role' },
    });

  if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
  await withComputedProgress(enrollment);
  return res.json({ enrollment });
});

export default router;

