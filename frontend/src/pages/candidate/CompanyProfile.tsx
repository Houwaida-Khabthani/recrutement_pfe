import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building, Mail, Phone, MapPin, Globe, Briefcase, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { useGetCompanyByIdQuery } from '../../store/api/companyApi';
import { useGetJobsQuery } from '../../store/api/jobApi';
import { useGetInterviewsQuery } from '../../store/api/interviewApi';
import JoinMeetingButton from '../../components/JoinMeetingButton';

const CandidateCompanyProfile = () => {
  const openPositionsRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: company, isLoading } = useGetCompanyByIdQuery(id!);
  const { data: allJobs } = useGetJobsQuery(undefined);
  const { data: allInterviews = [] } = useGetInterviewsQuery(undefined);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <p className="text-slate-400 font-bold text-lg">Company not found.</p>
        <button
          onClick={() => navigate('/candidate/jobs')}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  // Filter jobs for this company
  const companyJobs = allJobs?.filter(
    (job: any) => job.id_entreprise === company.id_company && (job.statut === 'OUVERT' || job.statut === 'Active')
  ) || [];

  // Filter interviews for this company
  const companyInterviews = allInterviews?.filter(
    (interview: any) => interview.company === company.nom
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-2xl flex-shrink-0 overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.nom} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-10 h-10 text-white/60" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">{company.nom}</h1>
            <p className="text-white/60 font-medium text-sm mb-4">{company.type || 'Company'}</p>

            {/* Quick Info Tags */}
            <div className="flex flex-wrap gap-3 mb-4">
              {company.secteur && (
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white/60">
                  {company.secteur}
                </span>
              )}
              {company.activeJobs && (
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  {company.activeJobs} Open Position{company.activeJobs !== 1 ? 's' : ''}
                </span>
              )}
              {companyInterviews.length > 0 && (
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/20 border border-blue-500/30 text-blue-400">
                  {companyInterviews.length} Interview{companyInterviews.length !== 1 ? 's' : ''}
                </span>
              )}
              {company.pays && (
                <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white/60">
                  <MapPin className="w-3 h-3" /> {company.pays}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description and Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {company.description && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 pb-4 border-b border-slate-100">
                About the Company
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Contact Information</h2>
            <div className="space-y-4">
              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                    <Mail className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold text-slate-700 text-sm">{company.email}</p>
                  </div>
                </a>
              )}

              {company.telephone && (
                <a
                  href={`tel:${company.telephone}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                    <Phone className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-slate-700 text-sm">{company.telephone}</p>
                  </div>
                </a>
              )}

              {company.site_web && (
                <a
                  href={company.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                    <Globe className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</p>
                    <p className="font-bold text-slate-700 text-sm underline line-clamp-1">{company.site_web}</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Active Positions */}
          {companyJobs.length > 0 && (
            <div ref={openPositionsRef} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Open Positions</h2>
              <div className="space-y-3">
                {companyJobs.map((job: any) => (
                  <button
                    key={job.id_offre}
                    onClick={() => navigate(`/candidate/jobs/${job.id_offre}`)}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.titre}</p>
                        <div className="flex gap-2 mt-2">
                          {job.localisation && (
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.localisation}
                            </span>
                          )}
                          {job.type_contrat && (
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {job.type_contrat}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-indigo-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interview Information */}
          {companyInterviews.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Your Interviews</h2>
              <div className="space-y-4">
                {companyInterviews.map((interview: any) => (
                  <div key={interview.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{interview.jobTitle}</h3>
                        <p className="text-slate-600 text-sm">Interview Round {interview.step}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.status === 'scheduled' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Scheduled
                          </span>
                        )}
                        {interview.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {interview.status === 'cancelled' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                          <p className="font-medium text-slate-700">
                            {new Date(interview.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(interview.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {interview.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                            <p className="font-medium text-slate-700">{interview.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {interview.meetingLink && (
                      <div className="mb-4">
                        <JoinMeetingButton interview={interview} />
                      </div>
                    )}

                    {interview.notes && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-slate-700 text-sm">{interview.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Preparation Questions */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Interview Preparation</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Common Interview Questions</h3>
                <div className="space-y-3">
                  {[
                    "Tell me about yourself and your background.",
                    "Why are you interested in this position?",
                    "What are your strengths and weaknesses?",
                    "Where do you see yourself in 5 years?",
                    "Why do you want to work for our company?",
                    "Describe a challenging situation you faced and how you handled it.",
                    "What are your salary expectations?",
                    "Do you have any questions for us?"
                  ].map((question, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-medium text-slate-700 text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3">Technical Questions to Prepare</h3>
                <div className="space-y-3">
                  {[
                    "Explain your experience with [relevant technology].",
                    "How would you approach solving [common problem in the field]?",
                    "Describe a project you're proud of and your role in it.",
                    "How do you stay updated with industry trends?",
                    "What development methodologies are you familiar with?"
                  ].map((question, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-medium text-slate-700 text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2">💡 Interview Tips</h3>
                <ul className="text-indigo-800 text-sm space-y-1">
                  <li>• Research the company and role thoroughly</li>
                  <li>• Prepare specific examples from your experience</li>
                  <li>• Practice your answers out loud</li>
                  <li>• Prepare thoughtful questions for the interviewer</li>
                  <li>• Follow up with a thank-you email within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Company Info Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-5">Company Info</h3>

            <div className="space-y-4">
              {company.secteur && (
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-1.5">Industry</p>
                  <p className="font-bold text-white/80">{company.secteur}</p>
                </div>
              )}

              {company.type && (
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-1.5">Type</p>
                  <p className="font-bold text-white/80">{company.type}</p>
                </div>
              )}

              {company.pays && (
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-1.5">Location</p>
                  <p className="font-bold text-white/80">{company.pays}</p>
                </div>
              )}

              {company.activeJobs && (
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-1.5">Active Jobs</p>
                  <p className="font-bold text-emerald-400 text-lg">{company.activeJobs}</p>
                </div>
              )}

              {companyInterviews.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-1.5">Your Interviews</p>
                  <p className="font-bold text-blue-400 text-lg">{companyInterviews.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCompanyProfile;
