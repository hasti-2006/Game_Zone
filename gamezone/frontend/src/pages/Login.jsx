import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Eye, EyeOff, Zap, Shield, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent-dark opacity-20" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-accent opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-dark opacity-40" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Gamepad2 size={22} className="text-white" />
          </div>
          <span className="text-light-aqua text-xl font-bold tracking-tight">GameZone</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage your<br />
              <span className="text-light-aqua">gaming cafe</span><br />
              with ease.
            </h1>
            <p className="text-light-aqua/70 mt-4 text-base leading-relaxed">
              Real-time session tracking, automated billing, and complete control — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Zap, label: 'Live session timers & billing' },
              { icon: BarChart3, label: 'Daily revenue & history' },
              { icon: Shield, label: 'Secure JWT authentication' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-accent" />
                </div>
                <span className="text-light-aqua/80 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-light-aqua/40 text-xs">
          © {new Date().getFullYear()} GameZone Admin Panel
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 sm:p-10">

        {/* Mobile logo — only visible below lg */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-textMain">GameZone</h1>
          <p className="text-textMuted text-sm mt-0.5">Admin Panel</p>
        </div>

        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-textMain">Welcome back</h2>
            <p className="text-textMuted text-sm mt-1">Sign in to your admin account</p>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors placeholder:text-textHint"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-11 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors placeholder:text-textHint"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="text-center text-xs text-textMuted mt-6">
            @gamezone
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
