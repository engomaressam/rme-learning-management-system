import { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Eye } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  _count: {
    courses: number;
    assignments: number;
  };
}

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Please log in to view training plans');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch training plans');
      }

      const data = await response.json();
      setPlans(data.data || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading training plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">
          <h3 className="font-medium">Error loading training plans</h3>
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
            Training Plans
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Structured learning programs for professional development
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search training plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No training plans found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Get started by creating your first training plan.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {plan.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {plan.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {plan._count.courses}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Courses</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {plan._count.assignments}
                    </div>
                    <div className="text-xs text-green-600 font-medium">Assignments</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
            <div className="text-sm text-gray-600">Total Plans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {plans.filter(p => p.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">Active Plans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {plans.reduce((sum, p) => sum + p._count.courses, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {plans.reduce((sum, p) => sum + p._count.assignments, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 