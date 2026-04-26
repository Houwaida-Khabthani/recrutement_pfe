import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
import {
  Briefcase, Users, Calendar, Award, Bell, MapPin, X, Mail, Phone,
  Globe, FileText, GraduationCap, CheckCircle, Eye, ArrowRight,
  XCircle, Loader
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import InterviewTimeline from '../../components/InterviewTimeline';
import { useGetRecruiterProfileQuery } from '../../store/api/companyApi';
import { useGetCompanyApplicationsQuery, useUpdateApplicationStatusMutation } from '../../store/api/applicationApi';
import { useGetMyJobsQuery } from '../../store/api/jobApi';

// ─────────────────────────────────────────────────
// HIRING LIFECYCLE DEFINITIONS (shared)
// ─────────────────────────────────────────────────
const STAGES = [
  { key: 'PENDING',      label: 'Applied',    color: 'bg-slate-400',   textColor: 'text-slate-600',   bgLight: 'bg-slate-50',   borderColor: 'border-slate-200' },
  { key: 'UNDER_REVIEW', label: 'Screening',  color: 'bg-amber-500',   textColor: 'text-amber-600',   bgLight: 'bg-amber-50',   borderColor: 'border-amber-200' },
  { key: 'INTERVIEW',    label: 'Interview',  color: 'bg-blue-500',    textColor: 'text-blue-600',    bgLight: 'bg-blue-50',    borderColor: 'border-blue-200' },
  { key: 'ACCEPTED',     label: 'Offer Sent', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const getStageIndex = (status: string) => {
  const s = status?.toUpperCase();
  if (s === 'EN_ATTENTE') return 0; // First stage
  return STAGES.findIndex(stage => stage.key === s);
};

const getNextStatus = (current: string) => {
  switch (current?.toUpperCase()) {
    case 'PENDING':
    case 'EN_ATTENTE': return 'UNDER_REVIEW';
    case 'UNDER_REVIEW': return 'INTERVIEW';
    case 'INTERVIEW': return 'ACCEPTED';
    default: return null;
  }
};

const getAdvanceLabel = (current: string) => {
  switch (current?.toUpperCase()) {
    case 'PENDING':
    case 'EN_ATTENTE': return 'Begin Screening';
    case 'UNDER_REVIEW': return 'Schedule Interview';
    case 'INTERVIEW': return 'Extend Offer';
    default: return 'Advance';
  }
};

const getStatusBadgeStyle = (status: string) => {
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

const getOfferDecisionBadge = (offerStatus?: string) => {
  switch (offerStatus?.toUpperCase()) {
    case 'ACCEPTED':
      return { label: 'OFFER ACCEPTED', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    case 'REJECTED':
      return { label: 'OFFER DECLINED', style: 'bg-red-50 text-red-700 border-red-100' };
    case 'PENDING':
    default:
      return { label: 'OFFER PENDING', style: 'bg-slate-50 text-slate-600 border-slate-100' };
  }
};

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────
const CompanyDashboard = () => {
  const getField = (candidate: any, ...keys: string[]) =>
    keys.find((key) => candidate?.[key]) ? candidate[keys.find((key) => candidate?.[key]) as string] : '';

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

  const normalizeUrl = (value?: string) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `https://${value}`;
  };

  // Real API Data
  const { data: profileResponse, isLoading: profileLoading } = useGetRecruiterProfileQuery();
  const { data: applications = [], isLoading: appsLoading } = useGetCompanyApplicationsQuery({});
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const { data: jobs = [], isLoading: jobsLoading } = useGetMyJobsQuery({});

  // Profile Modal
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Hiring Workflow Modal
  const [workflowCandidate, setWorkflowCandidate] = useState<any>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [offerSalary, setOfferSalary] = useState('');
  const [offerCurrency, setOfferCurrency] = useState('TND');
  const [offerContractType, setOfferContractType] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [rejectCandidate, setRejectCandidate] = useState<any>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Interview Timeline Modal
  const [showInterviewTimeline, setShowInterviewTimeline] = useState(false);
  const [timelineCandidate, setTimelineCandidate] = useState<any>(null);

  const stats = profileResponse?.data?.stats || {
    activeJobs: 0, totalApplications: 0, totalViews: 0, draftJobs: 0, interviewsScheduled: 0
  };

  const isLoading = profileLoading || appsLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white/50 rounded-3xl border border-slate-100 italic text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-xl shadow-blue-100"></div>
        <p className="text-xl font-bold animate-pulse">Syncing recruitment engine...</p>
      </div>
    );
  }

  const activePostings = jobs.filter((j: any) => j.statut === 'OUVERT' || j.statut === 'Active').slice(0, 5);
  const recentApps = applications.slice(0, 8);

  const openProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
  };

  const openAdvanceWorkflow = (candidate: any) => {
    setWorkflowCandidate(candidate);
    setWorkflowStep(0);
    setInterviewDate('');
    setInterviewTime('10:00');
    setInterviewLocation('');
    setRecruiterNote('');
    setOfferSalary('');
    setOfferCurrency('TND');
    setOfferContractType('');
    setOfferStartDate('');
    setOfferMessage('');
    setShowWorkflow(true);
  };

  const executeAdvance = async () => {
    if (!workflowCandidate) return;
    const nextStatus = getNextStatus(workflowCandidate.statut);
    if (!nextStatus) return;
    if (nextStatus === 'ACCEPTED' && (!offerSalary || !offerContractType || !offerStartDate)) {
      alert('Please complete salary, contract type and start date before sending the offer.');
      return;
    }

    setWorkflowStep(2);
    setIsProcessing(true);
    try {
      const payload = { 
        id: workflowCandidate.id_candidature, 
        status: nextStatus,
        entretien_date: nextStatus === 'INTERVIEW' ? (interviewDate || null) : null,
        entretien_lieu: nextStatus === 'INTERVIEW' ? (interviewLocation || null) : null,
        note_recruteur: parseInt(recruiterNote) || 0,
        offer_salary: nextStatus === 'ACCEPTED' ? Number(offerSalary) : null,
        offer_currency: nextStatus === 'ACCEPTED' ? offerCurrency : null,
        offer_contract_type: nextStatus === 'ACCEPTED' ? offerContractType : null,
        offer_start_date: nextStatus === 'ACCEPTED' ? offerStartDate : null,
        offer_message: nextStatus === 'ACCEPTED' ? offerMessage : null,
        offer_status: nextStatus === 'ACCEPTED' ? 'PENDING' : null
      };
      console.log('[DEBUG] Advancing Candidate:', payload);
      await updateStatus(payload).unwrap();
      await new Promise(resolve => setTimeout(resolve, 1200));
      setWorkflowStep(3);
    } catch (err) {
      console.error('Advance failed:', err);
      setWorkflowStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const openInterviewTimeline = (candidate: any) => {
    setTimelineCandidate(candidate);
    setShowInterviewTimeline(true);
  };

  const executeReject = async () => {
    if (!rejectCandidate) return;
    setIsProcessing(true);
    try {
      await updateStatus({ id: rejectCandidate.id_candidature, status: 'REJECTED' }).unwrap();
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowReject(false);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const applicationsOverTime = [
    { month: 'Sep', applications: 30 },
    { month: 'Oct', applications: 45 },
    { month: 'Nov', applications: 60 },
    { month: 'Dec', applications: 75 },
    { month: 'Jan', applications: 90 },
    { month: 'Feb', applications: stats.totalApplications || 120 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Welcome back, HR Manager!</h1>
          <p className="text-slate-500 font-medium text-lg">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
             <Bell className="w-5 h-5" />
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95">
             <Briefcase className="w-5 h-5" />
             Insights
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Jobs" value={stats.activeJobs} change="+1 this week" icon={<Briefcase size={20} className="text-blue-600" />} />
        <StatCard title="Total Applicants" value={stats.totalApplications} change="+12% vs last month" icon={<Users size={20} className="text-emerald-600" />} />
        <StatCard title="Interviews Scheduled" value={stats.interviewsScheduled} icon={<Calendar size={20} className="text-amber-600" />} />
        <StatCard title="Profile Outreach" value={stats.totalViews} icon={<Award size={20} className="text-purple-600" />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white shadow-sm rounded-3xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Applications Growth</h3>
             <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-1.5 outline-none focus:ring-0">
               <option>Last 6 Months</option>
               <option>Last Year</option>
             </select>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Briefcase className="w-5 h-5 text-blue-400" /> Strategic Metrics</h3>
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold"><span className="text-slate-400">Match Quality</span><span className="text-blue-400">87%</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[87%] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div></div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold"><span className="text-slate-400">Interview Response</span><span className="text-emerald-400">92%</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div></div>
             </div>
          </div>
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
             <p className="text-slate-400 text-xs font-bold uppercase mb-2">PRO TIP</p>
             <p className="text-sm font-medium text-slate-100 italic">"Candidates with matching scores over 85% are 4x more likely to clear technical rounds."</p>
          </div>
        </div>
      </div>

      {/* RECENT APPLICANTS — Live Queue */}
      <div className="bg-white shadow-xl shadow-slate-100/50 border border-slate-100 rounded-[40px] p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-10 px-2">
           <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Recent Job Applicants</h3>
              <p className="text-slate-400 text-sm font-medium">Real-time candidates synced with your hiring pipeline.</p>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Board Live Sync</span>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-[3px]">
                <th className="py-6 px-4 text-left font-black">Talent Profile</th>
                <th className="py-6 px-4 text-left font-black">Offer Pipeline</th>
                <th className="py-6 px-4 text-center font-black">Match Score</th>
                <th className="py-6 px-4 text-center font-black">Status</th>
                <th className="py-6 px-4 text-right pr-8 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentApps.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-300 italic font-bold">Scanning for the first applicants...</td>
                 </tr>
              ) : (
                recentApps.map((candidate: any, index: number) => {
                  const nextStatus = getNextStatus(candidate.statut);
                  const showOfferDecision = String(candidate.statut || '').toUpperCase() === 'ACCEPTED';
                  const offerBadge = getOfferDecisionBadge(candidate.offer_status);
                  return (
                  <tr key={index} className="hover:bg-slate-50/30 transition-all group">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        {getField(candidate, 'candidate_avatar', 'avatar') ? (
                          <img
                            src={buildUploadUrl(getField(candidate, 'candidate_avatar', 'avatar'), 'images')}
                            alt={candidate.candidate_name}
                            className="w-12 h-12 rounded-2xl object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                            {candidate.candidate_name?.[0].toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-slate-900 text-base mb-0.5">{candidate.candidate_name}</p>
                          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight flex items-center gap-1">
                             <MapPin className="w-3.5 h-3.5 text-blue-500" />
                             {candidate.candidate_location || 'Tunisia'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-col">
                         <span className="font-black text-slate-700 text-sm mb-1">{candidate.job_title}</span>
                         <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                           {new Date(candidate.date_postule).toLocaleDateString() === 'Invalid Date'
                             ? '—' : new Date(candidate.date_postule).toLocaleDateString()}
                         </span>
                         {showOfferDecision && (
                           <span className={`mt-2 inline-flex w-fit px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-[2px] ${offerBadge.style}`}>
                             {offerBadge.label}
                           </span>
                         )}
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                       <span className={`text-xl font-black ${candidate.matching_score >= 80 ? 'text-blue-600' : 'text-slate-400'}`}>
                          {candidate.matching_score || 0}%
                       </span>
                    </td>
                    <td className="py-6 px-4 text-center">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-[2px] ${getStatusBadgeStyle(candidate.statut)}`}>
                         {candidate.statut || 'PENDING'}
                       </span>
                    </td>
                    <td className="py-6 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {nextStatus && (
                          <button
                            onClick={() => openAdvanceWorkflow(candidate)}
                            className="px-4 py-2.5 bg-blue-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-md shadow-blue-100"
                          >
                             {getAdvanceLabel(candidate.statut)}
                          </button>
                        )}
                        {(candidate.statut?.toUpperCase() === 'UNDER_REVIEW' || candidate.statut?.toUpperCase() === 'INTERVIEW') && (
                          <button
                            onClick={() => openInterviewTimeline(candidate)}
                            className="px-4 py-2.5 bg-amber-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-amber-700 hover:-translate-y-0.5 transition-all shadow-md shadow-amber-100"
                          >
                             Manage Interviews
                          </button>
                        )}
                        <button
                          onClick={() => openProfile(candidate)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                          title="View profile"
                        >
                           <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Job Postings */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Job Postings</h3>
           <button className="text-blue-600 text-sm font-bold hover:underline">View All Jobs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Job Title</th>
                <th className="text-center py-4 px-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Exposures</th>
                <th className="text-center py-4 px-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Contract</th>
                <th className="text-center py-4 px-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</th>
                <th className="text-center py-4 px-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Posted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activePostings.length === 0 ? (
                 <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold italic">No active job postings found.</td></tr>
              ) : (
                activePostings.map((job: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4 text-slate-900 font-bold flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                      {job.titre}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-600 font-semibold">{job.nombre_vues}</td>
                    <td className="py-4 px-4 text-center text-slate-600 font-mono text-xs font-black">{job.type_contrat}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wide ${
                        (job.statut === 'OUVERT' || job.statut === 'Active') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>{job.statut}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 font-bold">{new Date(job.date_pub).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           HIRING WORKFLOW MODAL — The "Real Flux"
         ═══════════════════════════════════════════════════════════ */}
      {showWorkflow && workflowCandidate && (() => {
        const currentIdx = getStageIndex(workflowCandidate.statut);
        const nextStatus = getNextStatus(workflowCandidate.statut);
        const nextIdx = nextStatus ? getStageIndex(nextStatus) : -1;
        const nextStage = nextIdx >= 0 ? STAGES[nextIdx] : null;

        return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/30 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 pb-10 relative">
                 <button onClick={() => setShowWorkflow(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                    <X className="w-5 h-5" />
                 </button>
                 <p className="text-blue-300 text-[10px] font-black uppercase tracking-[4px] mb-2">Hiring Workflow</p>
                 <h2 className="text-2xl font-black text-white tracking-tight">{workflowCandidate.candidate_name}</h2>
                 <p className="text-white/60 text-sm font-bold mt-1">Applied for: {workflowCandidate.job_title}</p>
              </div>

              {/* Pipeline Stepper */}
              <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
                 <div className="flex items-center justify-between">
                    {STAGES.map((stage, i) => (
                      <React.Fragment key={stage.key}>
                        <div className="flex flex-col items-center gap-2">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs transition-all duration-500 ${
                             i <= currentIdx ? stage.color :
                             (workflowStep === 3 && i === nextIdx) ? (nextStage?.color || 'bg-slate-200') : 'bg-slate-200'
                           } ${workflowStep === 2 && i === nextIdx ? 'animate-pulse' : ''}`}>
                              {i < currentIdx ? <CheckCircle className="w-4 h-4" /> :
                               (workflowStep === 3 && i === nextIdx) ? <CheckCircle className="w-4 h-4" /> :
                               i + 1}
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-wider ${i <= currentIdx ? 'text-slate-900' : 'text-slate-300'}`}>
                             {stage.label}
                           </span>
                        </div>
                        {i < STAGES.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500 ${
                            i < currentIdx ? 'bg-slate-900' :
                            (workflowStep === 3 && i < nextIdx) ? 'bg-slate-900' :
                            (workflowStep === 2 && i === currentIdx) ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                 </div>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                 {/* STEP 0: Confirmation */}
                 {workflowStep === 0 && (
                   <div className="space-y-6">
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3">Next Milestone</p>
                         <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${nextStage?.color || 'bg-slate-400'}`}>
                               {nextStage?.key === 'UNDER_REVIEW' && <Eye className="w-6 h-6" />}
                               {nextStage?.key === 'INTERVIEW' && <Calendar className="w-6 h-6" />}
                               {nextStage?.key === 'ACCEPTED' && <Award className="w-6 h-6" />}
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-slate-900 tracking-tight">{nextStage?.label}</h3>
                               <p className="text-slate-500 font-medium text-sm">
                                  {nextStage?.key === 'UNDER_REVIEW' && "Begin screening this candidate's qualifications and background."}
                                  {nextStage?.key === 'INTERVIEW' && 'Schedule a formal interview with this candidate.'}
                                  {nextStage?.key === 'ACCEPTED' && 'Extend an official offer to this candidate.'}
                               </p>
                            </div>
                         </div>
                      </div>

                      {/* Candidate's Submitted Attachments */}
                      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl p-6 border border-blue-100">
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Submitted Application
                         </p>
                         <div className="space-y-5">
                            {/* Cover Letter Section */}
                            <div className="bg-white rounded-2xl p-5 border border-blue-100/50">
                               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Cover Letter</p>
                               {workflowCandidate.lettre_motivation ? (
                                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-48 overflow-y-auto">
                                   <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">{workflowCandidate.lettre_motivation}</p>
                                 </div>
                               ) : (
                                 <p className="text-sm text-slate-400 italic">No cover letter provided</p>
                               )}
                            </div>

                            {/* CV Section */}
                            <div className="bg-white rounded-2xl p-5 border border-blue-100/50">
                               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">CV / Resume</p>
                               {workflowCandidate.cv ? (
                                 <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                   <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-black">PDF</div>
                                   <div className="flex-1">
                                     <p className="text-sm font-bold text-slate-700">{workflowCandidate.cv.split('/').pop() || 'CV Document'}</p>
                                     <p className="text-xs text-slate-500">Attached by candidate</p>
                                   </div>
                                   <a 
                                     href={buildUploadUrl(workflowCandidate.cv, 'cvs')} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="px-4 py-2 bg-blue-600 text-white font-black rounded-lg text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                                   >
                                     Preview
                                   </a>
                                 </div>
                               ) : (
                                 <p className="text-sm text-slate-400 italic">No CV uploaded</p>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* Interview scheduling form - shown when moving to INTERVIEW */}
                      {workflowCandidate.statut?.toUpperCase() === 'UNDER_REVIEW' && (
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Interview Details</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-2">Date</label>
                                 <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)}
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all" />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-2">Time</label>
                                 <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)}
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all" />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Location / Meeting Link</label>
                              <input type="text" placeholder="e.g. Office Floor 3, Room B / Zoom link..."
                                value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all" />
                           </div>
                        </div>
                      )}

                      {nextStage?.key === 'ACCEPTED' && (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Offer Details</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Salary Amount</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="e.g. 2500"
                                value={offerSalary}
                                onChange={(e) => setOfferSalary(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Currency</label>
                              <select
                                value={offerCurrency}
                                onChange={(e) => setOfferCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                              >
                                <option value="TND">TND</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Contract Type</label>
                              <input
                                type="text"
                                placeholder="e.g. CDI / CDD / Full-time"
                                value={offerContractType}
                                onChange={(e) => setOfferContractType(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Start Date</label>
                              <input
                                type="date"
                                value={offerStartDate}
                                onChange={(e) => setOfferStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Offer Message (optional)</label>
                            <textarea
                              rows={3}
                              placeholder="Write a short message for the candidate..."
                              value={offerMessage}
                              onChange={(e) => setOfferMessage(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all resize-none"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Internal Note (optional)</label>
                         <textarea rows={2} placeholder="Add a note for your team..." value={recruiterNote}
                           onChange={(e) => setRecruiterNote(e.target.value)}
                           className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all resize-none" />
                      </div>

                      <div className="flex items-center justify-between pt-4 gap-3 flex-wrap">
                         <button onClick={() => setShowWorkflow(false)} className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Cancel</button>
                         <div className="flex items-center gap-3 flex-wrap">
                           <button onClick={() => openRejectWorkflow(workflowCandidate)} className="px-6 py-3 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95">
                              <XCircle className="w-4 h-4" />
                              Reject
                           </button>
                           <button onClick={executeAdvance} className={`flex items-center gap-3 px-8 py-4 ${nextStage?.color || 'bg-blue-600'} text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all active:scale-95`}>
                              <ArrowRight className="w-4 h-4" />
                              Confirm: {nextStage?.label}
                           </button>
                         </div>
                      </div>
                   </div>
                 )}

                 {/* STEP 2: Processing */}
                 {workflowStep === 2 && (
                   <div className="flex flex-col items-center justify-center py-16 space-y-6">
                      <div className="relative">
                         <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                         <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                         <Loader className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="text-center">
                         <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Processing Transition</h3>
                         <p className="text-slate-500 font-medium text-sm">Moving {workflowCandidate.candidate_name} to {nextStage?.label}...</p>
                      </div>
                   </div>
                 )}

                 {/* STEP 3: Success */}
                 {workflowStep === 3 && (
                   <div className="flex flex-col items-center justify-center py-16 space-y-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${nextStage?.color || 'bg-emerald-500'} text-white shadow-2xl animate-in zoom-in-50 duration-500`}>
                         <CheckCircle className="w-10 h-10" />
                      </div>
                      <div className="text-center">
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Transition Complete ✓</h3>
                         <p className="text-slate-500 font-medium text-sm">
                            <span className="font-black text-slate-900">{workflowCandidate.candidate_name}</span> has been advanced to <span className="font-black text-blue-600">{nextStage?.label}</span>.
                         </p>
                      </div>
                      <button onClick={() => setShowWorkflow(false)} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 mt-4">
                         Close Workflow
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
        );
      })()}

      {/* ═══════════════════════════════════════
           REJECTION CONFIRMATION MODAL
         ═══════════════════════════════════════ */}
      {showReject && rejectCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/30 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 relative">
                 <button onClick={() => setShowReject(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                    <X className="w-4 h-4" />
                 </button>
                 <p className="text-red-200 text-[10px] font-black uppercase tracking-[4px] mb-1">Confirm Rejection</p>
                 <h2 className="text-xl font-black text-white">{rejectCandidate.candidate_name}</h2>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-slate-600 text-sm font-medium">This will set the candidate's status to <span className="font-black text-red-600">REJECTED</span>.</p>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Reason (optional)</label>
                    <textarea rows={2} placeholder="e.g. Does not meet qualification requirements..."
                      value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-red-50 focus:border-red-400 transition-all resize-none" />
                 </div>
                 <div className="flex items-center justify-between pt-2">
                    <button onClick={() => setShowReject(false)} className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Cancel</button>
                    <button onClick={executeReject} disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                       {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                       Confirm Reject
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showProfile && selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-2xl bg-white/20 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95">
              <div className="h-40 bg-gradient-to-r from-slate-900 to-indigo-900 relative">
                 <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="px-12 relative flex flex-col min-h-0 text-left">
                 <div className="absolute -top-16 left-12 w-32 h-32 rounded-[32px] bg-white p-2 shadow-2xl border border-slate-50">
                    {getField(selectedCandidate, 'candidate_avatar', 'avatar') ? (
                      <img
                        src={buildUploadUrl(getField(selectedCandidate, 'candidate_avatar', 'avatar'), 'images')}
                        alt={selectedCandidate.candidate_name}
                        className="w-full h-full object-cover rounded-[24px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-900 font-black text-3xl">
                        {selectedCandidate.candidate_name?.[0].toUpperCase()}
                      </div>
                    )}
                 </div>
                 <div className="mt-20 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-50">
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{selectedCandidate.candidate_name}</h2>
                       <p className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-3">{selectedCandidate.candidate_specialty || 'Professional Candidate'}</p>
                       <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-xs uppercase tracking-tight">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_location || 'Tunisia'}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_experience || '—'} EXP</span>
                          <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_education || 'GRADUATE'}</span>
                       </div>
                    </div>
                    <button 
                        onClick={() => {
                           if (selectedCandidate.candidate_cv_url) {
                              const baseUrl = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads';
                              const url = selectedCandidate.candidate_cv_url.startsWith('http') 
                                 ? selectedCandidate.candidate_cv_url 
                                 : `${baseUrl}/cvs/${encodeURIComponent(selectedCandidate.candidate_cv_url)}`;
                              window.open(url, '_blank');
                           } else {
                              alert('No resume uploaded by this candidate.');
                           }
                        }}
                        className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all active:scale-95"
                     >
                        <FileText className="w-4 h-4" /> DOWNLOAD RESUME
                    </button>
                 </div>
                 <div className="py-8 flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    <div className="lg:col-span-2 space-y-8">
                       <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Professional Biography</h4>
                          <p className="text-slate-600 leading-relaxed font-medium italic text-sm p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             "{selectedCandidate.candidate_bio || 'No biography provided by candidate yet.'}"
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <a href={normalizeUrl(getField(selectedCandidate, 'candidate_linkedin', 'linkedin')) || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group">
                             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><FaLinkedin className="w-5 h-5" /></div>
                             <span className="text-xs font-black text-slate-700 tracking-tight">LinkedIn Profile</span>
                          </a>
                          <a href={normalizeUrl(getField(selectedCandidate, 'candidate_github', 'github')) || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group">
                             <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><FaGithub className="w-5 h-5" /></div>
                             <span className="text-xs font-black text-slate-700 tracking-tight">Github Portfolio</span>
                          </a>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-slate-200">
                          <h4 className="text-[10px] text-white/40 font-black uppercase tracking-[4px] mb-4">Contact Info</h4>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-400" /><span className="text-xs font-bold truncate">{selectedCandidate.candidate_email}</span></div>
                             <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-emerald-400" /><span className="text-xs font-bold">{getField(selectedCandidate, 'candidate_phone', 'telephone') || '+216 -- --- ---'}</span></div>
                             <div className="flex items-center gap-3">
                               <Globe className="w-4 h-4 text-indigo-400" />
                               {normalizeUrl(getField(selectedCandidate, 'candidate_portfolio', 'portfolio')) ? (
                                 <a
                                   href={normalizeUrl(getField(selectedCandidate, 'candidate_portfolio', 'portfolio'))}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="text-xs font-bold truncate underline underline-offset-2 hover:text-indigo-300"
                                 >
                                   {getField(selectedCandidate, 'candidate_portfolio', 'portfolio')}
                                 </a>
                               ) : (
                                 <span className="text-xs font-bold truncate">No portfolio link</span>
                               )}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
           INTERVIEW TIMELINE MODAL
         ═══════════════════════════════════════ */}
      {showInterviewTimeline && timelineCandidate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/30 animate-in fade-in duration-300">
          <InterviewTimeline
            applicationId={timelineCandidate.id_candidature}
            candidateName={timelineCandidate.candidate_name}
            jobTitle={timelineCandidate.job_title}
            onClose={() => {
              setShowInterviewTimeline(false);
              setTimelineCandidate(null);
            }}
          />
        </div>
      )}
    </div>
  );
};


export default CompanyDashboard;
