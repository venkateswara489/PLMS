import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  recommendedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  recommendedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  reason: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Recommendation', recommendationSchema);
