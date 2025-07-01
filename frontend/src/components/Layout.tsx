import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 

  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plans', href: '/plans', icon: BookOpen },
  { name: 'Courses', href: '/courses', icon: Calendar },
  { name: 'Rounds', href: '/rounds', icon: Calendar },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="text-xl font-bold text-primary-600">
                RME LMS
              </div>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top nav */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-lg font-medium text-gray-900">
                    Learning Management System
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Bell className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-gray-500">{user?.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-500"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}; 