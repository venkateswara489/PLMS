import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
import Recommendation from './models/Recommendation.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plms');
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Course.deleteMany(),
      Enrollment.deleteMany(),
      Progress.deleteMany(),
      Recommendation.deleteMany(),
    ]);
    console.log('Cleared existing data...');

    // Hash a default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users
    const instructor1 = await User.create({ 
      name: 'Dr. Sharma', 
      email: 'sharma@gmail.com', 
      password: hashedPassword, 
      role: 'instructor',
      createdAt: new Date('2026-03-20T10:00:00Z')
    });
    
    const instructor2 = await User.create({ 
      name: 'Jason Joshi', 
      email: 'jason@gmail.com', 
      password: hashedPassword, 
      role: 'instructor',
      createdAt: new Date('2026-03-20T10:10:00Z')
    });

    const instructor3 = await User.create({ 
      name: 'Andrew Ng', 
      email: 'andrew@gmail.com', 
      password: hashedPassword, 
      role: 'instructor',
      createdAt: new Date('2026-03-20T10:20:00Z')
    });

    const student1 = await User.create({ 
      name: 'Venkateswara Rao', 
      email: 'venkat@gmail.com', 
      password: hashedPassword, 
      role: 'student',
      createdAt: new Date('2026-03-20T10:30:00Z')
    });
    
    const student2 = await User.create({ 
      name: 'Rahul Kumar', 
      email: 'rahul@gmail.com', 
      password: hashedPassword, 
      role: 'student',
      createdAt: new Date('2026-03-20T10:40:00Z')
    });

    const student3 = await User.create({ 
      name: 'Priya Reddy', 
      email: 'priya@gmail.com', 
      password: hashedPassword, 
      role: 'student',
      createdAt: new Date('2026-03-20T10:50:00Z')
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date('2026-03-20T11:00:00Z'),
    });

    console.log('Users created (3 instructors, 3 students, 1 admin)...');

    // 2. Create Courses with realistic data
    const courses = [
      {
        title: 'JavaScript Full Course',
        instructor: instructor1._id,
        category: 'Web Development',
        status: 'published',
        difficulty: 'beginner',
        description: 'Complete JavaScript course covering variables, functions, and advanced concepts',
        thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/0.jpg',
        thumbnailUrl: 'https://img.youtube.com/vi/PkZNo7MFNFg/0.jpg',
        avgRating: 4.5,
        ratingsCount: 120,
        modules: [
          {
            title: 'Introduction to JavaScript',
            order: 0,
            lessons: [
              {
                title: 'JavaScript Introduction',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
                durationSeconds: 3600,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Variables and Data Types',
            order: 1,
            lessons: [
              {
                title: 'Variables in JavaScript',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
                durationSeconds: 4200,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Functions',
            order: 2,
            lessons: [
              {
                title: 'JavaScript Functions',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=8dWL3wF_OMw',
                durationSeconds: 4800,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:00:00Z')
      },
      {
        title: 'MongoDB Full Tutorial',
        instructor: instructor1._id,
        category: 'Database',
        status: 'published',
        difficulty: 'beginner',
        description: 'Complete MongoDB tutorial covering CRUD operations and Mongoose',
        thumbnail: 'https://img.youtube.com/vi/ofme2o29ngU/0.jpg',
        thumbnailUrl: 'https://img.youtube.com/vi/ofme2o29ngU/0.jpg',
        avgRating: 4.7,
        ratingsCount: 85,
        modules: [
          {
            title: 'MongoDB Introduction',
            order: 0,
            lessons: [
              {
                title: 'MongoDB Basics',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=ofme2o29ngU',
                durationSeconds: 5400,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'CRUD Operations',
            order: 1,
            lessons: [
              {
                title: 'MongoDB CRUD',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=-56x56UppqQ',
                durationSeconds: 6000,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Mongoose ODM',
            order: 2,
            lessons: [
              {
                title: 'Mongoose with Node.js',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=DZBGEVgL2eE',
                durationSeconds: 7200,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:10:00Z')
      },
      {
        title: 'Data Structures Full Course',
        instructor: instructor1._id,
        category: 'Computer Science',
        status: 'published',
        difficulty: 'intermediate',
        description: 'Comprehensive data structures course covering arrays, linked lists, and trees',
        thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/0.jpg',
        thumbnailUrl: 'https://img.youtube.com/vi/RBSGKlAvoiM/0.jpg',
        avgRating: 4.8,
        ratingsCount: 200,
        modules: [
          {
            title: 'Arrays',
            order: 0,
            lessons: [
              {
                title: 'Arrays in Data Structures',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
                durationSeconds: 7200,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Linked Lists',
            order: 1,
            lessons: [
              {
                title: 'Linked List Implementation',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=NobHlGUjV3g',
                durationSeconds: 8400,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Trees',
            order: 2,
            lessons: [
              {
                title: 'Tree Data Structures',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=oSWTXtMglKE',
                durationSeconds: 9000,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:20:00Z')
      },
      {
        title: 'Operating Systems Crash Course',
        instructor: instructor2._id,
        category: 'Operating Systems',
        status: 'published',
        difficulty: 'beginner',
        description: 'Quick OS crash course covering basics, processes, and memory management',
        thumbnail: 'https://img.youtube.com/vi/26QPDBe-NB8/0.jpg',
        thumbnailUrl: 'https://img.youtube.com/vi/26QPDBe-NB8/0.jpg',
        avgRating: 4.6,
        ratingsCount: 95,
        modules: [
          {
            title: 'OS Basics',
            order: 0,
            lessons: [
              {
                title: 'Operating System Fundamentals',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
                durationSeconds: 5400,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Processes',
            order: 1,
            lessons: [
              {
                title: 'Process Management',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=Sqzb6c8q7Z0',
                durationSeconds: 6600,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Memory Management',
            order: 2,
            lessons: [
              {
                title: 'Memory in Operating Systems',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=9GDX-IyZ_C8',
                durationSeconds: 7200,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:30:00Z')
      },
      {
        title: 'Machine Learning for Beginners',
        instructor: instructor3._id,
        category: 'Machine Learning',
        status: 'published',
        difficulty: 'beginner',
        description: 'Introduction to machine learning covering regression and classification',
        thumbnail: 'https://img.youtube.com/vi/GwIo3gDZCVQ/0.jpg',
        thumbnailUrl: 'https://img.youtube.com/vi/GwIo3gDZCVQ/0.jpg',
        avgRating: 4.9,
        ratingsCount: 250,
        modules: [
          {
            title: 'ML Introduction',
            order: 0,
            lessons: [
              {
                title: 'Machine Learning Basics',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
                durationSeconds: 7200,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Regression',
            order: 1,
            lessons: [
              {
                title: 'Regression Algorithms',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=JcI5E2Ng6r4',
                durationSeconds: 8400,
                order: 0,
                questions: []
              }
            ]
          },
          {
            title: 'Classification',
            order: 2,
            lessons: [
              {
                title: 'Classification Techniques',
                type: 'video',
                contentUrl: 'https://www.youtube.com/watch?v=VCJdg7YBbAQ',
                durationSeconds: 9000,
                order: 0,
                questions: []
              }
            ]
          }
        ],
        createdAt: new Date('2026-03-20T11:40:00Z')
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('Courses created (5 courses with multiple modules)...');

    // 3. Add Quiz to each course (3 questions per quiz)
    const quizQuestions = {
      javascript: [
        {
          questionText: 'What is JavaScript?',
          options: ['Language', 'Database', 'OS', 'Compiler'],
          correctAnswer: 'Language'
        },
        {
          questionText: 'Which keyword declares a variable?',
          options: ['var', 'let', 'const', 'All of the above'],
          correctAnswer: 'All of the above'
        },
        {
          questionText: 'What is a function?',
          options: ['Data type', 'Reusable block of code', 'Operator', 'Variable'],
          correctAnswer: 'Reusable block of code'
        }
      ],
      mongodb: [
        {
          questionText: 'What is MongoDB?',
          options: ['SQL Database', 'NoSQL Database', 'Spreadsheet', 'File System'],
          correctAnswer: 'NoSQL Database'
        },
        {
          questionText: 'Which is a CRUD operation?',
          options: ['Create', 'Read', 'Update', 'All of the above'],
          correctAnswer: 'All of the above'
        },
        {
          questionText: 'What is Mongoose?',
          options: ['Animal', 'ODM for MongoDB', 'SQL Tool', 'Compiler'],
          correctAnswer: 'ODM for MongoDB'
        }
      ],
      datastructures: [
        {
          questionText: 'What is an array?',
          options: ['Linear DS', 'Tree', 'Graph', 'Stack'],
          correctAnswer: 'Linear DS'
        },
        {
          questionText: 'Linked list consists of?',
          options: ['Nodes', 'Edges', 'Vertices', 'Tables'],
          correctAnswer: 'Nodes'
        },
        {
          questionText: 'Tree has how many roots?',
          options: ['One', 'Two', 'Multiple', 'Zero'],
          correctAnswer: 'One'
        }
      ],
      os: [
        {
          questionText: 'What is OS?',
          options: ['Application', 'System Software', 'Hardware', 'Network'],
          correctAnswer: 'System Software'
        },
        {
          questionText: 'Process is?',
          options: ['Program in execution', 'Stored program', 'Hardware', 'File'],
          correctAnswer: 'Program in execution'
        },
        {
          questionText: 'Memory management is?',
          options: ['OS function', 'User task', 'Hardware feature', 'Network task'],
          correctAnswer: 'OS function'
        }
      ],
      ml: [
        {
          questionText: 'What is Machine Learning?',
          options: ['AI subset', 'Database', 'OS', 'Compiler'],
          correctAnswer: 'AI subset'
        },
        {
          questionText: 'Regression predicts?',
          options: ['Continuous values', 'Categories', 'Images', 'Text'],
          correctAnswer: 'Continuous values'
        },
        {
          questionText: 'Classification predicts?',
          options: ['Categories', 'Numbers', 'Images', 'Audio'],
          correctAnswer: 'Categories'
        }
      ]
    };

    const courseQuizzes = [
      { course: createdCourses[0], questions: quizQuestions.javascript, title: 'JavaScript Quiz' },
      { course: createdCourses[1], questions: quizQuestions.mongodb, title: 'MongoDB Quiz' },
      { course: createdCourses[2], questions: quizQuestions.datastructures, title: 'Data Structures Quiz' },
      { course: createdCourses[3], questions: quizQuestions.os, title: 'OS Quiz' },
      { course: createdCourses[4], questions: quizQuestions.ml, title: 'ML Quiz' }
    ];

    for (const { course, questions, title } of courseQuizzes) {
      course.modules[course.modules.length - 1].lessons.push({
        title,
        type: 'quiz',
        contentUrl: '',
        durationSeconds: 0,
        order: course.modules[course.modules.length - 1].lessons.length,
        questions
      });
      await course.save();
    }
    console.log('Quizzes added to all courses...');

    // 4. Create Enrollments for students
    for (const student of [student1, student2, student3]) {
      for (const course of createdCourses) {
        await Enrollment.create({
          student: student._id,
          course: course._id,
          completedLessonKeys: [],
          progressPercent: 0,
          enrolledAt: new Date('2026-03-20T12:00:00Z')
        });
      }
    }
    console.log('Enrollments created for all students...');

    // 5. Create Progress for students
    for (const student of [student1, student2, student3]) {
      for (const course of createdCourses) {
        await Progress.create({
          userId: student._id,
          courseId: course._id,
          completedLessons: [],
          progressPercentage: 0
        });
      }
    }
    console.log('Progress records created for all students...');

    // 6. Create Recommendations
    await Recommendation.create({
      userId: student1._id,
      recommendedCourses: [createdCourses[0]._id, createdCourses[2]._id],
      recommendedTopics: [],
      reason: 'Based on your learning patterns'
    });
    await Recommendation.create({
      userId: student2._id,
      recommendedCourses: [createdCourses[1]._id, createdCourses[4]._id],
      recommendedTopics: [],
      reason: 'Based on your interests'
    });
    await Recommendation.create({
      userId: student3._id,
      recommendedCourses: [createdCourses[3]._id, createdCourses[0]._id],
      recommendedTopics: [],
      reason: 'Popular courses in your area'
    });
    console.log('Recommendations created...');

    console.log('✅ Database seeded successfully with realistic data!');
    console.log('📊 Summary:');
    console.log('   - 3 Instructors (Dr. Sharma, Jason Joshi, Andrew Ng)');
    console.log('   - 3 Students (Venkateswara Rao, Rahul Kumar, Priya Reddy)');
    console.log('   - 5 Courses with multiple modules and quizzes');
    console.log('   - 15 Enrollments');
    console.log('   - 15 Progress records');
    console.log('   - 3 Recommendations');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
