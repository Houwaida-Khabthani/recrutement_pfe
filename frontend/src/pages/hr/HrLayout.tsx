import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Building,
  Settings,
  Search,
  Bell,
  User,
  Menu
} from 'lucide-react';

const HrLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hr/jobs', icon: Briefcase, label: 'Job Offers' },
    { to: '/hr/candidates', icon: Users, label: 'Candidates' },
    { to: '/hr/applications', icon: FileText, label: 'Applications' },
    { to: '/hr/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/hr/companies', icon: Building, label: 'Companies' },
    { to: '/hr/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">TJI</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                      )}
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden mr-4 p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-slate-900">Tunisia Job Innovate</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100">
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Profile</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default HrLayout;