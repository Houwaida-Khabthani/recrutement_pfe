import React, { useState } from 'react';
import { useGetCompanyApplicationsQuery, useUpdateApplicationStatusMutation } from '../../store/api/applicationApi';
import { 
  FileText, 
  Search, 
  Download,
  MapPin,
  X,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  Calendar,
  Award,
  ArrowRight,
  XCircle,
  Loader
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

// ─────────────────────────────────────────────────
// HIRING LIFECYCLE DEFINITIONS
// ─────────────────────────────────────────────────
const STAGES = [
  { key: 'PENDING',       label: 'Applied',     color: 'bg-slate-400',   textColor: 'text-slate-600',   bgLight: 'bg-slate-50',   borderColor: 'border-slate-200' },
  { key: 'UNDER_REVIEW',  label: 'Screening',   color: 'bg-amber-500',   textColor: 'text-amber-600',   bgLight: 'bg-amber-50',   borderColor: 'border-amber-200' },
  { key: 'INTERVIEW',     label: 'Interview',   color: 'bg-blue-500',    textColor: 'text-blue-600',    bgLight: 'bg-blue-50',    borderColor: 'border-blue-200' },
  { key: 'ACCEPTED',      label: 'Offer Sent',  color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const getStageIndex = (status: string) => STAGES.findIndex(s => s.key === status?.toUpperCase());

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':     return { style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    case 'REJECTED':     return { style: 'bg-red-50 text-red-600 border-red-100',             icon: <XCircle className="w-3.5 h-3.5" /> };
    case 'INTERVIEW':    return { style: 'bg-blue-50 text-blue-600 border-blue-100',           icon: <Calendar className="w-3.5 h-3.5" /> };
    case 'UNDER_REVIEW': return { style: 'bg-amber-50 text-amber-600 border-amber-100',       icon: <Clock className="w-3.5 h-3.5" /> };
    default:             return { style: 'bg-slate-50 text-slate-500 border-slate-100',         icon: <Clock className="w-3.5 h-3.5" /> };
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
const CompanyReports: React.FC = () => {
  const { data: applications = [], isLoading } = useGetCompanyApplicationsQuery({});
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [searchTerm, setSearchTerm] = useState('');

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
  
  // Profile Modal
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Hiring Workflow Modal
  const [workflowCandidate, setWorkflowCandidate] = useState<any>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0); // 0 = confirm, 1 = details, 2 = processing, 3 = done
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reject Workflow
  const [rejectCandidate, setRejectCandidate] = useState<any>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading application ledger...</p>
      </div>
    );
  }

  const filteredApps = applications.filter((app: any) => 
    app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
  };

  // ─── HIRING WORKFLOW FUNCTIONS ───
  const openAdvanceWorkflow = (candidate: any) => {
    setWorkflowCandidate(candidate);
    setWorkflowStep(0);
    setInterviewDate('');
    setInterviewTime('10:00');
    setInterviewLocation('');
    setRecruiterNote('');
    setShowWorkflow(true);
  };

  const getNextStatus = (current: string) => {
    switch (current?.toUpperCase()) {
      case 'PENDING': return 'UNDER_REVIEW';
      case 'UNDER_REVIEW': return 'INTERVIEW';
      case 'INTERVIEW': return 'ACCEPTED';
      default: return null;
    }
  };

  const getAdvanceLabel = (current: string) => {
    switch (current?.toUpperCase()) {
      case 'PENDING': return 'Begin Screening';
      case 'UNDER_REVIEW': return 'Schedule Interview';
      case 'INTERVIEW': return 'Extend Offer';
      default: return 'Advance';
    }
  };

  const executeAdvance = async () => {
    if (!workflowCandidate) return;
    const nextStatus = getNextStatus(workflowCandidate.statut);
    if (!nextStatus) return;

    setWorkflowStep(2); // processing
    setIsProcessing(true);

    try {
      await updateStatus({
        id: workflowCandidate.id_candidature,
        status: nextStatus,
      }).unwrap();
      
      // Simulate a brief processing delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1200));
      setWorkflowStep(3); // done
    } catch (err) {
      console.error('Advance failed:', err);
      setWorkflowStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectWorkflow = (candidate: any) => {
    setRejectCandidate(candidate);
    setRejectReason('');
    setShowReject(true);
  };

  const executeReject = async () => {
    if (!rejectCandidate) return;
    setIsProcessing(true);
    try {
      await updateStatus({
        id: rejectCandidate.id_candidature,
        status: 'REJECTED',
      }).unwrap();
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowReject(false);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Helper: Does the candidate need interview details? ───
  const needsInterviewDetails = (status: string) => status?.toUpperCase() === 'UNDER_REVIEW';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-8 pt-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Application Ledger</h1>
             <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase text-center">OFFICIAL</span>
          </div>
          <p className="text-slate-500 font-medium text-lg italic">"Full historical record of your recruitment pipeline."</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search record..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <Download className="w-5 h-5" />
            EXPORT XLS
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-[3px]">
                <th className="px-8 py-6 font-black">Ref ID</th>
                <th className="px-8 py-6 font-black">Candidate Name</th>
                <th className="px-8 py-6 font-black">Target Listing</th>
                <th className="px-8 py-6 text-center font-black">Match Factor</th>
                <th className="px-8 py-6 text-center font-black">Current Status</th>
                <th className="px-8 py-6 text-center font-black">Actions</th>
                <th className="px-8 py-6 text-right pr-12 font-black">Record Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center text-slate-300 italic font-bold">No historical data matching current parameters.</td>
                </tr>
              ) : (
                filteredApps.map((app: any) => {
                  const badge = getStatusBadge(app.statut);
                  const nextStatus = getNextStatus(app.statut);
                  const showOfferDecision = String(app.statut || '').toUpperCase() === 'ACCEPTED';
                  const offerBadge = getOfferDecisionBadge(app.offer_status);
                  return (
                  <tr key={app.id_candidature} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 font-mono text-xs text-slate-400">#APP-{app.id_candidature.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => openProfile(app)}
                        className="font-black text-slate-900 text-base hover:text-blue-600 transition-colors"
                      >
                         {app.candidate_name}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <span className="font-black text-slate-700 text-sm">{app.job_title}</span>
                         <span className="text-slate-400 text-[11px] font-bold uppercase tracking-tighter italic">Source: Internal Dashboard</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-lg font-black text-slate-900">
                       <span className={app.matching_score >= 80 ? 'text-indigo-600' : 'text-slate-400'}>
                         {app.matching_score || 0}%
                       </span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-8 py-6 text-center">
                       <div className="inline-flex flex-col items-center gap-2">
                         <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-[2px] ${badge.style}`}>
                            {badge.icon}
                            {app.statut || 'PENDING'}
                         </div>
                         {showOfferDecision && (
                           <div className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase border tracking-[2px] ${offerBadge.style}`}>
                             {offerBadge.label}
                           </div>
                         )}
                       </div>
                    </td>
                    {/* Actions */}
                    <td className="px-8 py-6 text-center">
                       <div className="flex items-center justify-center gap-2">
                          {nextStatus && (
                            <>
                              <button 
                                onClick={() => openAdvanceWorkflow(app)}
                                className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:-translate-y-0.5"
                              >
                                 {getAdvanceLabel(app.statut)}
                              </button>
                              <button 
                                onClick={() => openRejectWorkflow(app)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                                title="Reject candidate"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => openProfile(app)}
                            className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            title="View profile"
                          >
                             <Eye className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right pr-12 text-slate-400 font-bold uppercase tracking-tighter text-[11px]">
                       {new Date(app.date_postule).toLocaleDateString() === 'Invalid Date' ? 'Processing...' : new Date(app.date_postule).toLocaleDateString()}
                    </td>
                  </tr>
                  );
                })
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
                 <button 
                   onClick={() => setShowWorkflow(false)}
                   className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                 >
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
                           <span className={`text-[9px] font-black uppercase tracking-wider ${
                             i <= currentIdx ? 'text-slate-900' : 'text-slate-300'
                           }`}>{stage.label}</span>
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

              {/* Modal Body — Step Content */}
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
                                  {nextStage?.key === 'UNDER_REVIEW' && 'Begin screening this candidate\'s qualifications and background.'}
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

                      {/* If moving to INTERVIEW, show scheduling form */}
                      {needsInterviewDetails(workflowCandidate.statut) && (
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Interview Details</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-2">Date</label>
                                 <input 
                                   type="date" 
                                   value={interviewDate}
                                   onChange={(e) => setInterviewDate(e.target.value)}
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-2">Time</label>
                                 <input 
                                   type="time" 
                                   value={interviewTime}
                                   onChange={(e) => setInterviewTime(e.target.value)}
                                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                                 />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Location / Meeting Link</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Office Floor 3, Room B / Zoom link..."
                                value={interviewLocation}
                                onChange={(e) => setInterviewLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all"
                              />
                           </div>
                        </div>
                      )}

                      {/* Recruiter Note */}
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Internal Note (optional)</label>
                         <textarea 
                           rows={2}
                           placeholder="Add a note for your team..."
                           value={recruiterNote}
                           onChange={(e) => setRecruiterNote(e.target.value)}
                           className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all resize-none"
                         />
                      </div>

                      {/* Confirm Buttons */}
                      <div className="flex items-center justify-between pt-4">
                         <button 
                           onClick={() => setShowWorkflow(false)}
                           className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                         >
                            Cancel
                         </button>
                         <button 
                           onClick={executeAdvance}
                           className={`flex items-center gap-3 px-8 py-4 ${nextStage?.color || 'bg-blue-600'} text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all active:scale-95`}
                         >
                            <ArrowRight className="w-4 h-4" />
                            Confirm: {nextStage?.label}
                         </button>
                      </div>
                   </div>
                 )}

                 {/* STEP 2: Processing Animation */}
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
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Transition Complete</h3>
                         <p className="text-slate-500 font-medium text-sm">
                            <span className="font-black text-slate-900">{workflowCandidate.candidate_name}</span> has been advanced to <span className="font-black" style={{color: 'var(--color-blue-600)'}}>{nextStage?.label}</span>.
                         </p>
                      </div>
                      <button 
                        onClick={() => setShowWorkflow(false)}
                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 mt-4"
                      >
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
                 <button 
                   onClick={() => setShowReject(false)}
                   className="absolute top-4 right-4 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                 >
                    <X className="w-4 h-4" />
                 </button>
                 <p className="text-red-200 text-[10px] font-black uppercase tracking-[4px] mb-1">Confirm Rejection</p>
                 <h2 className="text-xl font-black text-white">{rejectCandidate.candidate_name}</h2>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-slate-600 text-sm font-medium">This action will set the candidate's status to <span className="font-black text-red-600">REJECTED</span>. This cannot be undone easily.</p>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Reason (optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Does not meet qualification requirements..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-red-50 focus:border-red-400 transition-all resize-none"
                    />
                 </div>
                 <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => setShowReject(false)}
                      className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={executeReject}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                       {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                       Confirm Reject
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
           PROFILE MODAL
         ═══════════════════════════════════════ */}
      {showProfile && selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-2xl bg-white/20 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95">
              
              <div className="h-40 bg-gradient-to-r from-slate-900 to-indigo-900 relative">
                 <button 
                   onClick={() => setShowProfile(false)}
                   className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="px-12 relative flex flex-col min-h-0">
                 <div className="absolute -top-16 left-12 w-32 h-32 rounded-[32px] bg-white p-2 shadow-2xl border border-slate-50">
                    {getField(selectedCandidate, 'candidate_avatar', 'avatar') ? (
                      <img
                        src={buildUploadUrl(getField(selectedCandidate, 'candidate_avatar', 'avatar'), 'images')}
                        alt={selectedCandidate.candidate_name}
                        className="w-full h-full object-cover rounded-[24px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-900 font-black text-3xl">
                        {selectedCandidate.candidate_name?.[0]}
                      </div>
                    )}
                 </div>

                 <div className="mt-20 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-50">
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{selectedCandidate.candidate_name}</h2>
                       <p className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-3">{selectedCandidate.candidate_specialty || 'Professional Candidate'}</p>
                       <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-xs uppercase tracking-tight">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_location || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_experience || '---'} EXP</span>
                          <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-slate-300" /> {selectedCandidate.candidate_education || 'GRADUATE'}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button
                          onClick={() => {
                            const cvFile = getField(selectedCandidate, 'candidate_cv_url', 'cv');
                            const cvUrl = buildUploadUrl(cvFile, 'cvs');
                            if (cvUrl) {
                              window.open(cvUrl, '_blank');
                            } else {
                              alert('No resume uploaded by this candidate.');
                            }
                          }}
                          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all active:scale-95"
                        >
                          <FileText className="w-4 h-4" />
                          DOWNLOAD RESUME
                       </button>
                    </div>
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
                             <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold truncate">{selectedCandidate.candidate_email}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold">{getField(selectedCandidate, 'candidate_phone', 'telephone') || '+216 -- --- ---'}</span>
                             </div>
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
                                  <span className="text-xs font-bold">No portfolio link</span>
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
    </div>
  );
};

export default CompanyReports;
