import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['video', 'pdf', 'note', 'quiz'], required: true },
    contentUrl: { type: String, default: '' },
    durationSeconds: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
    questions: {
      type: [
        {
          questionText: { type: String, required: true },
          options: { type: [String], default: [] },
          correctAnswer: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General', index: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft', index: true },
    thumbnail: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    modules: { type: [moduleSchema], default: [] },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', category: 'text' });

export default mongoose.model('Course', courseSchema);

