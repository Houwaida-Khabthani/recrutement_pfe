import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, DollarSign, Clock, Calendar,
  CheckCircle, Building, Send, X, Loader, Upload, Globe
} from 'lucide-react';
import { useGetJobByIdQuery } from '../../store/api/jobApi';
import { useApplyToJobMutation, useGetMyApplicationsQuery } from '../../store/api/applicationApi';

const CandidateJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading } = useGetJobByIdQuery(id!);
  const { data: myApplications = [] } = useGetMyApplicationsQuery(undefined);
  const [applyToJob, { isLoading: applying }] = useApplyToJobMutation();

  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applied, setApplied] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Check if user already applied to this job
  const currentApplication = Array.isArray(myApplications)
    ? myApplications.find((app: any) => String(app.id_offre) === String(id))
    : null;

  const canReapply = currentApplication?.statut === 'REJECTED';
  const canApply = !currentApplication || canReapply;

  // ✅ Validate both fields are filled (BOTH required)
  const validateForm = () => {
    if (!coverLetter.trim()) {
      setValidationError('Cover letter is required');
      return false;
    }
    if (!cvFile) {
      setValidationError('CV attachment is required');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleApply = async () => {
    if (!id) return;
    
    // ✅ Validate before submitting
    if (!validateForm()) return;

    const formData = new FormData();
    if (coverLetter.trim()) formData.append('lettre_motivation', coverLetter.trim());
    if (cvFile) formData.append('cv', cvFile);
    try {
      await applyToJob({ jobId: id, data: formData }).unwrap();
      setApplied(true);
    } catch (e: any) {
      console.error('Apply error:', {
        status: e?.status,
        message: e?.data?.message || e?.data?.error || e?.message,
        fullError: e
      });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
      <p className="text-slate-400 font-bold text-lg">Job not found.</p>
      <button onClick={() => navigate('/candidate/jobs')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl">
        Back to Jobs
      </button>
    </div>
  );

  const isOpen = job.statut === 'OUVERT' || job.statut === 'Active';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">

      {/* Back button */}
      <button
        onClick={() => navigate('/candidate/jobs')}
        className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-2xl flex-shrink-0">
            {job.titre?.[0]?.toUpperCase() || 'J'}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap gap-3 mb-3">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isOpen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {job.statut}
              </span>
              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white/60">
                {job.type_contrat}
              </span>
              {job.experience && (
                <span className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white/60">
                  <Clock className="w-3 h-3" />{job.experience}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">{job.titre}</h1>
            <div className="flex flex-wrap gap-5 text-white/40 font-bold text-xs uppercase tracking-tight">
              {job.localisation && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-white/30" />{job.localisation}</span>}
              {job.salaire && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-white/30" />{job.salaire} TND/month</span>}
              {job.date_pub && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-white/30" />Posted {new Date(job.date_pub).toLocaleDateString()}</span>}
            </div>
          </div>

          {isOpen && canApply && !applied && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900 hover:-translate-y-1 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" /> Apply Now
            </button>
          )}
          {isOpen && canReapply && !applied && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-amber-900 hover:-translate-y-1 hover:bg-amber-500 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" /> Apply Again
            </button>
          )}
          {applied && (
            <div className="flex items-center gap-2 px-8 py-4 bg-emerald-500/20 text-emerald-400 font-black rounded-2xl text-sm uppercase tracking-widest border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" /> Applied!
            </div>
          )}
          {currentApplication && !applied && currentApplication.statut !== 'REJECTED' && (
            <div className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-slate-200/30 text-slate-600 font-black rounded-2xl text-sm uppercase tracking-widest border border-slate-300/30">
              <CheckCircle className="w-4 h-4" /> {currentApplication.statut}
            </div>
          )}
          {currentApplication?.statut === 'ACCEPTED' && !applied && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1 px-8 py-4 bg-emerald-500/20 text-emerald-600 font-black rounded-2xl text-sm uppercase tracking-widest border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" /> Accepted!
              <p className="text-[10px] font-medium">You can't apply again</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 pb-4 border-b border-slate-100">Job Description</h2>
            <div className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-line">
              {job.description || 'No description provided.'}
            </div>
          </div>

          {/* Requirements visual */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Clock, label: 'Experience Required', value: job.experience || 'Not specified' },
                { icon: Briefcase, label: 'Contract Type', value: job.type_contrat || 'Not specified' },
                { icon: MapPin, label: 'Location', value: job.localisation || 'Remote' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="font-bold text-slate-700 text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Company card */}
          <div 
            onClick={() => navigate(`/candidate/company/${job.id_entreprise}`)}
            className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 group"
          >
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-5">About the Company</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Building className="w-7 h-7 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-black text-white text-base">Company #{job.id_entreprise}</p>
                <p className="text-white/40 text-xs font-bold">Employer</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/candidate/company/${job.id_entreprise}`);
                }}
                className="w-full flex items-center gap-3 text-white/80 text-xs font-bold hover:text-white transition-colors group/btn"
              >
                <Globe className="w-3.5 h-3.5 text-white/20 group-hover/btn:text-indigo-400 transition-colors" />
                <span className="flex-1 group-hover/btn:text-indigo-400 transition-colors">Visit company profile</span>
                <ArrowLeft className="w-3.5 h-3.5 text-white/20 group-hover/btn:text-indigo-400 rotate-180 transition-colors" />
              </button>
            </div>
          </div>

          {/* Salary card */}
          {job.salaire && (
            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100">
              <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[4px] mb-2">Monthly Salary</p>
              <p className="text-4xl font-black tracking-tighter">{job.salaire}</p>
              <p className="text-emerald-300 font-bold text-sm mt-0.5">TND / month</p>
            </div>
          )}

          {applied && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-emerald-700 font-black text-sm">Application Submitted!</p>
              <p className="text-emerald-500 text-xs font-bold mt-1">We'll notify you of any updates.</p>
            </div>
          )}

          {currentApplication && !applied && (
            <div className={`${
              currentApplication.statut === 'ACCEPTED' 
                ? 'bg-emerald-50 border border-emerald-100' 
                : currentApplication.statut === 'REJECTED'
                ? 'bg-red-50 border border-red-100'
                : 'bg-blue-50 border border-blue-100'
            } rounded-3xl p-6 text-center`}>
              <CheckCircle className={`w-10 h-10 mx-auto mb-3 ${
                currentApplication.statut === 'ACCEPTED' 
                  ? 'text-emerald-500' 
                  : currentApplication.statut === 'REJECTED'
                  ? 'text-red-500'
                  : 'text-blue-500'
              }`} />
              <p className={`${
                currentApplication.statut === 'ACCEPTED' 
                  ? 'text-emerald-700' 
                  : currentApplication.statut === 'REJECTED'
                  ? 'text-red-700'
                  : 'text-blue-700'
              } font-black text-sm`}>
                {currentApplication.statut === 'ACCEPTED' ? 'Application Accepted! 🎉' : 
                 currentApplication.statut === 'REJECTED' ? 'Application Rejected' :
                 currentApplication.statut === 'INTERVIEW' ? 'In Interview Process' :
                 currentApplication.statut === 'EN_ATTENTE' ? 'Application Pending' :
                 currentApplication.statut}
              </p>
              <p className={`${
                currentApplication.statut === 'ACCEPTED' 
                  ? 'text-emerald-500' 
                  : currentApplication.statut === 'REJECTED'
                  ? 'text-red-500'
                  : 'text-blue-500'
              } text-xs font-bold mt-1`}>
                {currentApplication.statut === 'ACCEPTED' ? 'Congratulations!' : 
                 currentApplication.statut === 'REJECTED' ? 'You can apply again' :
                 'Status: ' + currentApplication.statut}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/30 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[4px] mb-2">Apply for Position</p>
              <h2 className="text-2xl font-black text-white tracking-tight">{job.titre}</h2>
              <p className="text-white/50 text-sm font-bold mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />{job.localisation || 'Remote'}
              </p>
            </div>

            {applied ? (
              <div className="p-12 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-500">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Application Sent! ✓</h3>
                <p className="text-slate-500 font-medium">Your application for <span className="font-black text-slate-900">{job.titre}</span> was submitted successfully.</p>
                <button onClick={() => { setShowModal(false); navigate('/candidate/applications'); }} className="mt-4 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:-translate-y-0.5 transition-all active:scale-95">
                  Track My Applications
                </button>
              </div>
            ) : (
              <div className="p-8 space-y-5">
                {/* Error Alert */}
                {validationError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-black">!</span>
                    </div>
                    <p className="text-red-600 text-sm font-medium">{validationError}</p>
                  </div>
                )}

                {/* Cover Letter */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    Cover Letter <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(required)</span>
                  </label>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => {
                      setCoverLetter(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Introduce yourself and explain why you're a great fit for this role..."
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-medium outline-none resize-none transition-all ${
                      validationError && !coverLetter.trim()
                        ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-300'
                        : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300'
                    }`}
                  />
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    Attach CV <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(required)</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 bg-slate-50 border-2 rounded-2xl cursor-pointer transition-all ${
                    cvFile 
                      ? 'border-indigo-300 bg-indigo-50/30' 
                      : validationError && !cvFile
                      ? 'border-dashed border-red-300 hover:border-red-400'
                      : 'border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}>
                    <Upload className={`w-5 h-5 flex-shrink-0 ${
                      cvFile 
                        ? 'text-indigo-600' 
                        : validationError && !cvFile
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      cvFile 
                        ? 'text-indigo-600 font-bold' 
                        : validationError && !cvFile
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}>
                      {cvFile ? cvFile.name : 'Click to attach your CV (PDF, DOC)'}
                    </span>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden" 
                      onChange={(e) => {
                        setCvFile(e.target.files?.[0] || null);
                        setValidationError('');
                      }} 
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => {
                    setShowModal(false);
                    setValidationError('');
                  }} className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying || !coverLetter.trim() || !cvFile}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applying ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobDetails;
