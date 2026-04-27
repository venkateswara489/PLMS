import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Users, ArrowRight, PlayCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-indigo-100 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            Learnify 2.0 is Live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
            Unlock Your Potential with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Personalized Learning
            </span>
          </h1>

          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The intelligent platform that adapts to your learning style. Master new skills faster with courses tailored specifically for you by world-class instructors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] hover:shadow-indigo-200"
            >
              Get Started for Free
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border-2 border-gray-200 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <PlayCircle className="mr-2 -ml-1 w-5 h-5" />
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup Image Placeholder */}
        <div className="relative mt-20 max-w-5xl mx-auto z-20">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden aspect-[16/9]">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Platform Dashboard Preview"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Absolute positioned gradient overlay to make it look like part of UI */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent flex items-end p-8">
              <div className="text-white hidden md:block">
                <p className="text-xl font-bold">Seamless Learning Experience</p>
                <p className="text-sm opacity-90">Track progress, take quizzes, and master new domains.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24 sm:py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Learnify?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We provide the tools you need to succeed in your educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 cursor-pointer" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Instructors</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from industry experts who have real-world experience and are passionate about teaching.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow transform md:-translate-y-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Paths</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI-driven system tailors your curriculum based on your strengths, weaknesses, and goals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Active Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a vibrant community of learners, participate in discussions, and collaborate on projects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
