import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String, // Can be text, video URL, or file path
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Ensure modules are predictably ordered per course
moduleSchema.index({ courseId: 1, order: 1 });

export default mongoose.model('Module', moduleSchema);
