import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../store/slices/authSlice';
import { UserRole } from '../../types/roles';
import { ChevronRight, LayoutDashboard, Users, Building2, FileText, BarChart3, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SidebarItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  color?: string;
};

type SidebarProps = {
  items?: SidebarItem[];
  logoText?: string;
  logoGradientClass?: string;
  userName?: string;
  userEmail?: string;
  initials?: string;
  avatarUrl?: string;
  open?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  logoutLabel?: string;
};

const defaultAdminItems: SidebarItem[] = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'text-violet-400' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs', color: 'text-amber-400' },
  { to: '/admin/companies', icon: Building2, label: 'Entreprises', color: 'text-emerald-400' },
  { to: '/admin/pending-companies', icon: Building2, label: 'Entreprises en attente', color: 'text-amber-400' },
  { to: '/admin/applications', icon: FileText, label: 'Candidatures', color: 'text-sky-400' },
  { to: '/admin/statistics', icon: BarChart3, label: 'Statistiques', color: 'text-pink-400' },
];

const Sidebar: React.FC<SidebarProps> = ({
  items,
  logoText = 'TJI',
  logoGradientClass = 'from-indigo-600 to-indigo-800',
  userName,
  userEmail,
  initials,
  avatarUrl,
  open = true,
  onClose,
  onLogout,
  logoutLabel = 'Sign out',
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    dispatch(logout());
    if (user?.role === UserRole.CANDIDAT) {
      navigate('/login/candidat');
    } else if (user?.role === UserRole.ENTREPRISE) {
      navigate('/login/entreprise');
    } else {
      navigate('/login');
    }
  };

  const resolvedUserName = userName || user?.nom || user?.nom_entreprise || user?.email || 'User';
  const resolvedEmail = userEmail || user?.email || '';
  const resolvedInitials = initials ||
    resolvedUserName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const menuItems = items && items.length ? items : user?.role === UserRole.ADMIN ? defaultAdminItems : [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${logoGradientClass}`}>
            <span className="text-white font-black">{logoText.slice(0, 2)}</span>
          </div>
          <span className="text-white font-black text-lg tracking-tight">{logoText}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white transition-colors" type="button">
            ×
          </button>
        )}
      </div>

      <div className="mx-4 mt-5 mb-3 p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={resolvedUserName} className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {resolvedInitials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{resolvedUserName}</p>
            <p className="text-white/40 text-[11px] font-medium truncate">{resolvedEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="text-white/20 text-[9px] font-black uppercase tracking-[3px] px-3 mb-3">Navigation</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              onClose?.();
            }}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color || 'text-white' : 'text-white/30 group-hover:text-white/60'} transition-colors`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          {logoutLabel}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
