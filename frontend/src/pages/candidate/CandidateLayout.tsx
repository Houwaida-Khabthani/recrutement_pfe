import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, User, Mic, Globe, Settings } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import { useGetCandidateProfileQuery } from '../../store/api/candidateApi';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

const sidebarItems = [
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
  { to: '/candidate/profile', icon: User, label: 'My Profile', color: 'text-violet-400' },
  { to: '/candidate/jobs', icon: Briefcase, label: 'Browse Jobs', color: 'text-emerald-400' },
  { to: '/candidate/applications', icon: FileText, label: 'My Applications', color: 'text-amber-400' },
  { to: '/candidate/mock-interviews', icon: Mic, label: 'Mock Interviews', color: 'text-pink-400' },
  { to: '/candidate/visa', icon: Globe, label: 'Visa', color: 'text-indigo-400' },
  { to: '/candidate/settings', icon: Settings, label: 'Settings', color: 'text-slate-400' },
];

const CandidateLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector((state: any) => state.auth.user);
  const { data: profileData } = useGetCandidateProfileQuery(undefined, { skip: !user });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/candidat');
  };

  const initials = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'C';

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

  const avatarValue = profileData?.avatar || user?.avatar || '';
  const avatarUrl = buildUploadUrl(avatarValue, 'images');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        logoText="TJI"
        logoGradientClass="from-indigo-500 to-violet-600"
        userName={user?.nom || 'Candidate'}
        userEmail={user?.email || ''}
        initials={initials}
        avatarUrl={avatarUrl}
        logoutLabel="Sign out"
        onLogout={handleLogout}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
          title="Tunisia Job Innovate"
          subtitle="Candidate Portal"
          profileName={user?.nom?.split(' ')[0] || 'Profile'}
          profileAvatarUrl={avatarUrl}
          onProfileClick={() => navigate('/candidate/profile')}
          showSearch={false}
        />

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CandidateLayout;
