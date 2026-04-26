import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, FileText, BarChart3, Settings, Plus,
  TrendingUp, ChevronRight, Sparkles,
} from 'lucide-react';

import { useGetStatsQuery } from "../../store/api/adminApi";

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useGetStatsQuery(undefined);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      change: 'Candidates + Recruiters',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50',
      ring: 'border-indigo-100',
    },
    {
      title: 'Companies',
      value: stats?.totalCompanies ?? 0,
      change: 'Active on platform',
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50',
      ring: 'border-emerald-100',
    },
    {
      title: 'Applications',
      value: stats?.totalApplications ?? 0,
      change: 'Total submissions',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50',
      ring: 'border-amber-100',
    },
    {
      title: 'Job Listings',
      value: stats?.totalJobs ?? 0,
      change: 'Active offers',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50',
      ring: 'border-blue-100',
    },
  ];

  const quickActions = [
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Manage Users',
      description: 'Add, edit, or delete user accounts',
      route: '/admin/users',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: 'Manage Companies',
      description: 'Create and link companies to accounts',
      route: '/admin/companies',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'View Applications',
      description: 'Review all job applications',
      route: '/admin/applications',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Statistics',
      description: 'Detailed analytics and reports',
      route: '/admin/statistics',
      color: 'from-blue-500 to-blue-600',
    },
  ];

  return (
    <>
      

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Admin Panel
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Platform Control Center 🎛️
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Monitor and manage all platform activities from one centralized dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" />
            Quick Actions
          </button>
        </div>

        {isLoading && <p className="text-slate-500 text-lg">Loading dashboard data...</p>}
        {isError && <p className="text-rose-600 text-lg">Error loading statistics</p>}

        {!isLoading && stats && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{card.title}</p>
                    <div className={`w-10 h-10 ${card.color} border ${card.ring} rounded-2xl flex items-center justify-center`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{card.value}</p>
                  <p className="text-slate-400 text-[11px] font-bold">{card.change}</p>
                </div>
              ))}
            </div>

            {/* ── Quick Actions Grid ── */}
            <section className="mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(action.route)}
                    className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${action.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{action.label}</h3>
                    <p className="text-slate-400 text-sm">{action.description}</p>
                    <ChevronRight className="w-4 h-4 text-indigo-600 absolute right-5 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </section>

            {/* ── Bottom Stats Summary ── */}
            <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> Platform Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Companies</p>
                    <p className="text-3xl font-black text-emerald-400">{stats?.totalCompanies || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Applications</p>
                    <p className="text-3xl font-black text-amber-400">{stats?.totalApplications || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Jobs</p>
                    <p className="text-3xl font-black text-blue-400">{stats?.totalJobs || 0}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default AdminDashboard;
