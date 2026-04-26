import React, { useState, useEffect } from "react";
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation 
} from "../../store/api/companyApi";
import { 
  useChangePasswordMutation 
} from "../../store/api/authApi";
import { 
  Building2, 
  Image as ImageIcon,
  Lock, 
  Globe, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Save,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompanySettings: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading: isFetching } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isUpdatingPassword }] = useChangePasswordMutation();

  const [companyForm, setCompanyForm] = useState({
    nom: "",
    description: "",
    pays: "",
    site_web: "",
    secteur: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: ""
  });

  useEffect(() => {
    if (data?.data) {
      setCompanyForm({
        nom: data.data.nom || "",
        description: data.data.description || "",
        pays: data.data.pays || "",
        site_web: data.data.site_web || "",
        secteur: data.data.secteur || "",
      });
      setLogoPreview(data.data.logo ? (import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads') + `/logos/${encodeURIComponent(data.data.logo)}` : "");
    }
  }, [data]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(companyForm).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (logoFile) fd.append("logo", logoFile);
      await updateProfile(fd).unwrap();
      showStatus('success', 'Business information updated successfully!');
    } catch (err) {
      showStatus('error', 'Failed to update business information.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showStatus('error', 'New passwords do not match.');
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }).unwrap();
      showStatus('success', 'Password updated successfully!');
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showStatus('error', err.data?.message || 'Failed to update password.');
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: null, message: "" }), 5000);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/company/my-profile')}
            className="p-2.5 rounded-xl hover:bg-white hover:border-slate-200 border border-transparent transition-all text-slate-500 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Settings & Privacy</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your organization profile and account security</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.type && (
        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 border ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="font-bold text-sm tracking-tight">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Business Information Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-slate-100/50 transition-all">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Organization Profile</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Public identity details</p>
              </div>
            </div>
            
            <form onSubmit={handleCompanySubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Company Picture</label>
                <div className="flex items-center gap-5 p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setLogoFile(f);
                        setLogoPreview(f ? URL.createObjectURL(f) : "");
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 font-bold mt-2">PNG/JPG up to 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Legal Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    required
                    value={companyForm.nom}
                    onChange={(e) => setCompanyForm({ ...companyForm, nom: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                    placeholder="Enter official name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Industry Sector</label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      value={companyForm.secteur}
                      onChange={(e) => setCompanyForm({ ...companyForm, secteur: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                      placeholder="e.g. Technology"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Headquarters Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      value={companyForm.pays}
                      onChange={(e) => setCompanyForm({ ...companyForm, pays: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                      placeholder="e.g. Tunis, Tunisia"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Corporate Website</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="url"
                    value={companyForm.site_web}
                    onChange={(e) => setCompanyForm({ ...companyForm, site_web: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Company Description</label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-semibold text-slate-700 resize-none"
                  placeholder="Describe your organization's mission and culture..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-70"
                >
                  {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Public Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security / Privacy Section */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 rounded-xl p-8 border border-white/5 shadow-2xl shadow-slate-200">
            <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">Account Security</h3>
                <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Update your privacy data</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 text-white font-bold transition-all text-sm"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1 text-emerald-500">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500/50 text-white font-bold transition-all text-sm"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500/50 text-white font-bold transition-all text-sm"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-xl shadow-emerald-950/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Update Security Profile
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Tip Card */}
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Privacy Note</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-bold">
              All changes to your corporate identity will be immediately reflected across the platform for candidates and partners. 
            </p>
            <div className="mt-6 flex items-center gap-3 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-tight">Security Check Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanySettings;
