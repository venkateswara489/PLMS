import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Result from '../models/Result.js';
import Recommendation from '../models/Recommendation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Call Flask ML service for recommendations
async function getMLRecommendations(userId, score = 0, progress = 0) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: String(userId),
        score,
        progress
      }),
    });

    if (!response.ok) {
      console.error('ML service error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to call ML service:', error);
    return null;
  }
}

// Get student performance data for ML
async function getStudentPerformanceData(userId) {
  const enrollments = await Enrollment.find({ student: userId }).populate('course');
  const progressRecords = await Progress.find({ userId });
  const quizResults = await Result.find({ userId });

  const performanceData = {
    userId: String(userId),
    enrolledCourses: enrollments.length,
    averageProgress: 0,
    quizScores: [],
    totalQuizzes: quizResults.length,
    averageQuizScore: 0,
  };

  if (progressRecords.length > 0) {
    const totalProgress = progressRecords.reduce((sum, p) => sum + (p.progressPercentage || 0), 0);
    performanceData.averageProgress = Math.round(totalProgress / progressRecords.length);
  }

  if (quizResults.length > 0) {
    const totalScore = quizResults.reduce((sum, r) => sum + (r.score || 0), 0);
    performanceData.averageQuizScore = Math.round(totalScore / quizResults.length);
    performanceData.quizScores = quizResults.map(r => r.score);
  }

  return performanceData;
}

// Get recommendations with ML integration
router.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's performance data
    const progressRecords = await Progress.find({ userId });
    const quizResults = await Result.find({ userId });
    
    const avgProgress = progressRecords.length > 0 
      ? Math.round(progressRecords.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progressRecords.length)
      : 0;
    
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + (r.score || 0), 0) / quizResults.length)
      : 0;

    // Try to get ML recommendations with score and progress
    const mlData = await getMLRecommendations(userId, avgScore, avgProgress);

    if (mlData && !mlData.error) {
      // ML service returned recommendations
      const recommendedTopics = mlData.recommended_topics || [];
      const difficulty = mlData.difficulty || 'beginner';
      const reason = mlData.reason || 'Based on your learning patterns';

      // Find courses matching recommended topics/difficulty
      const enrolled = await Enrollment.find({ student: userId }).select('course');
      const excludeIds = enrolled.map((e) => e.course);

      const query = {
        status: 'published',
        _id: { $nin: excludeIds },
      };

      // Use difficulty from ML if available
      if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty.toLowerCase())) {
        query.difficulty = difficulty.toLowerCase();
      }

      const items = await Course.find(query)
        .select('title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount createdAt modules')
        .populate('instructor', 'name role')
        .sort({ avgRating: -1, createdAt: -1 })
        .limit(6);

      // Add computed thumbnails
      const itemsWithThumbnails = items.map(course => {
        const courseObj = course.toObject();
        if (!courseObj.thumbnail) {
          // Simple thumbnail extraction
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
        return courseObj;
      });

      // Store recommendation in database
      await Recommendation.findOneAndUpdate(
        { userId },
        {
          userId,
          recommendedCourses: items.map(c => c._id),
          recommendedTopics: [],
          reason,
        },
        { upsert: true, new: true }
      );

      return res.json({ items: itemsWithThumbnails, source: 'ml', reason });
    }

    // Fallback to simple rule-based recommendations
    const interests = (req.user.profile?.interests || []).map((s) => String(s).trim()).filter(Boolean);

    const enrolled = await Enrollment.find({ student: userId }).select('course');
    const excludeIds = enrolled.map((e) => e.course);

    const query = {
      status: 'published',
      _id: { $nin: excludeIds },
    };
    if (interests.length > 0) query.category = { $in: interests };

    const items = await Course.find(query)
      .select('title description category difficulty instructor status thumbnail thumbnailUrl avgRating ratingsCount createdAt modules')
      .populate('instructor', 'name role')
      .sort({ avgRating: -1, createdAt: -1 })
      .limit(6);

    // Add computed thumbnails
    const itemsWithThumbnails = items.map(course => {
      const courseObj = course.toObject();
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
      return courseObj;
    });

    // Store fallback recommendation
    await Recommendation.findOneAndUpdate(
      { userId },
      {
        userId,
        recommendedCourses: items.map(c => c._id),
        recommendedTopics: [],
        reason: 'Based on your interests and popular courses',
      },
      { upsert: true, new: true }
    );

    return res.json({ items: itemsWithThumbnails, source: 'fallback', reason: 'Based on your interests and popular courses' });
  } catch (error) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Get stored recommendations for a user
router.get('/stored/:userId', requireAuth, requireRole('student', 'admin'), async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({ userId: req.params.userId })
      .populate('recommendedCourses')
      .populate('recommendedTopics');

    if (!recommendation) {
      return res.status(404).json({ message: 'No recommendations found' });
    }

    return res.json({ recommendation });
  } catch (error) {
    console.error('Get stored recommendations error:', error);
    return res.status(500).json({ message: 'Failed to fetch stored recommendations', error: error.message });
  }
});

export default router;

