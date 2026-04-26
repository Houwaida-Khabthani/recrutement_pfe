import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import { Users, Briefcase, Calendar, Award, TrendingUp } from 'lucide-react';

// Mock data - will be replaced with API calls
const kpiData = {
  totalCandidates: 1250,
  activeOffers: 15,
  interviewsThisMonth: 28,
  avgMatchingRate: 87
};

const applicationsOverTime = [
  { month: 'Sep', applications: 120 },
  { month: 'Oct', applications: 145 },
  { month: 'Nov', applications: 180 },
  { month: 'Dec', applications: 210 },
  { month: 'Jan', applications: 195 },
  { month: 'Feb', applications: 240 }
];

const skillsDistribution = [
  { name: 'React', value: 85, color: '#3b82f6' },
  { name: 'Python', value: 78, color: '#10b981' },
  { name: 'TypeScript', value: 72, color: '#f59e0b' },
  { name: 'Node.js', value: 68, color: '#ef4444' },
  { name: 'AWS', value: 55, color: '#8b5cf6' },
  { name: 'Java', value: 45, color: '#06b6d4' },
  { name: 'SQL', value: 40, color: '#84cc16' }
];

const HrAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Comprehensive insights into your recruitment performance and talent pool.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={kpiData.totalCandidates}
          change="+15% this month"
          icon={<Users />}
        />
        <StatCard
          title="Active Job Offers"
          value={kpiData.activeOffers}
          change="+3 this week"
          icon={<Briefcase />}
        />
        <StatCard
          title="Interviews This Month"
          value={kpiData.interviewsThisMonth}
          change="+12% vs last month"
          icon={<Calendar />}
        />
        <StatCard
          title="Average Matching Rate"
          value={`${kpiData.avgMatchingRate}%`}
          change="+5% improvement"
          icon={<Award />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Talent Distribution by Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillsDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {skillsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {skillsDistribution.map((skill) => (
              <div key={skill.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: skill.color }}
                ></div>
                <span className="text-slate-700">{skill.name}: {skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Jobs */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Jobs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Senior Full-Stack Developer</span>
              <span className="text-sm font-medium text-green-600">24 applicants</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Data Scientist</span>
              <span className="text-sm font-medium text-green-600">31 applicants</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">UX/UI Designer</span>
              <span className="text-sm font-medium text-green-600">18 applicants</span>
            </div>
          </div>
        </div>

        {/* Recruitment Funnel */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recruitment Funnel</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Applications</span>
              <span className="text-sm font-medium">240</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Screening</span>
              <span className="text-sm font-medium">120</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Interviews</span>
              <span className="text-sm font-medium">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Offers</span>
              <span className="text-sm font-medium">8</span>
            </div>
          </div>
        </div>

        {/* Average Time to Hire */}
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Average Time to Hire</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
            <div className="text-sm text-slate-600">days</div>
            <div className="mt-4 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-sm text-green-600">-3 days vs last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrAnalytics;