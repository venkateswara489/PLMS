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

    // 2. Create Courses with YouTube links
    const courses = [
      {
        title: 'Data Structures Full Course',
        instructor: instructor._id,
        category: 'Computer Science',
        status: 'published',
        description: 'Complete data structures course by FreeCodeCamp',
        thumbnailUrl: '',
        modules: [
          {
            title: 'Data Structures Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'Data Structures Full Course',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
                durationSeconds: 14400,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:00:00Z')
      },
      {
        title: 'Data Structures in 8 Hours',
        instructor: instructor._id,
        category: 'Computer Science',
        status: 'published',
        description: 'Comprehensive data structures course by CodeHelp',
        thumbnailUrl: '',
        modules: [
          {
            title: 'Data Structures Deep Dive',
            order: 0,
            lessons: [
              {
                title: 'Data Structures in 8 Hours',
                type: 'video',
                contentUrl: 'https://youtu.be/8hly31xKli0',
                durationSeconds: 28800,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:05:00Z')
      },
      {
        title: 'Operating System Basics',
        instructor: instructor._id,
        category: 'Operating Systems',
        status: 'published',
        description: 'Operating system fundamentals by Neso Academy',
        thumbnailUrl: '',
        modules: [
          {
            title: 'OS Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'Operating System Basics',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
                durationSeconds: 10800,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:10:00Z')
      },
      {
        title: 'Operating System Crash Course',
        instructor: instructor._id,
        category: 'Operating Systems',
        status: 'published',
        description: 'Quick OS crash course by Gate Smashers',
        thumbnailUrl: '',
        modules: [
          {
            title: 'OS Crash Course',
            order: 0,
            lessons: [
              {
                title: 'Operating System Crash Course',
                type: 'video',
                contentUrl: 'https://youtu.be/vBURTt97EkA',
                durationSeconds: 7200,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:15:00Z')
      },
      {
        title: 'Machine Learning for Beginners',
        instructor: instructor._id,
        category: 'Machine Learning',
        status: 'published',
        description: 'ML fundamentals by Simplilearn',
        thumbnailUrl: '',
        modules: [
          {
            title: 'ML Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'Machine Learning for Beginners',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI',
                durationSeconds: 18000,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:20:00Z')
      },
      {
        title: 'HTML & CSS Full Course',
        instructor: instructor._id,
        category: 'Web Development',
        status: 'published',
        description: 'Complete HTML & CSS course by Traversy Media',
        thumbnailUrl: '',
        modules: [
          {
            title: 'HTML & CSS Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'HTML & CSS Full Course',
                type: 'video',
                contentUrl: 'https://youtu.be/UB1O30fR-EE',
                durationSeconds: 36000,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:25:00Z')
      },
      {
        title: 'JavaScript Full Course',
        instructor: instructor._id,
        category: 'Web Development',
        status: 'published',
        description: 'Complete JavaScript course by Programming with Mosh',
        thumbnailUrl: '',
        modules: [
          {
            title: 'JavaScript Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'JavaScript Full Course',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=3JluqTojuME',
                durationSeconds: 21600,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:30:00Z')
      },
      {
        title: 'MongoDB Full Tutorial',
        instructor: instructor._id,
        category: 'Database',
        status: 'published',
        description: 'Complete MongoDB tutorial by The Net Ninja',
        thumbnailUrl: '',
        modules: [
          {
            title: 'MongoDB Fundamentals',
            order: 0,
            lessons: [
              {
                title: 'MongoDB Full Tutorial',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=ofme2o29ngU',
                durationSeconds: 25200,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:35:00Z')
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('Courses created...');

    // 3. Create Modules (D2) - Now embedded in courses, skipping separate Module creation
    // Modules are now part of Course schema
    console.log('Modules embedded in courses...');

    // 4. Create Quiz (D3) - Add quiz to first course
    const firstCourse = createdCourses[0];
    firstCourse.modules[0].lessons.push({
      title: 'Data Structures Quiz',
      type: 'quiz',
      contentUrl: '',
      durationSeconds: 0,
      order: 1,
      questions: [{
        questionText: 'What is an array?',
        options: ['Linear DS', 'Tree', 'Graph', 'Stack'],
        correctAnswer: 'Linear DS'
      }]
    });
    await firstCourse.save();
    console.log('Quiz added to course...');

    // 5. Create Enrollment (D4)
    await Enrollment.create({
      student: student._id,
      course: firstCourse._id,
      completedLessonKeys: [],
      progressPercent: 0,
      enrolledAt: new Date('2026-03-20T11:30:00Z')
    });
    console.log('Enrollment created...');

    // 6. Create Progress (D4)
    await Progress.create({
      userId: student._id,
      courseId: firstCourse._id,
      completedLessons: [],
      completedModules: [],
      timeSpent: 0,
      progressPercentage: 0
    });
    console.log('Progress created...');

    // 7. Create Recommendation (Extra)
    await Recommendation.create({
      userId: student._id,
      recommendedCourses: [createdCourses[1]._id],
      recommendedTopics: [],
      reason: 'Based on your learning patterns'
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
