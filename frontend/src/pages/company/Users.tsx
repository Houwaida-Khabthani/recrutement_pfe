import { useState } from 'react';
import { useGetCompanyApplicationsQuery } from '../../store/api/applicationApi';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  X,
  Search,
  Filter,
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const CompanyUsers = () => {
  const { data: applications = [], isLoading } = useGetCompanyApplicationsQuery({});
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
  
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-tighter">Syncing talent pool...</p>
      </div>
    );
  }

  const filteredCandidates = applications.filter((app: any) => 
    app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProfile(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-8 pt-4">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Candidates Library</h1>
             <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase text-center">SYCED</span>
          </div>
          <p className="text-slate-500 font-medium text-lg italic">"Your organic talent pool, refined and indexed."</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search candidates by name or role..." 
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all w-96 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-4 bg-white border border-slate-200 text-slate-600 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm">
             <Filter className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <Users className="w-16 h-16 text-slate-100 mb-6" />
             <p className="text-slate-400 text-xl font-black italic">No candidates matching your sync criteria.</p>
          </div>
        ) : (
          filteredCandidates.map((candidate: any, index: number) => (
            <div key={index} className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden flex flex-col group hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
              
              {/* Card Meta & Avatar */}
              <div className="p-8 pb-0">
                 <div className="flex items-center justify-between mb-8">
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4" />
                       {candidate.statut}
                    </div>
                    <button className="text-slate-200 hover:text-slate-900 transition-colors">
                       <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="flex items-center gap-6 mb-8">
                    {getField(candidate, 'candidate_avatar', 'avatar') ? (
                      <img
                        src={buildUploadUrl(getField(candidate, 'candidate_avatar', 'avatar'), 'images')}
                        alt={candidate.candidate_name}
                        className="w-20 h-20 object-cover rounded-[28px] group-hover:scale-110 transition-transform shadow-lg shadow-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                        {candidate.candidate_name?.[0]}
                      </div>
                    )}
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{candidate.candidate_name}</h3>
                       <p className="text-indigo-600 font-black text-[11px] uppercase tracking-[2px]">{candidate.candidate_specialty || candidate.job_title}</p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-tight">
                       <MapPin className="w-4 h-4 text-blue-500" />
                       {candidate.candidate_location || 'Tunisia'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-tight">
                       <Briefcase className="w-4 h-4 text-emerald-500" />
                       {candidate.candidate_experience || '---'} Experience
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-tight">
                       <GraduationCap className="w-4 h-4 text-indigo-500" />
                       {candidate.candidate_education || 'Graduate'}
                    </div>
                 </div>

                 <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Matching Confidence</p>
                        <p className="text-lg font-black text-slate-900">{candidate.matching_score || 70}%</p>
                    </div>
                    <div className="w-16 h-1.5 bg-white border border-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${candidate.matching_score || 70}%` }}></div>
                    </div>
                 </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto p-2 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                 <button 
                   onClick={() => openProfile(candidate)}
                   className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-[24px] text-[10px] uppercase tracking-[3px] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                 >
                    VIEW FULL PROFILE
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PRE-IMPLEMENTED SHARED MODAL --- */}
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

export default CompanyUsers;
