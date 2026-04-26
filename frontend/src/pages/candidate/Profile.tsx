import { useState, useRef } from 'react';
import {
  useGetCandidateProfileQuery,
  useUpdateCandidateProfileMutation,
  useGetCandidateStatsQuery,
} from '../../store/api/candidateApi';
import {
  User, Mail, Phone, MapPin, Globe,
  Pencil, Save, X, Upload, FileText, Award, Briefcase,
  GraduationCap, CheckCircle, Camera, Eye, ExternalLink,
  Loader
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

type FormState = {
  nom: string;
  telephone: string;
  specialite: string;
  experience: string;
  bio: string;
  niveau_etude: string;
  github: string;
  linkedin: string;
  portfolio: string;
  adresse: string;
  pays: string;
};

const TABS = [
  { id: 'about',    label: 'About',      icon: User },
  { id: 'career',   label: 'Career',     icon: Briefcase },
  { id: 'docs',     label: 'Documents',  icon: FileText },
  { id: 'links',    label: 'Links',      icon: Globe },
];

const CandidateProfile = () => {
  const { data, isLoading, error, refetch } = useGetCandidateProfileQuery(undefined);
  const { data: stats } = useGetCandidateStatsQuery(undefined);
  const [updateProfile, { isLoading: saving }] = useUpdateCandidateProfileMutation();

  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    nom: '', telephone: '', specialite: '', experience: '',
    bio: '', niveau_etude: '', github: '', linkedin: '', portfolio: '', adresse: '', pays: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const uploadUrl = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads';

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[600px] text-slate-400 font-bold">
      Error loading profile. Please refresh.
    </div>
  );

  const handleEdit = () => {
    setForm({
      nom: data.nom || '',
      telephone: data.telephone || '',
      specialite: data.specialite || '',
      experience: data.experience || '',
      bio: data.bio || '',
      niveau_etude: data.niveau_etude || '',
      github: data.github || '',
      linkedin: data.linkedin || '',
      portfolio: data.portfolio || '',
      adresse: data.adresse || '',
      pays: data.pays || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setCvFile(null);
  };

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    if (cvFile) formData.append('cv', cvFile);
    if (avatarFile) formData.append('avatar', avatarFile);
    await updateProfile(formData).unwrap();
    setIsEditing(false);
    setAvatarPreview(null);
    refetch();
  };

  // Profile completion
  const fields = [data.nom, data.telephone, data.specialite, data.bio, data.niveau_etude, data.cv, data.linkedin, data.github];
  const filled = fields.filter(Boolean).length;
  const completion = Math.round((filled / fields.length) * 100);

  const initials = data.nom?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'C';
  const avatarSrc = avatarPreview || (data.avatar ? `${uploadUrl}/images/${data.avatar}` : null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">

      {/* ── Hero Card ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[40px] overflow-hidden shadow-2xl">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-[28px] overflow-hidden border-4 border-white/10 shadow-2xl">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-3xl">
                    {initials}
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4 text-slate-900" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter mb-1">{data.nom}</h1>
                  <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-3">
                    {data.specialite || 'Professional Candidate'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-white/40 font-bold text-xs uppercase tracking-tight">
                    {data.adresse && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-white/30" />{data.adresse}</span>}
                    {data.pays && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-white/30" />{data.pays}</span>}
                    {data.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-white/30" />{data.email}</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-900/50 disabled:opacity-60"
                      >
                        {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile completion bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Profile Completion</span>
                  <span className="text-white font-black text-sm">{completion}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: stats?.total ?? 0, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Interviews', value: stats?.entretien ?? 0, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Offers', value: stats?.accepte ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Rejected', value: stats?.refuse ?? 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map((s) => (
          <div key={s.label} className={`bg-white border ${s.border} rounded-3xl p-6 shadow-sm text-center`}>
            <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs + Content ── */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 px-8 pt-6 gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap mb-px ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', name: 'nom', type: 'text', icon: User },
                    { label: 'Phone', name: 'telephone', type: 'text', icon: Phone },
                    { label: 'Address', name: 'adresse', type: 'text', icon: MapPin },
                    { label: 'Country', name: 'pays', type: 'text', icon: Globe },
                  ].map(({ label, name, type, icon: Icon }) => (
                    <div key={name}>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type={type}
                          name={name}
                          value={(form as any)[name]}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none resize-none"
                      placeholder="Tell employers about yourself..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-3">Biography</h4>
                    <p className="text-slate-600 leading-relaxed font-medium text-sm p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                      "{data.bio || 'No biography added yet. Click Edit Profile to add one.'}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Phone', value: data.telephone, icon: Phone },
                      { label: 'Location', value: data.adresse, icon: MapPin },
                      { label: 'Country', value: data.pays, icon: Globe },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[3px] mb-2 flex items-center gap-1">
                          <Icon className="w-3 h-3" />{label}
                        </p>
                        <p className="font-bold text-slate-700 text-sm">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CAREER TAB */}
          {activeTab === 'career' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Specialty / Job Title', name: 'specialite', icon: Briefcase },
                    { label: 'Years of Experience', name: 'experience', icon: Award },
                    { label: 'Education Level', name: 'niveau_etude', icon: GraduationCap },
                  ].map(({ label, name, icon: Icon }) => (
                    <div key={name}>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          name={name}
                          value={(form as any)[name]}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: 'Specialty', value: data.specialite, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Experience', value: data.experience, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Education', value: data.niveau_etude, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] mb-1">{label}</p>
                      <p className="font-black text-slate-900 text-lg">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'docs' && (
            <div className="space-y-5">
              {/* CV */}
              <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">Curriculum Vitae (CV)</p>
                    <p className="text-slate-400 text-[11px] font-bold">
                      {data.cv ? `${data.cv}` : 'No CV uploaded yet'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {data.cv && (
                    <a
                      href={`${uploadUrl}/cvs/${data.cv}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> View CV
                    </a>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => cvInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-indigo-700 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> {data.cv ? 'Replace' : 'Upload'}
                    </button>
                  )}
                  <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              {cvFile && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700 text-sm font-bold">New CV selected: {cvFile.name}</span>
                </div>
              )}
              {!isEditing && !data.cv && (
                <div className="py-10 text-center text-slate-300 font-bold italic">
                  Click "Edit Profile" to upload your CV.
                </div>
              )}
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === 'links' && (
            <div className="space-y-5">
              {isEditing ? (
                <div className="space-y-4">
                  {[
                    { label: 'LinkedIn Profile URL', name: 'linkedin', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/yourname' },
                    { label: 'GitHub Profile URL', name: 'github', icon: FaGithub, placeholder: 'https://github.com/yourname' },
                    { label: 'Portfolio / Website', name: 'portfolio', icon: Globe, placeholder: 'https://yourportfolio.com' },
                  ].map(({ label, name, icon: Icon, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          name={name}
                          value={(form as any)[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: 'LinkedIn', value: data.linkedin, icon: FaLinkedin, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { label: 'GitHub', value: data.github, icon: FaGithub, color: 'text-slate-700 bg-slate-100 border-slate-200' },
                    { label: 'Portfolio', value: data.portfolio, icon: Globe, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`p-5 rounded-3xl border ${color} flex items-center gap-4`}>
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[3px] mb-1 opacity-60">{label}</p>
                        {value ? (
                          <a href={value} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-xs truncate hover:underline">
                            {value} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="font-bold text-xs opacity-40">Not added</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;