import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';

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

// Layout wrapper for authenticated pages
const AppLayout = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    {/* On mobile the sidebar is fixed/overlay, so main takes full width.
        On md+ the sidebar is static so flex-1 naturally fills the rest. */}
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden w-full md:w-auto">
      <Outlet />
    </main>
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
