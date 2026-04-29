import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
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

// Calculate progress percentage based on completed lessons
async function calculateProgress(userId, courseId) {
  const course = await Course.findById(courseId).select('modules');
  if (!course) return 0;

  const progress = await Progress.findOne({ userId, courseId });
  if (!progress) return 0;

  const total = getTotalLessons(course);
  const completed = new Set(progress.completedLessons || []).size;
  const pct = total === 0 ? 0 : Math.round(clamp01(completed / total) * 100);

  // Update progress percentage in Progress model
  if (progress.progressPercentage !== pct) {
    progress.progressPercentage = pct;
    await progress.save();
  }

  return pct;
}

// Sync progress from Progress model to Enrollment model
async function syncProgressToEnrollment(userId, courseId) {
  const progress = await Progress.findOne({ userId, courseId });
  const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
  
  if (progress && enrollment) {
    const pct = await calculateProgress(userId, courseId);
    enrollment.progressPercent = pct;
    enrollment.completedLessonKeys = progress.completedLessons || [];
    enrollment.lastAccessedAt = progress.lastAccessedAt;
    await enrollment.save();
  }
}

// Student: my enrollments
router.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount createdAt updatedAt modules',
      populate: { path: 'instructor', select: 'name role' },
    });

  // Sync progress from Progress model to Enrollment model
  for (const e of enrollments) {
    await syncProgressToEnrollment(req.user._id, e.course._id);
  }

  // Re-fetch enrollments to get updated progress
  const updatedEnrollments = await Enrollment.find({ student: req.user._id })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount createdAt updatedAt modules',
      populate: { path: 'instructor', select: 'name role' },
    });

  // Add computed thumbnails for courses that don't have them
  const enrollmentsWithThumbnails = updatedEnrollments.map(e => {
    const courseObj = e.course.toObject();
    if (!courseObj.thumbnail) {
      for (const module of courseObj.modules || []) {
        for (const lesson of module.lessons || []) {
          if (lesson.type === 'video' && lesson.contentUrl) {
            const match = lesson.contentUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
            if (match) {
              courseObj.thumbnail = `https://img.youtube.com/vi/${match[1]}/0.jpg`;
              break;
            }
          }
        }
        if (courseObj.thumbnail) break;
      }
    }
    return { ...e.toObject(), course: courseObj };
  });

  return res.json({ enrollments: enrollmentsWithThumbnails });
});

// Student: enrollment for a course
router.get('/course/:courseId', requireAuth, requireRole('student'), async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount modules',
      populate: { path: 'instructor', select: 'name role' },
    });

  if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
  await syncProgressToEnrollment(req.user._id, req.params.courseId);
  
  // Re-fetch to get updated progress
  const updatedEnrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    .populate({
      path: 'course',
      select: 'title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount modules',
      populate: { path: 'instructor', select: 'name role' },
    });

  // Add computed thumbnail if missing
  const courseObj = updatedEnrollment.course.toObject();
  if (!courseObj.thumbnail) {
    for (const module of courseObj.modules || []) {
      for (const lesson of module.lessons || []) {
        if (lesson.type === 'video' && lesson.contentUrl) {
          const match = lesson.contentUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
          if (match) {
            courseObj.thumbnail = `https://img.youtube.com/vi/${match[1]}/0.jpg`;
            break;
          }
        }
      }
      if (courseObj.thumbnail) break;
    }
  }
  
  return res.json({ enrollment: { ...updatedEnrollment.toObject(), course: courseObj } });
});

export default router;

