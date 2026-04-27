import { useState, useEffect } from 'react';
import { X, User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PlayGameModal = ({ onClose, onSessionCreated, preSelectedSystem }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('guest');

  // Regular user state
  const [mobile, setMobile] = useState('');
  const [userFound, setUserFound] = useState(null);
  const [foundUser, setFoundUser] = useState(null);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Guest state
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState(null);

  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(preSelectedSystem || null);
  const [remotesCount, setRemotesCount] = useState(0);
  const [extraUsersCount, setExtraUsersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) fetchIdleSystems();
  }, [step]);

  const fetchIdleSystems = async () => {
    try {
      const res = await api.get('/systems/get-all-systems');
      setSystems(res.data.data.filter((s) => !s.isActive));
    } catch {
      toast.error('Failed to load systems');
    }
  };

  const handleCheckUser = async () => {
    if (!mobile) return toast.error('Enter mobile number');
    try {
      const res = await api.post('/session/check-user', { mobile: Number(mobile) });
      setUserFound(res.data.userFound);
      if (res.data.userFound) {
        setFoundUser(res.data.user);
        setRegName(res.data.user.name);
      }
    } catch {
      toast.error('Failed to check user');
    }
  };

  const handleNext = async () => {
    if (userType === 'guest') {
      if (!guestName.trim()) return toast.error('Enter guest name');
      if (!guestId) {
        try {
          const res = await api.post('/session/create-guest', { name: guestName });
          setGuestId(res.data.guestGamer._id);
        } catch {
          return toast.error('Failed to create guest');
        }
      }
    } else {
      if (!mobile) return toast.error('Enter mobile number');
      if (!regName.trim() && !foundUser) return toast.error('Enter user name');
      try {
        const res = await api.post('/session/check-user', {
          mobile: Number(mobile),
          name: regName.trim() || undefined,
        });
        if (res.data.userFound) {
          setFoundUser(res.data.user);
          setRegName(res.data.user.name);
          setUserFound(true);
        } else {
          return toast.error('Could not resolve user');
        }
      } catch {
        return toast.error('Failed to resolve user');
      }
    }
    setStep(2);
  };

  const handleCreateSession = async () => {
    if (!selectedSystem) return toast.error('Select a system');
    setLoading(true);
    try {
      let userId, userModel;
      if (userType === 'guest') {
        userId = guestId;
        userModel = 'Guest';
      } else {
        userId = foundUser._id;
        userModel = 'User';
      }

      await api.post('/session/create', {
        userId,
        userModel,
        systemId: selectedSystem._id,
        additionalRemotesCount: remotesCount,
        extraUsersCount,
      });

      toast.success('Session started!');
      onSessionCreated();
      onClose();
    } catch {
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-black/50">

      {/* Tap-outside to close — sits behind the sheet */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative bg-card w-full rounded-t-2xl sm:rounded-2xl sm:max-w-lg shadow-2xl flex flex-col"
        /* On mobile: sits above the 60px bottom nav, max 70% of viewport height */
        style={{ maxHeight: 'calc(100dvh - 60px - env(safe-area-inset-bottom, 0px))', marginBottom: 60 }}
      >
        {/* Drag handle pill — mobile only */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-textMain">Start New Session</h3>
            <p className="text-xs text-textMuted">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              {/* User type toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUserType('regular')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                    userType === 'regular'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-textMuted'
                  }`}
                >
                  <User size={15} /> Regular
                </button>
                <button
                  onClick={() => setUserType('guest')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                    userType === 'guest'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-textMuted'
                  }`}
                >
                  <Users size={15} /> Guest
                </button>
              </div>

              {userType === 'regular' && (
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    />
                    <button
                      onClick={handleCheckUser}
                      className="px-4 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary/90 font-medium"
                    >
                      Check
                    </button>
                  </div>
                  {userFound === false && (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        New user — enter name and click Next to register.
                      </p>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      />
                    </div>
                  )}
                  {userFound === true && (
                    <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      ✓ User found: <strong>{foundUser?.name}</strong>
                    </p>
                  )}
                </div>
              )}

              {userType === 'guest' && (
                <input
                  type="text"
                  placeholder="Guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              )}
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              {/* System grid */}
              <div>
                <p className="text-xs font-semibold text-textMuted mb-2">Select System</p>
                {systems.length === 0 ? (
                  <p className="text-sm text-textMuted text-center py-4">No idle systems available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {systems.map((sys) => (
                      <button
                        key={sys._id}
                        onClick={() => setSelectedSystem(sys)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedSystem?._id === sys._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background'
                        }`}
                      >
                        <p className="font-semibold text-sm text-textMain truncate">{sys.name}</p>
                        <p className="text-xs text-textMuted">{sys.type}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">₹{sys.price}/hr</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Remotes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-textMuted">Extra Remotes</p>
                  <span className="text-xs text-textMuted">₹30 each</span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRemotesCount(n)}
                      className={`flex-1 h-10 rounded-xl border-2 text-sm font-bold transition-colors ${
                        remotesCount === n
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-textMuted bg-background'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Users */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-textMuted">Extra Users</p>
                  <span className="text-xs text-textMuted">
                    ₹{selectedSystem ? Math.round(selectedSystem.price / 2) : '—'}/hr
                  </span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setExtraUsersCount(n)}
                      className={`flex-1 h-10 rounded-xl border-2 text-sm font-bold transition-colors ${
                        extraUsersCount === n
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-textMuted bg-background'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
          {step === 1 ? (
            <button onClick={onClose} className="text-sm text-textMuted hover:text-textMain px-1">
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-textMuted hover:text-textMain px-1"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary/90 font-medium"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreateSession}
              disabled={loading || !selectedSystem}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {loading ? 'Starting…' : 'Start Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayGameModal;
