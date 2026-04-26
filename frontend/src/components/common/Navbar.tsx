import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { UserRole } from '../../types/roles';
import { useGetNotificationsQuery } from '../../store/api/notificationApi';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

type NavbarProps = {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  title?: string;
  subtitle?: string;
  profileName?: string;
  profileAvatarUrl?: string;
  onProfileClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showThemeToggle?: boolean;
};

function Navbar({
  onMenuClick,
  showMenuButton = false,
  title = 'Dashboard',
  subtitle = '',
  profileName,
  profileAvatarUrl,
  onProfileClick,
  showSearch = true,
  showNotifications = true,
  showThemeToggle = true,
}: NavbarProps) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const { data: notifications } = useGetNotificationsQuery(undefined, {
    skip: !user || !showNotifications,
  });

  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsList.filter((n: any) => !n.lu).length || 0;

  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  function toggleTheme() {
    setDarkMode((prev) => !prev);
  }

  function handleProfileClick() {
    if (onProfileClick) {
      onProfileClick();
      return;
    }

    if (!user) return;

    if (user.role === UserRole.CANDIDAT) {
      navigate('/candidate/profile');
    } else if (user.role === UserRole.ENTREPRISE) {
      navigate('/company/profile');
    } else if (user.role === UserRole.ADMIN) {
      navigate('/admin/profile');
    }
  }

  const displayName = profileName || user?.nom || user?.email || 'User';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {showMenuButton && onMenuClick && (
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            onClick={onMenuClick}
            type="button"
          >
            <span className="sr-only">Open sidebar</span>
            ☰
          </button>
        )}
        <div>
          <h1 className="text-slate-900 font-black text-lg tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-4 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {showNotifications && (
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {showThemeToggle && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}

        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all"
        >
          {profileAvatarUrl ? (
            <img src={profileAvatarUrl} alt={displayName} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
              {displayName.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-bold text-slate-700 hidden sm:block">{displayName}</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
