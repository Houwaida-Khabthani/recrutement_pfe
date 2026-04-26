import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, FileText, BarChart, Building, Settings } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../store/slices/authSlice';
import { useGetRecruiterProfileQuery } from '../../store/api/companyApi';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

const CompanyLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: any) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: recruiterProfileResp } = useGetRecruiterProfileQuery(undefined, { skip: !user });

  const sidebarItems = [
    { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/company/jobs', icon: Briefcase, label: 'Job Offers' },
    { to: '/company/users', icon: Users, label: 'Candidates' },
    { to: '/company/platform-activity', icon: FileText, label: 'Applications' },
    { to: '/company/rapport', icon: BarChart, label: 'Rapport' },
    { to: '/company/analytics', icon: BarChart, label: 'Analytics' },
    { to: '/company/profile', icon: Building, label: 'Company' },
    { to: '/company/settings', icon: Settings, label: 'Settings' },
  ];

  const buildUploadUrl = (value?: string, folder = '') => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    const baseUrl = (import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads').replace(/\/$/, '');
    const cleanedValue = value.replace(/^\/+/, '');
    if (cleanedValue.startsWith('uploads/')) return `${baseUrl.replace(/\/uploads$/, '')}/${cleanedValue}`;
    if (cleanedValue.includes('/')) return `${baseUrl}/${cleanedValue.split('/').map(encodeURIComponent).join('/')}`;
    return folder ? `${baseUrl}/${folder}/${encodeURIComponent(cleanedValue)}` : `${baseUrl}/${encodeURIComponent(cleanedValue)}`;
  };

  const company = recruiterProfileResp?.data?.company;
  const companyName = company?.nom || user?.nom_entreprise || user?.nom || 'Recruiter';
  const logoUrl = company?.logo ? buildUploadUrl(company.logo, 'logos') : '';
  const initials = companyName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'HR';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/entreprise');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        logoText="TJI"
        logoGradientClass="from-blue-500 to-indigo-600"
        userName={companyName}
        userEmail={user?.email || ''}
        initials={initials}
        avatarUrl={logoUrl}
        logoutLabel="Sign out"
        onLogout={handleLogout}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
          title="Tunisia Job Innovate"
          subtitle="Recruiter Portal"
          profileName="Profile"
          profileAvatarUrl={logoUrl}
          onProfileClick={() => navigate('/company/my-profile')}
          showSearch={true}
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

export default CompanyLayout;
