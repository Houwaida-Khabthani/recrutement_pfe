import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Clock, FileText, Briefcase, Award } from 'lucide-react';
import { useGetMyApplicationsQuery, useRespondToOfferMutation } from '../../store/api/applicationApi';

const STAGES = [
  { key: 'PENDING',      label: 'Applied',       color: 'bg-slate-400',   textColor: 'text-slate-600',  bgLight: 'bg-slate-50' },
  { key: 'UNDER_REVIEW', label: 'Under Review',  color: 'bg-amber-500',   textColor: 'text-amber-600',  bgLight: 'bg-amber-50' },
  { key: 'INTERVIEW',    label: 'Interview',     color: 'bg-blue-500',    textColor: 'text-blue-600',   bgLight: 'bg-blue-50' },
  { key: 'ACCEPTED',     label: 'Offer Sent',    color: 'bg-emerald-500', textColor: 'text-emerald-600',bgLight: 'bg-emerald-50' },
];

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':     return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'REJECTED':     return <XCircle className="w-5 h-5 text-red-500" />;
    case 'INTERVIEW':    return <Calendar className="w-5 h-5 text-blue-500" />;
    case 'UNDER_REVIEW': return <Clock className="w-5 h-5 text-amber-500" />;
    case 'PENDING':
    case 'EN_ATTENTE':   return <Clock className="w-5 h-5 text-slate-400" />;
    default:             return <Clock className="w-5 h-5 text-slate-400" />;
  }
};

const CandidateApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: applications = [] } = useGetMyApplicationsQuery(undefined);
  const [respondToOffer, { isLoading: responding }] = useRespondToOfferMutation();

  const app = Array.isArray(applications) ? applications.find((a: any) => String(a.id_candidature) === String(id)) : null;

  if (!app) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
      <p className="text-slate-400 font-black text-lg">Application not found.</p>
      <button onClick={() => navigate('/candidate/applications')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Back to Applications</button>
    </div>
  );

  const status = app.statut?.toUpperCase();
  const effectiveStatus = status === 'EN_ATTENTE' ? 'PENDING' : status;
  const currentIdx = STAGES.findIndex(s => s.key === effectiveStatus);
  const isRejected = status === 'REJECTED';
  const offerDecision = app.offer_status?.toUpperCase();
  const hasPendingOffer = status === 'ACCEPTED' && (!offerDecision || offerDecision === 'PENDING');

  const handleOfferResponse = async (decision: 'ACCEPT' | 'REJECT') => {
    try {
      await respondToOffer({ id: app.id_candidature, decision }).unwrap();
    } catch (e) {
      console.error(e);
      alert('Unable to send your decision. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/candidate/applications')} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[4px] mb-3">Application Details</p>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-2xl">
              {app.job_title?.[0]?.toUpperCase() || 'J'}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1">{app.job_title || '—'}</h1>
              <div className="flex flex-wrap gap-4 text-white/40 text-xs font-bold uppercase tracking-tight">
                {app.company_name && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.company_name}</span>}
                {app.localisation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.localisation}</span>}
                {app.date_postule && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.date_postule).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline tracker */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 tracking-tight mb-8">Hiring Pipeline</h2>
        <div className="flex items-center justify-between">
          {STAGES.map((stage, i) => {
            const isActive = i <= currentIdx && !isRejected;
            const isCurrent = i === currentIdx && !isRejected;

            return (
              <div key={stage.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? stage.color + ' text-white shadow-lg' : 'bg-slate-100 text-slate-300'} ${isCurrent ? 'scale-110' : ''}`}>
                    {isActive ? <CheckCircle className="w-5 h-5" /> : <span className="font-black text-sm">{i + 1}</span>}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider text-center ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{stage.label}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${i < currentIdx && !isRejected ? 'bg-slate-900' : 'bg-slate-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        {isRejected && (
          <div className="mt-8 p-5 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-bold text-sm">Unfortunately, your application was not selected to move forward at this time.</p>
          </div>
        )}

        {app.statut?.toUpperCase() === 'ACCEPTED' && (
          <div className="mt-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-emerald-700 font-bold text-sm">Congratulations! 🎉 You received an offer. Review the details below and send your decision.</p>
          </div>
        )}
      </div>

      {(status === 'ACCEPTED' || offerDecision) && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-5">Offer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</p>
              <p className="font-bold text-slate-700 text-sm">
                {app.offer_salary ? `${app.offer_salary} ${app.offer_currency || ''}` : 'Not provided'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Type</p>
              <p className="font-bold text-slate-700 text-sm">{app.offer_contract_type || 'Not provided'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Proposed Start Date</p>
              <p className="font-bold text-slate-700 text-sm">{app.offer_start_date ? new Date(app.offer_start_date).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Offer Status</p>
              <p className="font-bold text-slate-700 text-sm">{offerDecision || 'PENDING'}</p>
            </div>
          </div>

          {app.offer_message && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recruiter Message</p>
              <p className="font-bold text-slate-700 text-sm">{app.offer_message}</p>
            </div>
          )}

          {hasPendingOffer && (
            <div className="flex items-center gap-3">
              <button
                disabled={responding}
                onClick={() => handleOfferResponse('ACCEPT')}
                className="px-5 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                Accept Offer
              </button>
              <button
                disabled={responding}
                onClick={() => handleOfferResponse('REJECT')}
                className="px-5 py-3 bg-red-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60"
              >
                Decline Offer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-5">Application Info</h3>
          <div className="space-y-4">
            {[
              { label: 'Status', value: app.statut || 'PENDING', icon: getStatusIcon(app.statut) },
              { label: 'Applied On', value: app.date_postule ? new Date(app.date_postule).toLocaleDateString() : '—', icon: <Calendar className="w-4 h-4 text-slate-400" /> },
              { label: 'Last Update', value: app.date_reponse ? new Date(app.date_reponse).toLocaleDateString() : '—', icon: <Clock className="w-4 h-4 text-slate-400" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                {icon}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className="font-bold text-slate-700 text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-5">Interview Details</h3>
          <div className="space-y-4">
            {[
              { label: 'Interview Date', value: app.entretien_date ? new Date(app.entretien_date).toLocaleDateString() : 'Not scheduled', icon: <Calendar className="w-4 h-4 text-slate-400" /> },
              { label: 'Interview Location', value: app.entretien_lieu || 'N/A', icon: <MapPin className="w-4 h-4 text-slate-400" /> },
              { label: 'Recruiter Note', value: app.note_recruteur ? `${app.note_recruteur}/10` : 'Not rated yet', icon: <FileText className="w-4 h-4 text-slate-400" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                {icon}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className="font-bold text-slate-700 text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      {app.lettre_motivation && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Your Cover Letter</h3>
          <p className="text-slate-600 leading-relaxed font-medium text-sm italic bg-slate-50 p-6 rounded-2xl border border-slate-100">
            "{app.lettre_motivation}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateApplicationDetails;
