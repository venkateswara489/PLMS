import React, { useEffect, useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { Search, Filter, Compass } from 'lucide-react';
import { apiFetch } from '../lib/api';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All Courses') {
      params.set('category', selectedCategory);
    }
    params.set('status', 'published');
    params.set('limit', '50');
    return params.toString();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch(`/api/courses?${queryString}`);
        if (!cancelled) setCourses(data.items || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-600" />
              Explore Courses
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover thousands of high-quality courses from expert instructors around the world.
            </p>
          </div>

          <div className="w-full md:w-96 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white sm:text-sm transition-all"
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm whitespace-nowrap">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar">
          {['All Courses', 'Development', 'Design', 'Data Science', 'Marketing', 'Business', 'Photography'].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-600 font-medium">Loading courses…</p>
            </div>
          ) : error ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xl font-bold text-gray-900">Couldn’t load courses</p>
              <p className="text-gray-500 mt-2">{error}</p>
            </div>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <CourseCard key={course._id || course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
              <Search className="mx-auto w-12 h-12 text-gray-300 mb-4" />
              <p className="text-xl font-bold text-gray-900">No courses found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Courses;
