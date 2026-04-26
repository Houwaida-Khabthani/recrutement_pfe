import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../store/api/companyApi";
import { 
  Building2, 
  Image as ImageIcon,
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Type, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";

interface CompanyForm {
  nom: string;
  description: string;
  secteur: string;
  pays: string;
  email: string;
  telephone: string;
  site_web: string;
  type: string;
}

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { data, isLoading: isFetching } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating, isSuccess, isError }] = useUpdateProfileMutation();

  const [form, setForm] = useState<CompanyForm>({
    nom: "",
    description: "",
    secteur: "",
    pays: "",
    email: "",
    telephone: "",
    site_web: "",
    type: ""
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setForm({
        nom: data.data.nom || "",
        description: data.data.description || "",
        secteur: data.data.secteur || "",
        pays: data.data.pays || "",
        email: data.data.email || "",
        telephone: data.data.telephone || "",
        site_web: data.data.site_web || "",
        type: data.data.type || ""
      });
      setLogoPreview(data.data.logo ? (import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads') + `/logos/${encodeURIComponent(data.data.logo)}` : "");
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (logoFile) fd.append("logo", logoFile);
      await updateProfile(fd).unwrap();
    } catch (err) {
      console.error("Failed to update company profile:", err);
    }
  };

  const clearSuccess = () => setShowToast(false);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-full">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Company updated successfully!</span>
            <button onClick={clearSuccess} className="text-emerald-400 hover:text-emerald-700 ml-2">×</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/company/my-profile')}
            className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setup Company</h1>
            <p className="text-slate-500 text-sm">Tell us more about your organization</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              General Information
            </h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Company Picture</label>
              <div className="flex items-center gap-5 p-5 rounded-xl border border-slate-200 bg-slate-50/20">
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

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Company Name</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Industry Sector</label>
              <div className="relative group">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  value={form.secteur}
                  onChange={(e) => setForm({ ...form, secteur: e.target.value })}
                  placeholder="e.g. Technology, Health, etc."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Company Type</label>
              <div className="relative group">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g. Startup, Corporate, etc."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Bio / Description</label>
              <textarea
                value={form.description}
                rows={4}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe your company culture, goals, and history..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 bg-slate-50/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & online Presence Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Contacts & Online Presence
            </h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Business Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. contact@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Business Phone</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="e.g. +216 71 XXX XXX"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Location / Country</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  value={form.pays}
                  onChange={(e) => setForm({ ...form, pays: e.target.value })}
                  placeholder="e.g. Tunis, Tunisia"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">Website URL</label>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="url"
                  value={form.site_web}
                  onChange={(e) => setForm({ ...form, site_web: e.target.value })}
                  placeholder="e.g. https://www.acme.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          {isError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium mr-auto">
              <AlertCircle className="w-4 h-4" />
              Failed to save changes. Please try again.
            </div>
          )}
          
          <button
            type="button"
            onClick={() => navigate('/company/my-profile')}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;