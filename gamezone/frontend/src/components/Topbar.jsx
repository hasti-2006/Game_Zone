import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title, children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar bg-card border-b border-border flex items-center gap-3 px-4 md:px-6">
      {/* Title — left-aligned on both mobile and desktop */}
      <h2 className="flex-1 text-base md:text-xl font-semibold text-textMain truncate">
        {title}
      </h2>

      {/* Page-specific action buttons (passed as children) */}
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}

      {/* Logout — visible on mobile only (desktop uses sidebar logout) */}
      <button
        onClick={handleLogout}
        className="md:hidden flex items-center justify-center p-2 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px]"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
};

export default Topbar;
