import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Coffee,
  Monitor,
  CalendarDays,
  History,
  Package,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Users', icon: Users, to: '/users' },
  { label: 'Beverages', icon: Coffee, to: '/beverages' },
  { label: 'Systems', icon: Monitor, to: '/systems' },
  { label: 'Bookings', icon: CalendarDays, to: '/bookings' },
  { label: 'Session History', icon: History, to: '/history' },
  { label: 'Packages', icon: Package, to: '/packages' },
];

// navItems also exported so AppLayout can reuse them for the bottom nav
export { navItems };

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // hidden on mobile — bottom nav handles navigation there
    <aside className="hidden md:sticky md:flex md:top-0 md:self-start md:flex-col md:shrink-0 w-64 h-screen bg-primary">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-light-aqua/15">
        <h1 className="text-light-aqua text-2xl font-bold tracking-tight">GameZone</h1>
        <p className="text-light-aqua/50 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-accent/20 text-light-aqua border-l-2 border-accent'
                  : 'text-light-aqua/70 hover:bg-accent/15 hover:text-light-aqua'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-4 py-4 border-t border-light-aqua/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-light-aqua text-sm font-medium truncate">Admin</p>
            <p className="text-light-aqua/50 text-xs">admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-light-aqua/70 hover:text-light-aqua text-sm w-full px-2 py-1.5 rounded hover:bg-accent/15 transition-colors min-h-[44px]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
