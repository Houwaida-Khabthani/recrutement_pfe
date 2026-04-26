import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Shield,
  Save,
  Loader2,
  ArrowLeft,
  Moon,
  Sun,
  Globe,
  Edit2,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeAndLanguage } from '../../hooks/useThemeAndLanguage';

interface RecentAction {
  id: number;
  type: 'approved' | 'rejected' | 'deleted';
  description: string;
  date: string;
  item: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { theme, language, t, setTheme, setLanguage } = useThemeAndLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: 'Admin User',
    email: 'admin@company.com',
    phone: '+216 50 123 456',
  });

  // Mock data
  const adminUser = {
    name: 'Admin User',
    email: 'admin@company.com',
    phone: '+216 50 123 456',
    lastLogin: t.lastLoginDate,
    avatar: 'AU',
  };

  const adminStats = [
    { label: t.companiesApproved, value: 24, icon: CheckCircle2, color: 'emerald' },
    { label: t.companiesRejected, value: 5, icon: XCircle, color: 'rose' },
    { label: t.usersDeleted, value: 3, icon: Trash2, color: 'slate' },
  ];

  const recentActions: RecentAction[] = [
    { id: 1, type: 'approved', description: t.approvedCompany, date: '2026-04-15', item: 'TechCorp Inc' },
    { id: 2, type: 'rejected', description: t.rejectedCompany, date: '2026-04-14', item: 'StartUp XYZ' },
    { id: 3, type: 'deleted', description: t.deletedUser, date: '2026-04-14', item: 'John Doe' },
    { id: 4, type: 'approved', description: t.approvedCompany, date: '2026-04-13', item: 'Digital Solutions' },
    { id: 5, type: 'approved', description: t.approvedCompany, date: '2026-04-13', item: 'Innovation Hub' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setToastMessage(t.profileUpdated);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 500);
  };

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'approved':
        return 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950';
      case 'rejected':
        return 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950';
      case 'deleted':
        return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800';
      default:
        return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
      default:
        return null;
    }
  };

  // View Mode
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 dark:text-white transition-colors">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-full">
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-sm">{toastMessage}</span>
              <button
                onClick={() => setShowToast(false)}
                className="text-emerald-400 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{t.adminProfile}</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.adminProfile}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t.manageAccount}</p>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-16 relative z-10">
                <div className="flex items-end gap-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl font-bold text-white">{adminUser.avatar}</span>
                  </div>
                  <div className="pb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{adminUser.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Mail className="w-4 h-4" />
                      {adminUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                  {t.edit}
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {t.personalInfo}
                  </h3>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.fullName}</label>
                    <div className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-slate-800 dark:text-slate-200">
                      {adminUser.name}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.status}</label>
                    <div className="px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                        <span className="font-medium text-emerald-800 dark:text-emerald-300 text-sm">{t.active}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.role}</label>
                    <div className="px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/50">
                      <span className="font-medium text-purple-800 dark:text-purple-300 text-sm">{t.administrator}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.emailAddress}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <div className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {adminUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.phoneNumber}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <div className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {adminUser.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    {t.securityAccess}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <div className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-slate-800 dark:text-slate-200 text-sm">
                        ••••••••••••
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.lastLogin}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <div className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {adminUser.lastLogin}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                  <button className="flex-1 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 text-sm">
                    {t.changePassword}
                  </button>
                  <button className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-sm">
                    {t.enable2FA}
                  </button>
                </div>
              </div>

              {/* Recent Actions Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    {t.recentActions}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {recentActions.map((action) => (
                      <div key={action.id} className={`flex items-center gap-4 p-4 rounded-lg border ${getActionColor(action.type)}`}>
                        <div className="flex-shrink-0">{getActionIcon(action.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{action.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {action.item} • {action.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Admin Statistics Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    {t.adminStats}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {adminStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    const colors: Record<string, { bg: string; text: string; label: string; border: string }> = {
                      emerald: {
                        bg: 'bg-emerald-50 dark:bg-emerald-950',
                        text: 'text-emerald-600 dark:text-emerald-400',
                        label: 'text-emerald-800 dark:text-emerald-300',
                        border: 'border-emerald-200 dark:border-emerald-800',
                      },
                      rose: {
                        bg: 'bg-rose-50 dark:bg-rose-950',
                        text: 'text-rose-600 dark:text-rose-400',
                        label: 'text-rose-800 dark:text-rose-300',
                        border: 'border-rose-200 dark:border-rose-800',
                      },
                      slate: {
                        bg: 'bg-slate-100 dark:bg-slate-800',
                        text: 'text-slate-600 dark:text-slate-400',
                        label: 'text-slate-800 dark:text-slate-300',
                        border: 'border-slate-200 dark:border-slate-700',
                      },
                    };

                    const colorClass = colors[stat.color];

                    return (
                      <div key={idx} className={`${colorClass.bg} rounded-lg p-4 border ${colorClass.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${colorClass.text}`} />
                        </div>
                        <p className={`text-xs font-bold ${colorClass.label} uppercase tracking-wide mb-1`}>{stat.label}</p>
                        <p className={`text-2xl font-black ${colorClass.label}`}>{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    {t.appSettings}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                        {theme === 'dark' ? (
                          <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t.darkMode}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? t.enabled : t.disabled}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                        showNotification(theme === 'dark' ? 'Light mode enabled' : 'Dark mode enabled');
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t.language}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.chooseLanguage}</p>
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value as 'FR' | 'EN');
                        showNotification(`Language changed to ${e.target.value}`);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all cursor-pointer text-sm"
                    >
                      <option value="EN">English</option>
                      <option value="FR">Français</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sign Out Card */}
              <button className="w-full px-6 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                {t.signOut}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 dark:text-white transition-colors">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right-full">
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-emerald-400 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t.adminProfile}</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.editProfile}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t.updateInfo}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              {t.personalInfo}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.fullName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.emailAddress}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{t.phoneNumber}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all font-medium text-slate-800 bg-slate-50/20"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-8 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
            >
              {t.cancel}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
