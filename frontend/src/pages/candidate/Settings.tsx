import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Lock, Eye, EyeOff, Shield, Bell,
  Trash2, CheckCircle, AlertTriangle, Loader, LogOut, Moon, Sun
} from 'lucide-react';
import { useChangePasswordMutation, useDeleteAccountMutation } from '../../store/api/settingsApi';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';

const CandidateSettings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: any) => state.ui.theme);

  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  // Password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async () => {
    setPwError('');
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setPwError(e?.data?.message || 'Failed to change password.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(undefined).unwrap();
      dispatch(logout());
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/candidat');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl">

      {/* ── Header ── */}
      <div>
        <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
          <SettingsIcon className="w-3.5 h-3.5" /> Configuration
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Settings</h1>
        <p className="text-slate-400 font-medium text-base mt-1">Manage your security, preferences, and account.</p>
      </div>

      {/* ── Security: Change Password ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Change Password</h2>
            <p className="text-slate-400 text-xs font-bold">Update your account security credentials</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                placeholder="Enter current password"
              />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                placeholder="Enter new password (min 6 chars)"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all outline-none"
                placeholder="Re-enter new password"
              />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {pwError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm font-bold">{pwError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700 text-sm font-bold">Password changed successfully!</span>
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={changingPw || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {changingPw ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </div>

      {/* ── Preferences ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Preferences</h2>
            <p className="text-slate-400 text-xs font-bold">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme toggle (visual only, uses existing uiSlice) */}
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="font-black text-slate-900 text-sm">Dark Mode</p>
                <p className="text-slate-400 text-xs font-medium">Switch between light and dark themes</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>

          {/* Email notifications */}
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-black text-slate-900 text-sm">Email Notifications</p>
                <p className="text-slate-400 text-xs font-medium">Get updates on applications and interviews</p>
              </div>
            </div>
            <div className="w-12 h-7 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute top-0.5 translate-x-5 w-6 h-6 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Session ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center">
            <LogOut className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Session</h2>
            <p className="text-slate-400 text-xs font-bold">Manage your current session</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white border border-red-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-red-700 tracking-tight">Danger Zone</h2>
            <p className="text-red-400 text-xs font-bold">Irreversible actions — proceed with caution</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        ) : (
          <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-black text-sm">Are you absolutely sure?</p>
                <p className="text-red-600 text-xs font-medium mt-1">This will permanently delete your account, all applications, and all associated data. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete Forever
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSettings;