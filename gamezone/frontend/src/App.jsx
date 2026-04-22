import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar, { navItems } from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionDetails from './pages/SessionDetails';
import Billing from './pages/Billing';
import Beverages from './pages/Beverages';
import Systems from './pages/Systems';
import SessionHistory from './pages/SessionHistory';
import Packages from './pages/Packages';
import Bookings from './pages/Bookings';
import UsersPage from './pages/Users';

// Bottom nav items — 6 items that fit on mobile (Session History is too long, use History label)
const bottomNavItems = navItems.filter((item) =>
  ['/', '/dashboard', '/users', '/beverages', '/systems', '/bookings', '/packages'].includes(item.to)
);

// Layout wrapper for authenticated pages
const AppLayout = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    {/* Desktop sidebar — hidden on mobile via its own className */}
    <Sidebar />

    {/* Main content area */}
    <main className="app-main flex-1 flex flex-col overflow-y-auto w-full md:w-auto">
      <Outlet />
    </main>

    {/* ── Bottom nav — mobile only ── */}
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-card border-t border-border flex items-stretch" style={{ height: '60px' }}>
      {bottomNavItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? 'text-primary' : 'text-textMuted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                background: '#111827',
                color: '#fff',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#04594A', secondary: '#fff' },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/session/:sessionId" element={<SessionDetails />} />
              <Route path="/billing/:billId" element={<Billing />} />
              <Route path="/beverages" element={<Beverages />} />
              <Route path="/systems" element={<Systems />} />
              <Route path="/history" element={<SessionHistory />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
