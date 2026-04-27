import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';
import Recommendation from './models/Recommendation.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Course.deleteMany(),
      Module.deleteMany(),
      Enrollment.deleteMany(),
      Progress.deleteMany(),
      Quiz.deleteMany(),
      Result.deleteMany(),
      Recommendation.deleteMany(),
    ]);
    console.log('Cleared existing data...');

    // Hash a default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users (D1)
    const student = await User.create({ 
      name: 'Venkatesh Rao', 
      email: 'venkat@gmail.com', 
      password: hashedPassword, 
      role: 'student',
      createdAt: new Date('2026-03-20T10:00:00Z')
    });
    
    const instructor = await User.create({ 
      name: 'Dr. Sharma', 
      email: 'sharma@gmail.com', 
      password: hashedPassword, 
      role: 'instructor',
      createdAt: new Date('2026-03-20T10:10:00Z')
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date('2026-03-20T10:20:00Z'),
    });

    console.log('Users created (student, instructor, admin)...');

    // 2. Create Course (D2)
    const course1 = await Course.create({
      title: 'Data Structures',
      description: 'Learn basic data structures',
      instructor: instructor._id,
      category: 'Computer Science',
      status: 'published',
      createdAt: new Date('2026-03-20T11:00:00Z')
    });
    
    // Creating a second course just for the ML recommendation example
    const course2 = await Course.create({
      title: 'Advanced Arrays',
      description: 'Deep dive into arrays',
      instructor: instructor._id,
      status: 'published',
      category: 'Computer Science'
    });
    console.log('Courses created...');

    // 3. Create Modules (D2)
    const mod1 = await Module.create({ 
      courseId: course1._id, 
      title: 'Arrays', 
      content: 'https://youtube.com/arrays-video', 
      order: 1 
    });
    
    // Creating a second module for the ML recommendation example
    const mod2 = await Module.create({ 
      courseId: course2._id, 
      title: 'Multidimensional Arrays', 
      content: 'https://youtube.com/2d-arrays', 
      order: 1 
    });
    console.log('Modules created...');

    // 4. Create Quiz (D3)
    const quiz = await Quiz.create({
      courseId: course1._id,
      title: 'Arrays Quiz',
      questions: [{
        questionText: 'What is an array?',
        options: ['Linear DS', 'Tree', 'Graph', 'Stack'],
        correctAnswer: 'Linear DS'
      }]
    });
    console.log('Quiz created...');

    // 5. Create Result (D3)
    await Result.create({
      userId: student._id,
      quizId: quiz._id,
      score: 80,
      answers: [{
        questionId: quiz.questions[0]._id, 
        selectedOption: 'Linear DS',
        isCorrect: true
      }],
      submittedAt: new Date('2026-03-20T12:00:00Z')
    });
    console.log('Result created...');

    // 6. Create Enrollment (D4)
    await Enrollment.create({ 
      student: student._id, 
      course: course1._id,
      enrolledAt: new Date('2026-03-20T11:30:00Z')
    });
    console.log('Enrollment created...');

    // 7. Create Progress (D4)
    await Progress.create({
      userId: student._id,
      courseId: course1._id,
      completedTopics: [mod1._id],
      timeSpent: 120,
      progressPercentage: 50
    });
    console.log('Progress created...');

    // 8. Create Recommendation (Extra)
    await Recommendation.create({
      userId: student._id,
      recommendedCourses: [course2._id],
      recommendedTopics: [mod2._id],
      reason: 'Low score in Arrays topic'
    });
    console.log('Recommendation created...');

    console.log('✅ Specific documents successfully inserted in MongoDB!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
