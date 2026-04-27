import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Quiz from './models/Quiz.js';
import Module from './models/Module.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
import Result from './models/Result.js';
import Recommendation from './models/Recommendation.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();

const courses = [
  {
    name: 'Data Structures in C/C++',
    description: 'Learn arrays, linked lists, stacks, queues, trees, and graphs.',
    instructorName: 'Prof. John Mitchell',
    youtube: 'https://www.youtube.com/watch?v=8hly31xKli0',
    category: 'Development'
  },
  {
    name: 'Python Full Course for Beginners',
    description: 'Complete Python basics with hands-on examples.',
    instructorName: 'Dr. Sarah Khan',
    youtube: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    category: 'Development'
  },
  {
    name: 'HTML & CSS Full Course',
    description: 'Learn how to build responsive websites using HTML and CSS.',
    instructorName: 'Prof. Mike Chen',
    youtube: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
    category: 'Development'
  },
  {
    name: 'JavaScript Full Course',
    description: 'Learn JavaScript fundamentals and DOM manipulation.',
    instructorName: 'Dr. Emma Roberts',
    youtube: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    category: 'Development'
  },
  {
    name: 'React JS Crash Course',
    description: 'Learn React basics including components, hooks, and state.',
    instructorName: 'Prof. David Lee',
    youtube: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
    category: 'Development'
  },
  {
    name: 'Machine Learning for Beginners',
    description: 'Introduction to ML concepts, algorithms, and applications.',
    instructorName: 'Dr. Priya Patel',
    youtube: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI',
    category: 'Data Science'
  },
  {
    name: 'MongoDB Tutorial for Beginners',
    description: 'Learn MongoDB basics, CRUD operations, and schema design.',
    instructorName: 'Prof. James Wilson',
    youtube: 'https://www.youtube.com/watch?v=ofme2o29ngU',
    category: 'Development'
  },
  {
    name: 'Operating System Full Course',
    description: 'Concepts like processes, memory management, and scheduling.',
    instructorName: 'Dr. Rajesh Sharma',
    youtube: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
    category: 'Development'
  }
];

const seedCoursesAndQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    // Clear all course-related data
    await Promise.all([
      Course.deleteMany({}),
      Module.deleteMany({}),
      Enrollment.deleteMany({}),
      Progress.deleteMany({}),
      Result.deleteMany({}),
      Recommendation.deleteMany({}),
      Quiz.deleteMany({}),
    ]);
    console.log('✅ Cleared existing course data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create instructors and courses
    const instructorCredentials = [];
    const createdCourses = [];

    for (const courseData of courses) {
      // Create or find instructor
      const lastNameEmail = courseData.instructorName.split(' ').pop().toLowerCase() + '@gmail.com';
      let instructor = await User.findOne({ email: lastNameEmail });
      if (!instructor) {
        instructor = await User.create({
          name: courseData.instructorName,
          email: lastNameEmail,
          password: hashedPassword,
          role: 'instructor',
          createdAt: new Date()
        });
        console.log(`✅ Created instructor: ${courseData.instructorName}`);
      }

      // Store credentials
      instructorCredentials.push({
        name: courseData.instructorName,
        email: instructor.email,
        password: 'password123',
        role: 'instructor'
      });

      // Create course
      const course = await Course.create({
        title: courseData.name,
        description: courseData.description,
        instructor: instructor._id,
        category: courseData.category,
        status: 'published',
        youtubeUrl: courseData.youtube,
        modules: [],
        createdAt: new Date()
      });

      createdCourses.push({ course, instructor, courseData });
      console.log(`✅ Created course: ${course.title}`);
    }

    // Create quizzes and modules for each course, and sync with Course.modules
    for (const { course, instructor, courseData } of createdCourses) {
      const moduleBase = ['Introduction', 'Deep Dive', 'Summary and Final Notes'];
      const courseModules = [];

      for (let i = 0; i < moduleBase.length; i++) {
        const moduleTitle = `${course.title} - ${moduleBase[i]}`;

        await Module.create({
          courseId: course._id,
          title: moduleTitle,
          content: courseData.youtube,
          order: i + 1,
        });

        courseModules.push({
          title: moduleTitle,
          lessons: [
            {
              title: `${moduleBase[i]} Video`,
              type: 'video',
              contentUrl: courseData.youtube,
              durationSeconds: 1800,
              questions: [],
            },
          ],
        });
      }

      const quizzes = generateQuizzesForCourse(course.title);
      for (const quizData of quizzes) {
        await Quiz.create({
          courseId: course._id,
          title: quizData.title,
          questions: quizData.questions,
          createdAt: new Date(),
        });
        console.log(`✅ Created quiz: ${quizData.title} for course: ${course.title}`);

        courseModules.push({
          title: `Quiz: ${quizData.title}`,
          lessons: [
            {
              title: quizData.title,
              type: 'quiz',
              content: '',
              durationSeconds: 0,
              questions: quizData.questions,
            },
          ],
        });
      }

      course.modules = courseModules;
      await course.save();
      console.log(`✅ Created modules and quizzes for course: ${course.title}`);
    }

    // Create or reuse a sample student
    const studentEmail = 'student@gmail.com';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Student User',
        email: studentEmail,
        password: hashedPassword,
        role: 'student',
        createdAt: new Date()
      });
      console.log(`✅ Created student: ${student.name}`);
    }

    // If old index exists from previous versions, drop it to avoid conflicts.
    await Enrollment.collection.dropIndex('userId_1_courseId_1').catch(() => {});

    // Enroll student in first 5 courses
    const coursesToEnroll = createdCourses.slice(0, 5).map((item) => item.course);
    for (const course of coursesToEnroll) {
      await Enrollment.updateOne(
        { student: student._id, course: course._id },
        { $setOnInsert: { student: student._id, course: course._id, enrolledAt: new Date() } },
        { upsert: true }
      );

      // Create progress info with random completion
      const courseModules = await Module.find({ courseId: course._id });
      const completed = courseModules.slice(0, Math.max(1, Math.floor(courseModules.length * 0.5))).map(m => m._id);
      const progressPercent = Math.round((completed.length / courseModules.length) * 100);

      await Progress.updateOne(
        { userId: student._id, courseId: course._id },
        {
          $set: {
            userId: student._id,
            courseId: course._id,
            completedTopics: completed,
            timeSpent: 600 * completed.length,
            progressPercentage: progressPercent,
          }
        },
        { upsert: true }
      );

      // Create result for the first quiz in that course (if exists)
      const firstQuiz = await Quiz.findOne({ courseId: course._id });
      if (firstQuiz) {
        const answers = firstQuiz.questions.map((q, idx) => ({
          questionId: q._id,
          selectedOption: q.correctAnswer,
          isCorrect: true
        }));

        await Result.updateOne(
          { userId: student._id, quizId: firstQuiz._id },
          {
            $set: {
              userId: student._id,
              quizId: firstQuiz._id,
              score: 100,
              answers,
              submittedAt: new Date(),
            }
          },
          { upsert: true }
        );
      }
    }

    // Recommendation record for the sample student
    await Recommendation.updateOne(
      { userId: student._id },
      {
        $set: {
          recommendedCourses: createdCourses.slice(5).map((x) => x.course._id),
          recommendedTopics: [],
          reason: 'Continue learning with advanced topics from courses you may like',
        }
      },
      { upsert: true }
    );

    // Save credentials to file
    const credentialsText = `
=============================================================================
INSTRUCTOR LOGIN CREDENTIALS - PLMS SYSTEM
=============================================================================

Use these credentials to log in to the instructor dashboard:

${instructorCredentials.map((cred, idx) => `
${idx + 1}. ${cred.name}
   Email: ${cred.email}
   Password: ${cred.password}
   Role: ${cred.role}
`).join('\n')}

=============================================================================
HOW TO USE:
1. Go to Login page (${process.env.FRONTEND_URL || 'http://localhost:5173'}/login)
2. Enter email and password from above
3. You'll be redirected to the Instructor Dashboard
4. Create courses, upload content, and create multiple-choice quizzes
=============================================================================
`;

    fs.writeFileSync(path.join(process.cwd(), 'INSTRUCTOR_CREDENTIALS.txt'), credentialsText);
    console.log('\n✅ Instructor credentials saved to INSTRUCTOR_CREDENTIALS.txt');

    console.log('\n=============================================================================');
    console.log('✅ ALL COURSES AND QUIZZES SUCCESSFULLY ADDED TO DATABASE!');
    console.log('=============================================================================\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

function generateQuizzesForCourse(courseTitle) {
  const quizzes = {
    'Data Structures in C/C++': [
      {
        title: 'Arrays Basics Quiz',
        questions: [
          {
            questionText: 'What is the time complexity of accessing an element in an array?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
            correctAnswer: 'O(1)'
          },
          {
            questionText: 'Which data structure uses LIFO (Last In First Out)?',
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            correctAnswer: 'Stack'
          },
          {
            questionText: 'What is a linked list?',
            options: ['Sequential storage', 'Node-based storage', 'Tree structure', 'Hash structure'],
            correctAnswer: 'Node-based storage'
          }
        ]
      },
      {
        title: 'Trees and Graphs Quiz',
        questions: [
          {
            questionText: 'What is the root of a tree?',
            options: ['The leaf node', 'The topmost node', 'The largest node', 'Any node'],
            correctAnswer: 'The topmost node'
          },
          {
            questionText: 'Which traversal is DFS?',
            options: ['Level order', 'In-order', 'Depth first', 'Breadth first'],
            correctAnswer: 'Depth first'
          }
        ]
      }
    ],
    'Python Full Course for Beginners': [
      {
        title: 'Python Basics Quiz',
        questions: [
          {
            questionText: 'What is the correct file extension for Python files?',
            options: ['.py', '.python', '.pyt', '.p'],
            correctAnswer: '.py'
          },
          {
            questionText: 'Which keyword is used to create a function in Python?',
            options: ['func', 'function', 'def', 'define'],
            correctAnswer: 'def'
          },
          {
            questionText: 'What is the output of type(5)?',
            options: ['<class "int">', '<class "float">', '<class "str">', 'int'],
            correctAnswer: '<class "int">'
          }
        ]
      }
    ],
    'HTML & CSS Full Course': [
      {
        title: 'HTML Fundamentals Quiz',
        questions: [
          {
            questionText: 'What does HTML stand for?',
            options: ['Hypertext Markup Language', 'High Tech Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
            correctAnswer: 'Hypertext Markup Language'
          },
          {
            questionText: 'Which tag is used for the largest heading?',
            options: ['<h6>', '<h1>', '<heading>', '<header>'],
            correctAnswer: '<h1>'
          }
        ]
      },
      {
        title: 'CSS Styling Quiz',
        questions: [
          {
            questionText: 'What does CSS stand for?',
            options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
            correctAnswer: 'Cascading Style Sheets'
          },
          {
            questionText: 'Which property is used to change text color?',
            options: ['text-color', 'color', 'font-color', 'text-style'],
            correctAnswer: 'color'
          }
        ]
      }
    ],
    'JavaScript Full Course': [
      {
        title: 'JavaScript Basics Quiz',
        questions: [
          {
            questionText: 'What is the correct way to declare a variable in modern JavaScript?',
            options: ['var x;', 'let x;', 'const x;', 'declare x;'],
            correctAnswer: 'let x;'
          },
          {
            questionText: 'What is the correct syntax for creating a function?',
            options: ['function = () {}', 'function() {}', 'func() {}', 'fn() {}'],
            correctAnswer: 'function() {}'
          }
        ]
      }
    ],
    'React JS Crash Course': [
      {
        title: 'React Fundamentals Quiz',
        questions: [
          {
            questionText: 'What is a React component?',
            options: ['A CSS file', 'A reusable piece of UI', 'A database', 'A server'],
            correctAnswer: 'A reusable piece of UI'
          },
          {
            questionText: 'What is state in React?',
            options: ['HTML attributes', 'Component data that can change', 'CSS properties', 'Imports'],
            correctAnswer: 'Component data that can change'
          },
          {
            questionText: 'What are hooks used for?',
            options: ['Database queries', 'Adding state to functional components', 'CSS styling', 'API calls only'],
            correctAnswer: 'Adding state to functional components'
          }
        ]
      }
    ],
    'Machine Learning for Beginners': [
      {
        title: 'ML Basics Quiz',
        questions: [
          {
            questionText: 'What is supervised learning?',
            options: ['Learning without labels', 'Learning with labeled data', 'Learning from mistakes', 'Learning without data'],
            correctAnswer: 'Learning with labeled data'
          },
          {
            questionText: 'What does ML stand for?',
            options: ['Machine Logic', 'Machine Learning', 'Model Learning', 'Multi-Layer'],
            correctAnswer: 'Machine Learning'
          }
        ]
      }
    ],
    'MongoDB Tutorial for Beginners': [
      {
        title: 'MongoDB Basics Quiz',
        questions: [
          {
            questionText: 'What type of database is MongoDB?',
            options: ['Relational', 'NoSQL Document', 'Graph', 'Time-series'],
            correctAnswer: 'NoSQL Document'
          },
          {
            questionText: 'What is a document in MongoDB?',
            options: ['A text file', 'A JSON-like structure', 'A table', 'A query'],
            correctAnswer: 'A JSON-like structure'
          }
        ]
      }
    ],
    'Operating System Full Course': [
      {
        title: 'OS Concepts Quiz',
        questions: [
          {
            questionText: 'What is a process?',
            options: ['A function', 'An instance of a program in execution', 'A thread', 'A file'],
            correctAnswer: 'An instance of a program in execution'
          },
          {
            questionText: 'What is virtual memory?',
            options: ['RAM only', 'Hard disk extension of RAM', 'Cache memory', 'Registers'],
            correctAnswer: 'Hard disk extension of RAM'
          }
        ]
      }
    ]
  };

  return quizzes[courseTitle] || [];
}

seedCoursesAndQuizzes();
