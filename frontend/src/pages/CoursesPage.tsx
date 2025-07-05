import { useState, useEffect } from 'react';
import { Book, Clock, Calendar, Search, Filter, Users, MapPin, Video, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Round {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  deliveryMode: string;
  venue?: string;
  teamsLink?: string;
  maxSeats: number;
  enrolledCount: number;
  status: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: string;
  plan: {
    id: string;
    name: string;
  };
  rounds: Round[];
}

interface Plan {
  id: string;
  name: string;
}

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCoursesAndPlans();
  }, []);

  const fetchCoursesAndPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Please log in to view courses');
        setLoading(false);
        return;
      }

      // Fetch courses with rounds
      const coursesResponse = await fetch('/api/courses?include=rounds', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      setCourses(coursesData.data || []);

      // Fetch plans
      const plansResponse = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.data || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInRound = async (roundId: string, courseName: string, roundName: string) => {
    try {
      setEnrolling(roundId);
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/enrollments/self-enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roundId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully enrolled in ${courseName} - ${roundName}! Check your email for confirmation.`);
        // Refresh courses to update enrollment count
        fetchCoursesAndPlans();
      } else {
        toast.error(data.message || 'Failed to enroll in course');
      }
    } catch (error) {
      toast.error('Failed to enroll in course');
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      case 'VIRTUAL':
        return <Video className="h-4 w-4" />;
      case 'HYBRID':
        return <div className="flex"><MapPin className="h-3 w-3" /><Video className="h-3 w-3 ml-1" /></div>;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !selectedPlan || course.plan.id === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">
          <h3 className="font-medium">Error loading courses</h3>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Training Courses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and enroll in available training courses
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Plan Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="">All Training Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedPlan 
              ? 'Try adjusting your search or filter criteria.'
              : 'No courses are currently available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Book className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.name}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {course.plan.name}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration} hours</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{course.rounds.length} rounds available</span>
                </div>

                {/* Course Rounds */}
                {course.rounds.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Available Rounds</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.rounds.map((round) => (
                        <div
                          key={round.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {round.name}
                            </h5>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              round.status === 'SCHEDULED' 
                                ? 'bg-blue-100 text-blue-800'
                                : round.status === 'ONGOING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {round.status}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(round.startDate)} - {formatDate(round.endDate)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              {getDeliveryModeIcon(round.deliveryMode)}
                              <span className="ml-2 capitalize">
                                {round.deliveryMode.replace('_', ' ').toLowerCase()}
                              </span>
                            </div>

                            {round.venue && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{round.venue}</span>
                              </div>
                            )}

                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{round.enrolledCount}/{round.maxSeats} enrolled</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            {round.enrolledCount >= round.maxSeats ? (
                              <button
                                disabled
                                className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                              >
                                Full
                              </button>
                            ) : round.status === 'SCHEDULED' ? (
                              <button
                                onClick={() => enrollInRound(round.id, course.name, round.name)}
                                disabled={enrolling === round.id}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                              >
                                {enrolling === round.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enrolling...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Enroll Now
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                              >
                                Not Available
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No rounds scheduled for this course</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((total, course) => total + course.rounds.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Available Rounds</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 