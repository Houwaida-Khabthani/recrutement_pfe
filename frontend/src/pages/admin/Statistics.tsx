
import { useEffect, useState } from 'react';
import { useGetStatsQuery } from "../../store/api/adminApi";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, Building2, Briefcase, FileText, TrendingUp, Calendar } from 'lucide-react';

interface StatsSummary {
  totalUsers: number;
  totalCompanies: number;
  totalOffers: number;
  totalApplications: number;
  distribution: {
    candidates: number;
    recruiters: number;
    admins: number;
  };
  usersPerMonth: Array<{ month: string; count: number }>;
  applicationsByStatus: Array<{ status: string; count: number }>;
  topJobs: Array<{ title: string; applicationCount: number }>;
  jobsByStatus: Array<{ status: string; count: number }>;
  companiesByStatus: Array<{ status: string; count: number }>;
  newUsersThisWeek: number;
  newApplicationsThisWeek: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: { [key: string]: string } = {
  active: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  accepted: '#10b981',
  interview: '#3b82f6',
  draft: '#9ca3af',
  approved: '#10b981',
  suspended: '#ef4444',
};

const StatCard = ({ icon: Icon, label, value, bgColor, textColor, trend, trendLabel }: any) => (
  <div className={`${bgColor} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`${textColor} p-3 rounded-xl bg-white/20`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="w-4 h-4" />
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
    <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
    {trendLabel && <p className="text-xs text-gray-500 mt-2">{trendLabel}</p>}
  </div>
);

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const Statistics = () => {
  const { data: stats, isLoading, isError } = useGetStatsQuery(undefined);
  const [filter, setFilter] = useState('12-months');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full" />
          </div>
          <p className="text-gray-600 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-700 font-semibold text-lg">Loading Error</p>
        <p className="text-red-600">Failed to load statistics. Please refresh the page.</p>
      </div>
    );
  }

  const typedStats = stats as StatsSummary;

  // Prepare data for charts with null safety
  const distributionData = [
    { name: 'Candidates', value: typedStats?.distribution?.candidates || 0 },
    { name: 'Recruiters', value: typedStats?.distribution?.recruiters || 0 },
    { name: 'Admins', value: typedStats?.distribution?.admins || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Statistics</h1>
        <p className="text-gray-600">Platform activity overview and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={typedStats?.totalUsers || 0}
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          textColor="text-blue-600"
          trendLabel={`${typedStats?.newUsersThisWeek || 0} new this week`}
        />
        <StatCard
          icon={Building2}
          label="Total Companies"
          value={typedStats?.totalCompanies || 0}
          bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
          textColor="text-emerald-600"
        />
        <StatCard
          icon={Briefcase}
          label="Job Offers"
          value={typedStats?.totalOffers || 0}
          bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          textColor="text-amber-600"
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={typedStats?.totalApplications || 0}
          bgColor="bg-gradient-to-br from-pink-50 to-pink-100"
          textColor="text-pink-600"
          trendLabel={`${typedStats?.newApplicationsThisWeek || 0} new this week`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Over Time */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-600">Users registered per month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={typedStats?.usersPerMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Distribution</h2>
              <p className="text-sm text-gray-600">Users by role</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by Status */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Applications Status</h2>
              <p className="text-sm text-gray-600">Distribution by status</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typedStats?.applicationsByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Jobs */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Job Offers</h2>
              <p className="text-sm text-gray-600">Most applications</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(typedStats?.topJobs || []).slice(0, 8).map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{job.title}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {job.applicationCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jobs by Status */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Jobs by Status</h3>
          <div className="space-y-2">
            {(typedStats?.jobsByStatus || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[item.status] || '#9ca3af' }}
                  />
                  <span className="text-gray-700 capitalize font-medium">{item.status}</span>
                </div>
                <span className="text-gray-900 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Companies by Status */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Companies by Status</h3>
          <div className="space-y-2">
            {(typedStats?.companiesByStatus || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[item.status] || '#9ca3af' }}
                  />
                  <span className="text-gray-700 capitalize font-medium">{item.status}</span>
                </div>
                <span className="text-gray-900 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
