import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileText, BarChart3, Briefcase } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

const sidebarItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'text-violet-400' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs', color: 'text-amber-400' },
  { to: '/admin/pending-companies', icon: Building2, label: 'Entreprises en attente', color: 'text-emerald-400' },
  { to: '/admin/applications', icon: FileText, label: 'Candidatures', color: 'text-amber-400' },
  { to: '/admin/statistics', icon: BarChart3, label: 'Statistiques', color: 'text-pink-400' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector((state: any) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.nom
    ? user.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        logoText="TJI Admin"
        logoGradientClass="from-red-500 to-rose-600"
        userName={user?.nom || 'Admin'}
        userEmail={user?.email || ''}
        initials={initials}
        logoutLabel="Sign out"
        onLogout={handleLogout}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
          title="Tunisia Job Innovate"
          subtitle="Admin Dashboard"
          profileName={user?.nom?.split(' ')[0] || 'Admin'}
          onProfileClick={() => navigate('/admin/settings')}
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

export default AdminLayout;
