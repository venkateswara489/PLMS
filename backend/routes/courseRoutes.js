import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

// Public: browse/search courses
router.get('/', async (req, res) => {
  const {
    q,
    category,
    difficulty,
    instructorId,
    status = 'published',
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = String(category);
  if (difficulty) query.difficulty = String(difficulty);
  if (instructorId) query.instructor = String(instructorId);
  if (q) query.$text = { $search: String(q) };

  const pageNum = Math.max(1, toInt(page, 1));
  const limitNum = Math.min(50, Math.max(1, toInt(limit, 20)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Course.find(query)
      .select('title description category difficulty instructor status thumbnailUrl avgRating ratingsCount createdAt updatedAt')
      .populate('instructor', 'name role')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Course.countDocuments(query),
  ]);

  res.json({ items, page: pageNum, limit: limitNum, total });
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name role');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  return res.json({ course });
});

// Instructor/Admin: create course
router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const {
    title,
    description = '',
    category = 'General',
    difficulty = 'beginner',
    status = 'draft',
    thumbnailUrl = '',
    modules = [],
  } = req.body || {};

  if (!String(title || '').trim()) return res.status(400).json({ message: 'Title is required' });

  const course = await Course.create({
    title: String(title).trim(),
    description: String(description || ''),
    category: String(category || 'General'),
    difficulty,
    status,
    thumbnailUrl: String(thumbnailUrl || ''),
    modules: Array.isArray(modules) ? modules : [],
    instructor: req.user._id,
  });

  return res.status(201).json({ course });
});

// Instructor/Admin: update course (owner or admin)
router.patch('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const isOwner = String(course.instructor) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

  const allowed = ['title', 'description', 'category', 'difficulty', 'status', 'thumbnailUrl', 'modules'];
  for (const key of allowed) {
    if (key in (req.body || {})) course[key] = req.body[key];
  }
  await course.save();

  return res.json({ course });
});

// Instructor/Admin: delete course (owner or platform admin)
router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const isOwner = String(course.instructor) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

  await Enrollment.deleteMany({ course: course._id });
  await Course.deleteOne({ _id: course._id });

  return res.json({ message: 'Course deleted', id: String(course._id) });
});

// Student: enroll
router.post('/:id/enroll', requireAuth, requireRole('student'), async (req, res) => {
  const course = await Course.findById(req.params.id).select('_id status');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.status !== 'published') return res.status(400).json({ message: 'Course is not published' });

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: course._id },
    { $setOnInsert: { student: req.user._id, course: course._id } },
    { new: true, upsert: true }
  );

  return res.status(201).json({ enrollment });
});

// Student: update progress (simple)
router.post('/:id/progress', requireAuth, requireRole('student'), async (req, res) => {
  const { completedLessonKey } = req.body || {};
  if (!completedLessonKey) return res.status(400).json({ message: 'completedLessonKey is required' });

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });

  if (!enrollment.completedLessonKeys.includes(String(completedLessonKey))) {
    enrollment.completedLessonKeys.push(String(completedLessonKey));
  }
  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  return res.json({ enrollment });
});

export default router;

