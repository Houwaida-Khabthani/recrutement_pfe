import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Calendar, Clock, CheckCircle, XCircle,
  MapPin, Briefcase, Filter, ArrowRight
} from 'lucide-react';
import { useGetMyApplicationsQuery } from '../../store/api/applicationApi';

const STAGES = [
  { key: 'PENDING',      label: 'Applied',       color: 'bg-slate-400',   textColor: 'text-slate-600',   bgLight: 'bg-slate-50',   borderColor: 'border-slate-100' },
  { key: 'UNDER_REVIEW', label: 'Under Review',  color: 'bg-amber-500',   textColor: 'text-amber-600',   bgLight: 'bg-amber-50',   borderColor: 'border-amber-100' },
  { key: 'INTERVIEW',    label: 'Interview',     color: 'bg-blue-500',    textColor: 'text-blue-600',    bgLight: 'bg-blue-50',    borderColor: 'border-blue-100' },
  { key: 'ACCEPTED',     label: 'Offer Sent',    color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-100' },
  { key: 'REJECTED',     label: 'Rejected',      color: 'bg-red-500',     textColor: 'text-red-600',     bgLight: 'bg-red-50',     borderColor: 'border-red-100' },
];

const getStage = (status: string) => STAGES.find(s => s.key === status?.toUpperCase()) || STAGES[0];

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

const CandidateApplications = () => {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useGetMyApplicationsQuery(undefined);

  const [activeFilter, setActiveFilter] = useState('ALL');

  const apps = Array.isArray(applications) ? applications : [];

  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = apps.filter((a: any) => {
      const status = a.statut?.toUpperCase();
      if (s.key === 'PENDING') return status === 'PENDING' || status === 'EN_ATTENTE';
      return status === s.key;
    }).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = activeFilter === 'ALL' ? apps : apps.filter((a: any) => {
    const status = a.statut?.toUpperCase();
    if (activeFilter === 'PENDING') return status === 'PENDING' || status === 'EN_ATTENTE';
    return status === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div>
        <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1">Career Tracker</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">My Applications</h1>
        <p className="text-slate-400 font-medium text-base mt-1">
          Track the status of all your job applications in one place.
        </p>
      </div>

      {/* ── Pipeline summary ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Application Pipeline</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAGES.slice(0, 4).map((stage) => (
            <div
              key={stage.key}
              onClick={() => setActiveFilter(activeFilter === stage.key ? 'ALL' : stage.key)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 ${activeFilter === stage.key ? `${stage.bgLight} ${stage.borderColor}` : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
            >
              <div className={`w-3 h-3 rounded-full ${stage.color} mb-3`} />
              <p className="text-2xl font-black text-slate-900 mb-1">{counts[stage.key] || 0}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === stage.key ? stage.textColor : 'text-slate-400'}`}>
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
        </div>
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
        >
          All ({apps.length})
        </button>
        {STAGES.map((stage) => (
          <button
            key={stage.key}
            onClick={() => setActiveFilter(activeFilter === stage.key ? 'ALL' : stage.key)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeFilter === stage.key ? `${stage.color} text-white border-transparent` : `${stage.bgLight} ${stage.textColor} ${stage.borderColor} hover:opacity-80`}`}
          >
            {stage.label} ({counts[stage.key] || 0})
          </button>
        ))}
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[30px] flex items-center justify-center mb-5">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black text-lg mb-2">No applications found</p>
            <p className="text-slate-300 text-sm mb-6">
              {activeFilter !== 'ALL' ? 'No applications with this status.' : 'You haven\'t applied to any jobs yet.'}
            </p>
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
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-[3px]">
                  <th className="py-6 px-6 text-left">Job Offer</th>
                  <th className="py-6 px-4 text-left">Company</th>
                  <th className="py-6 px-4 text-center">Applied Date</th>
                  <th className="py-6 px-4 text-center">Pipeline Stage</th>
                  <th className="py-6 px-4 text-center">Status</th>
                  <th className="py-6 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((app: any, i: number) => {
                  const status = app.statut?.toUpperCase();
                  const effectiveStatus = status === 'EN_ATTENTE' ? 'PENDING' : status;
                  const stage = getStage(effectiveStatus);
                  const stageIndex = STAGES.findIndex(s => s.key === effectiveStatus);

                  return (
                    <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                            {app.job_title?.[0]?.toUpperCase() || 'J'}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base mb-0.5">{app.job_title || '—'}</p>
                            <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-400" />{app.localisation || 'Remote'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="font-bold text-slate-700">{app.company_name || '—'}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <span className="font-bold text-slate-500 text-xs">
                          {app.date_postule ? new Date(app.date_postule).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-center">
                        {/* Mini pipeline tracker */}
                        <div className="flex items-center justify-center gap-1">
                          {STAGES.slice(0, 4).map((s, si) => (
                            <div
                              key={s.key}
                              className={`w-2 h-2 rounded-full transition-all ${si <= stageIndex && stageIndex !== 4 ? s.color : (app.statut?.toUpperCase() === 'REJECTED' && si === stageIndex ? 'bg-red-500' : 'bg-slate-200')}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-[2px] ${stage.bgLight} ${stage.textColor} ${stage.borderColor}`}>
                          {getStatusIcon(app.statut)}
                          {app.statut || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <button
                          onClick={() => navigate(`/candidate/applications/${app.id_candidature}`)}
                          className="flex items-center gap-1.5 ml-auto px-4 py-2.5 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateApplications;
