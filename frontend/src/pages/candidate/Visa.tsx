import { Globe, FileText, Clock, CheckCircle, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useGetVisaStatusQuery, useGetVisaHistoryQuery } from '../../store/api/visaApi';

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved': case 'approuvé': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'rejected': case 'refusé':  return 'bg-red-50 text-red-600 border-red-100';
    case 'pending': case 'en_attente': return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved': case 'approuvé': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'rejected': case 'refusé':   return <X className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
};

const CandidateVisa = () => {
  const { data: visaStatus, isLoading: statusLoading } = useGetVisaStatusQuery(undefined);
  const { data: visaHistory = [], isLoading: historyLoading } = useGetVisaHistoryQuery(undefined);

  const isLoading = statusLoading || historyLoading;
  const visaList = Array.isArray(visaHistory) ? visaHistory : (visaStatus ? [visaStatus] : []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">

      {/* ── Header ── */}
      <div>
        <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> International
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Visa Management</h1>
        <p className="text-slate-400 font-medium text-base mt-1">Track your visa applications for international positions.</p>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Requests', value: visaList.length, icon: FileText, color: 'text-indigo-400' },
            { label: 'Approved', value: visaList.filter((v: any) => ['approved', 'approuvé'].includes(v.statut?.toLowerCase())).length, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Pending', value: visaList.filter((v: any) => ['pending', 'en_attente'].includes(v.statut?.toLowerCase())).length, icon: Clock, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Visa guide ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">How Visa Processing Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, label: 'Job Offer', desc: 'Secure a job offer from an international employer', icon: '💼', color: 'bg-indigo-50 border-indigo-100' },
            { step: 2, label: 'Apply', desc: 'Submit your visa application with documents', icon: '📝', color: 'bg-amber-50 border-amber-100' },
            { step: 3, label: 'Processing', desc: 'Your application is reviewed by authorities', icon: '⏳', color: 'bg-blue-50 border-blue-100' },
            { step: 4, label: 'Decision', desc: 'Receive approval or feedback on your request', icon: '✅', color: 'bg-emerald-50 border-emerald-100' },
          ].map(({ step, label, desc, icon, color }) => (
            <div key={step} className={`relative p-5 rounded-2xl border ${color} text-center`}>
              <span className="text-3xl mb-3 block">{icon}</span>
              <p className="font-black text-slate-900 text-sm mb-1">Step {step}: {label}</p>
              <p className="text-slate-500 text-xs font-medium">{desc}</p>
              {step < 4 && (
                <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Visa List ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Visa History</h3>
          <p className="text-slate-400 text-xs font-bold">All active and past visa requests</p>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visaList.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-[30px] flex items-center justify-center mb-5">
              <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black text-lg mb-2">No visa requests yet</p>
            <p className="text-slate-300 text-sm">Your visa records will appear here once applications begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-[3px]">
                  <th className="py-6 px-6 text-left">Destination</th>
                  <th className="py-6 px-4 text-left">Visa Type</th>
                  <th className="py-6 px-4 text-center">Date</th>
                  <th className="py-6 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visaList.map((visa: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          🌍
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{visa.pays || '—'}</p>
                          <p className="text-slate-400 text-[11px] font-bold">International</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-xl border border-indigo-100 tracking-widest">
                        {visa.type_visa || visa.type || '—'}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-center font-bold text-slate-500 text-xs">
                      {visa.date_demande ? new Date(visa.date_demande).toLocaleDateString() : visa.date_creation ? new Date(visa.date_creation).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-6 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-[2px] ${getStatusStyle(visa.statut)}`}>
                        {getStatusIcon(visa.statut)}{visa.statut || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Resources ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Important Notes
          </h3>
          <div className="space-y-3">
            {[
              'Processing times vary by country (2-16 weeks)',
              'Ensure all documents are translated if required',
              'Keep copies of everything you submit',
              'Some visas require a medical examination',
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-5 h-5 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-[9px] font-black">{i + 1}</span>
                </div>
                <p className="text-slate-600 text-xs font-medium">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[3px] mb-3">Need Help?</p>
          <h3 className="font-black text-lg mb-2">Visa Assistance Service</h3>
          <p className="text-indigo-200 text-sm font-medium mb-5">Our experts can guide you through the entire visa application process.</p>
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-700 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg">
            <Globe className="w-4 h-4" /> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateVisa;
