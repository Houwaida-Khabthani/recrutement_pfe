import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, FileText, Calendar, Award, Bell, ArrowRight,
  TrendingUp, CheckCircle, Clock, XCircle, Sparkles, Search,
  MapPin, ChevronRight, Star, Video
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetCandidateProfileQuery, useGetCandidateStatsQuery } from '../../store/api/candidateApi';
import { useGetJobsQuery } from '../../store/api/jobApi';
import { useGetMyApplicationsQuery } from '../../store/api/applicationApi';
import { useGetInterviewsQuery } from '../../store/api/interviewApi';
import { useUpdateMeetingLinkMutation } from '../../store/api/interviewApi';
import JoinMeetingButton from '../../components/JoinMeetingButton';
import { useAppSelector } from '../../hooks/useAppSelector';
/*const chartData = [
  { month: 'Oct', apps: 1 },
  { month: 'Nov', apps: 3 },
  { month: 'Dec', apps: 2 },
  { month: 'Jan', apps: 5 },
  { month: 'Feb', apps: 4 },
  { month: 'Mar', apps: 7 },
];*/

const getStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':     return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'REJECTED':     return 'bg-red-50 text-red-600 border-red-100';
    case 'INTERVIEW':    return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'PENDING':
    case 'EN_ATTENTE':   return 'bg-slate-50 text-slate-500 border-slate-100';
    default:             return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':     return <CheckCircle className="w-3.5 h-3.5" />;
    case 'REJECTED':     return <XCircle className="w-3.5 h-3.5" />;
    case 'INTERVIEW':    return <Calendar className="w-3.5 h-3.5" />;
    case 'UNDER_REVIEW': return <Clock className="w-3.5 h-3.5" />;
    case 'PENDING':
    case 'EN_ATTENTE':   return <Clock className="w-3.5 h-3.5" />;
    default:             return <Clock className="w-3.5 h-3.5" />;
  }
};

const getInterviewStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case 'scheduled': return <Clock className="w-4 h-4 text-amber-600" />;
    case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getInterviewStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed': return 'bg-green-50 border-green-200 text-green-800';
    case 'failed': return 'bg-red-50 border-red-200 text-red-800';
    case 'confirmed': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'scheduled': return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'cancelled': return 'bg-gray-50 border-gray-200 text-gray-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getInterviewStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed': return 'PASSED';
    case 'failed': return 'FAILED';
    case 'confirmed': return 'CONFIRMED';
    case 'scheduled': return 'SCHEDULED';
    case 'cancelled': return 'CANCELLED';
    default: return 'PENDING';
  }
};

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state: any) => state.auth.user);
  const { data: profile } = useGetCandidateProfileQuery(undefined);
  const { data: stats } = useGetCandidateStatsQuery(undefined);
  const { data: jobs = [] } = useGetJobsQuery(undefined);
  const { data: applications = [], isLoading: appsLoading } = useGetMyApplicationsQuery(undefined);
  const { data: interviews = [], isLoading: interviewsLoading } = useGetInterviewsQuery(undefined);
  const [updateMeetingLink] = useUpdateMeetingLinkMutation();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handle meeting link update from JoinMeetingButton
  const handleMeetingLinkUpdate = async (interviewId: number, meetingLink: string) => {
    try {
      await updateMeetingLink({ id: interviewId, meetingLink }).unwrap();
      showToast('Meeting link updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update meeting link:', error);
      showToast('Failed to update meeting link', 'error');
    }
  };

  // Listen for real-time meeting link updates from recruiter
  useEffect(() => {
    const socket = (window as any).socket;
    if (!socket) return;

    const handleMeetingLinkAdded = (data: any) => {
      console.log('[CandidateDashboard] Meeting link added:', data);
      showToast(`Meeting link ready for ${data.jobTitle}! Click to join.`, 'success');
    };

    socket.on('meeting_link_added', handleMeetingLinkAdded);

    return () => {
      socket.off('meeting_link_added', handleMeetingLinkAdded);
    };
  }, []);

  // Monitor interview changes for notifications
  useEffect(() => {
    if (interviews && interviews.length > 0) {
      // Check for newly scheduled interviews
      const scheduledInterviews = interviews.filter((i: any) => i.status === 'scheduled');
      if (scheduledInterviews.length > 0) {
        // This is a simple check - in a real app you'd compare with previous state
        const recentInterview = scheduledInterviews[0];
        if (new Date(recentInterview.date) > new Date()) {
          showToast(`New interview scheduled for ${recentInterview.jobTitle} at ${recentInterview.company}`);
        }
      }

      // Check for status changes
      const failedInterviews = interviews.filter((i: any) => i.status === 'failed');
      if (failedInterviews.length > 0) {
        showToast('Unfortunately, your application has been rejected.', 'error');
      }

      const passedInterviews = interviews.filter((i: any) => i.status === 'passed');
      if (passedInterviews.length > 0) {
        // Check if all interviews are passed
        const application = processedInterviews[`${passedInterviews[0].application_id}-${passedInterviews[0].company}`];
        if (application && passedInterviews.length === application.expectedInterviews) {
          showToast('Congratulations! You have passed all interviews! 🎉');
        } else {
          showToast(`You passed Interview Round ${passedInterviews[0].step}!`);
        }
      }
    }
  }, [interviews]);

  const buildUploadUrl = (value?: string, folder = '') => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    const baseUrl = (import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads').replace(/\/$/, '');
    const cleanedValue = value.replace(/^\/+/, '');
    if (cleanedValue.startsWith('uploads/')) {
      return `${baseUrl.replace(/\/uploads$/, '')}/${cleanedValue}`;
    }
    if (cleanedValue.includes('/')) {
      return `${baseUrl}/${cleanedValue.split('/').map(encodeURIComponent).join('/')}`;
    }
    return folder ? `${baseUrl}/${folder}/${encodeURIComponent(cleanedValue)}` : `${baseUrl}/${encodeURIComponent(cleanedValue)}`;
  };

  const firstName = profile?.nom?.split(' ')[0] || user?.nom?.split(' ')[0] || 'Candidate';
  const recentApps = Array.isArray(applications) ? applications.slice(0, 5) : [];
  const recommendedJobs = Array.isArray(jobs) ? jobs.slice(0, 4) : [];

  // Process interviews data
  const processedInterviews = Array.isArray(interviews) ? interviews.reduce((acc: any, interview: any) => {
    const key = `${interview.application_id}-${interview.company}`;
    if (!acc[key]) {
      acc[key] = {
        applicationId: interview.application_id,
        jobTitle: interview.jobTitle,
        company: interview.company,
        expectedInterviews: interview.expected_interviews,
        interviews: []
      };
    }
    acc[key].interviews.push(interview);
    return acc;
  }, {}) : {};

  const interviewGroups = Object.values(processedInterviews);
  const hasFailedInterview = interviewGroups.some((group: any) =>
    group.interviews.some((interview: any) => interview.status === 'failed')
  );
  const hasAllPassed = interviewGroups.some((group: any) =>
    group.interviews.length === group.expectedInterviews &&
    group.interviews.every((interview: any) => interview.status === 'passed')
  );

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total ?? recentApps.length,
      change: '+2 this week',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50',
      ring: 'border-indigo-100',
    },
    {
      title: 'Interviews',
      value: stats?.entretien ?? 0,
      change: 'Upcoming',
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50',
      ring: 'border-blue-100',
    },
    {
      title: 'Offers Received',
      value: stats?.accepte ?? 0,
      change: 'Congratulations!',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50',
      ring: 'border-emerald-100',
    },
    {
      title: 'Jobs Browsed',
      value: Array.isArray(jobs) ? jobs.length : 0,
      change: 'Active listings',
      icon: <Briefcase className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50',
      ring: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Dashboard
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-slate-500 font-medium text-base">
            Your career journey is looking great. Keep pushing forward.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
            Find Jobs
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* ── Charts + Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Application Activity</h3>
              <p className="text-slate-400 text-sm font-medium">Your applications over the last 6 months</p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
              6 Months
            </span>
          </div>
          {/*<ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="apps" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>*/}
        </div>

        {/* Status breakdown */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl" />
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Your Progress
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Applied', value: stats?.total ?? 0, max: Math.max(stats?.total ?? 1, 1), color: 'bg-slate-500' },
              { label: 'Under Review', value: stats?.en_attente ?? 0, max: Math.max(stats?.total ?? 1, 1), color: 'bg-amber-500' },
              { label: 'Interviews', value: stats?.entretien ?? 0, max: Math.max(stats?.total ?? 1, 1), color: 'bg-blue-500' },
              { label: 'Offers', value: stats?.accepte ?? 0, max: Math.max(stats?.total ?? 1, 1), color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[3px] mb-2">Pro Tip</p>
            <p className="text-white/80 text-xs font-medium italic leading-relaxed">
              "Candidates with a complete profile are 3× more likely to get invited to interviews."
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Applications ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Recent Applications</h3>
            <p className="text-slate-400 text-sm font-medium">Track your latest job applications below.</p>
          </div>
          <button
            onClick={() => navigate('/candidate/applications')}
            className="flex items-center gap-2 text-indigo-600 text-sm font-black hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {appsLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentApps.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold mb-2">No applications yet</p>
            <p className="text-slate-300 text-sm mb-6">Start applying to jobs to track your progress here.</p>
            <button
              onClick={() => navigate('/candidate/jobs')}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-[3px]">
                  <th className="py-4 px-4 text-left">Job Title</th>
                  <th className="py-4 px-4 text-left">Company</th>
                  <th className="py-4 px-4 text-center">Applied</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentApps.map((app: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                          {app.job_title?.[0] || 'J'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{app.job_title || '—'}</p>
                          <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-300" />{app.localisation || 'Remote'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        {app.company_logo ? (
                          <img
                            src={buildUploadUrl(app.company_logo, 'logos')}
                            alt={app.company_name || 'Company logo'}
                            className="w-9 h-9 rounded-2xl object-cover border border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-[10px]">
                            {(app.company_name || 'C')[0]}
                          </div>
                        )}
                        <span className="font-bold text-slate-700">{app.company_name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center text-slate-400 font-bold text-xs">
                      {app.date_postule ? new Date(app.date_postule).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-[2px] ${getStatusStyle(app.statut)}`}>
                        {getStatusIcon(app.statut)}
                        {app.statut || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/candidate/applications/${app.id_candidature}`)}
                        className="px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Interview Timeline ── */}
      {interviewGroups.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Interview Timeline</h3>
              <p className="text-slate-400 text-sm font-medium">Track your interview progress and upcoming meetings.</p>
            </div>
            {hasFailedInterview && (
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm font-bold">Application Rejected</span>
              </div>
            )}
            {hasAllPassed && !hasFailedInterview && (
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-bold">Congratulations! 🎉</span>
              </div>
            )}
          </div>

          {interviewsLoading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {interviewGroups.map((group: any, groupIndex: number) => (
                <div key={groupIndex} className="border border-slate-200 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{group.jobTitle}</h4>
                      <p className="text-slate-500 text-sm font-medium">{group.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progress</p>
                      <p className="text-slate-900 text-lg font-black">
                        {group.interviews.filter((i: any) => i.status === 'passed').length} / {group.expectedInterviews}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: group.expectedInterviews }, (_, i) => i + 1).map(step => {
                      const interview = group.interviews.find((i: any) => i.step === step);
                      const isLocked = step > 1 && !group.interviews.find((i: any) => i.step === step - 1 && i.status === 'passed');
                      const isFailed = group.interviews.some((i: any) => i.status === 'failed');

                      return (
                        <div key={step} className="relative">
                          {/* Timeline line */}
                          {step < group.expectedInterviews && (
                            <div className={`absolute left-6 top-16 w-0.5 h-12 ${
                              isFailed ? 'bg-red-200' : isLocked ? 'bg-slate-200' : 'bg-blue-200'
                            }`}></div>
                          )}

                          <div className={`bg-white border rounded-2xl p-6 transition-all ${
                            isFailed ? 'border-red-200 bg-red-50/50' :
                            isLocked ? 'border-slate-200 bg-slate-50/50' :
                            'border-slate-200 hover:shadow-md'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white ${
                                  interview ? 'bg-blue-600' :
                                  isLocked ? 'bg-slate-300' :
                                  isFailed ? 'bg-red-500' : 'bg-slate-300'
                                }`}>
                                  {step}
                                </div>

                                <div className="flex-1">
                                  <h5 className="text-lg font-black text-slate-900">
                                    Interview Round {step}
                                  </h5>

                                  {interview ? (
                                    <div className="mt-3 space-y-3">
                                      <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(interview.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {new Date(interview.date).toLocaleTimeString()}
                                        </div>
                                      </div>

                                      {/* Always show JoinMeetingButton - handles both cases */}
                                      <div className="flex items-center gap-2 mt-3">
                                        <JoinMeetingButton 
                                          interview={{
                                            id_interview: interview.id_interview,
                                            step: interview.step,
                                            date: interview.date,
                                            meeting_link: interview.meetingLink,
                                            status: interview.status,
                                            notes: interview.notes
                                          }}
                                          userRole="candidate"
                                          onMeetingLinkUpdate={handleMeetingLinkUpdate}
                                          size="md"
                                          showCountdown={true}
                                        />
                                      </div>

                                      {interview.notes && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                          <p className="text-sm text-slate-700">{interview.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className={`text-sm mt-2 ${
                                      isFailed ? 'text-red-600 font-bold' :
                                      isLocked ? 'text-slate-500' : 'text-slate-500'
                                    }`}>
                                      {isFailed ? 'Application rejected' :
                                       isLocked ? `Waiting for Round ${step - 1} to pass` :
                                       'Not scheduled yet'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {interview ? (
                                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getInterviewStatusColor(interview.status)}`}>
                                    <div className="flex items-center gap-1">
                                      {getInterviewStatusIcon(interview.status)}
                                      {getInterviewStatusText(interview.status)}
                                    </div>
                                  </div>
                                ) : isLocked || isFailed ? (
                                  <div className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                                    {isFailed ? 'Rejected' : 'Locked'}
                                  </div>
                                ) : (
                                  <div className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                                    Pending
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Recommended Jobs ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Recommended Jobs</h3>
            <p className="text-slate-400 text-sm font-medium">Fresh opportunities matched for you.</p>
          </div>
          <button onClick={() => navigate('/candidate/jobs')} className="flex items-center gap-1 text-indigo-600 text-sm font-black hover:gap-2 transition-all">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {recommendedJobs.map((job: any, i: number) => (
            <div
              key={i}
              onClick={() => navigate(`/candidate/jobs/${job.id_offre}`)}
              className="bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-lg">
                  {job.titre?.[0] || 'J'}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-[10px] font-black text-slate-400">New</span>
                </div>
              </div>
              <h4 className="font-black text-slate-900 mb-1 text-sm">{job.titre}</h4>
              <p className="text-slate-400 text-[11px] font-bold mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{job.localisation || 'Remote'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg border border-indigo-100">
                  {job.type_contrat || 'CDI'}
                </span>
                {job.salaire && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">
                    {job.salaire} TND
                  </span>
                )}
              </div>
            </div>
          ))}
          {recommendedJobs.length === 0 && (
            <div className="col-span-4 py-8 text-center text-slate-300 font-bold italic">
              No jobs available right now. Check back soon!
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[10000] rounded-3xl border px-5 py-4 shadow-xl transition-all ${
          toastType === 'success' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-700'
        }`}>
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

    </div>
  );
};

export default CandidateDashboard;
