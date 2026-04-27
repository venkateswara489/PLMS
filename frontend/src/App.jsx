import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleBasedNav from './components/RoleBasedNav';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentMyCourses from './pages/StudentMyCourses';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import CourseContent from './pages/CourseContent';
import CourseQuizManager from './pages/CourseQuizManager';
import InstructorManageCourses from './pages/InstructorManageCourses';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import About from './pages/About';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <RoleBasedNav />
        <main className="flex-grow">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Dashboard Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/student-dashboard/my-courses" element={<StudentMyCourses />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
                <Route path="/instructor-dashboard/*" element={<InstructorDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
              </Route>
              
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseContent />} />
              <Route path="/course/:id/quiz" element={<Quiz />} />
              <Route path="/course/:id/quiz/result" element={<QuizResult />} />
              <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
                <Route path="/instructor-dashboard/course-manager" element={<CourseQuizManager />} />
                <Route path="/instructor-dashboard/manage-courses" element={<InstructorManageCourses />} />
              </Route>
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
