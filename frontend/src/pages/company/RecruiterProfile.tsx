import { useAppSelector } from '../../hooks/useAppSelector';
import { useNavigate } from 'react-router-dom';
import { 
  useGetRecruiterProfileQuery 
} from '../../store/api/companyApi';
import { 
  User, 
  Shield, 
  Building, 
  Briefcase, 
  FileText, 
  Eye, 
  Settings, 
  Edit, 
  Lock, 
  ChevronRight,
  Globe,
  MapPin,
  Tag
} from 'lucide-react';

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  // Use RTK Query for automatic cache management and auto-refresh
  const { data: response, isLoading, isError, refetch } = useGetRecruiterProfileQuery();
  
  const profileData = response?.data;
  const company = profileData?.company;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Synchronizing recruiter data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-bold">Failed to load profile data</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

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

  const companyName = company?.nom || user?.nom_entreprise || user?.nom || 'N/A';
  const initials = companyName?.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'HR';
  const logoUrl = company?.logo ? buildUploadUrl(company.logo, 'logos') : '';

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[4px] mb-2">Recruiter Profile</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight truncate">{companyName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-slate-400 text-xs font-bold uppercase tracking-tight">
              {company?.secteur && <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-blue-500" />{company.secteur}</span>}
              {company?.pays && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" />{company.pays}</span>}
              {company?.site_web && (
                <a className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors" href={company.site_web} target="_blank" rel="noreferrer">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate max-w-[260px]">{company.site_web}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={() => navigate('/company/settings')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-slate-900 leading-tight">
                {profileData?.stats?.activeJobs || 0}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Jobs</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-slate-900 leading-tight">
                {profileData?.stats?.totalApplications || 0}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Applications</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-slate-900 leading-tight">
                {profileData?.stats?.totalViews || 0}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Views</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                Organization Details
              </h3>
              <button 
                onClick={() => navigate('/company/profile')}
                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Edit Profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8">
              {!company || company?.is_fallback ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Building className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">No organization data found</p>
                    <p className="text-slate-500 text-sm max-w-xs">Please complete your business profile to start managing your organization.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/company/profile')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all"
                  >
                    Setup Profile Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Name</label>
                    <p className="text-slate-900 font-bold text-lg">{company.nom}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Industry Sector</label>
                    <p className="text-slate-700 font-semibold flex items-center gap-2">
                       <Tag className="w-3.5 h-3.5 text-blue-400" />
                       {company.secteur || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organization Type</label>
                    <p className="text-slate-700 font-semibold">{company.type || 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Headquarters Location</label>
                    <p className="text-slate-700 font-semibold flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 text-blue-400" />
                       {company.pays || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Email</label>
                    <p className="text-slate-700 font-semibold truncate hover:text-blue-600 transition-colors">
                       {company.email || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Website</label>
                    <a 
                      href={company.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold flex items-center gap-1 hover:underline truncate"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {company.site_web || 'Link not set'}
                    </a>
                  </div>
                  
                  {company.description && (
                    <div className="md:col-span-2 space-y-1 pt-6 border-t border-slate-50">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">About the Company</label>
                      <p className="text-slate-600 text-sm leading-relaxed mt-1">
                        {company.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                Account Manager
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <p className="text-slate-900 font-bold">{user?.nom || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Email</label>
                <p className="text-slate-600 font-medium break-all">{user?.email || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User Role</label>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                    <Shield className="w-3 h-3" />
                    {user?.role === 'ENTREPRISE' ? 'RECRUITER' : user?.role || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button 
                  onClick={() => navigate('/company/settings')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all group/btn"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <Edit className="w-4 h-4 text-blue-600" />
                    Edit Private Info
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => navigate('/company/settings')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all group/btn"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Security Settings
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
