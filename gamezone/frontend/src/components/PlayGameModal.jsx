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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-textMain">Start New Session</h3>
            <p className="text-xs text-textMuted">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
      
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-textMain">Select User Type</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserType('regular')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    userType === 'regular'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-textMuted hover:border-primary/50'
                  }`}
                >
                  <User size={16} /> Regular User
                </button>
                <button
                  onClick={() => setUserType('guest')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    userType === 'guest'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-textMuted hover:border-primary/50'
                  }`}
                >
                  <Users size={16} /> Guest
                </button>
              </div>

              {userType === 'regular' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={handleCheckUser}
                      className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                    >
                      Check
                    </button>
                  </div>
                  {userFound === false && (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        New user — enter name below and click Next to register automatically.
                      </p>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>
          )}

       
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-textMain">Select System</p>
              {systems.length === 0 ? (
                <p className="text-sm text-textMuted text-center py-4">No idle systems available</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {systems.map((sys) => (
                    <button
                      key={sys._id}
                      onClick={() => setSelectedSystem(sys)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        selectedSystem?._id === sys._id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm text-textMain">{sys.name}</p>
                      <p className="text-xs text-textMuted">{sys.type}</p>
                      <p className="text-xs text-accent font-medium">₹{sys.price}/hr</p>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-textMain mb-2">Extra Remotes</p>
                <p className="text-xs text-textMuted mb-2">Flat ₹30 per remote</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRemotesCount(n)}
                      className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                        remotesCount === n
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-textMuted hover:border-primary/50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-textMain mb-2">Extra Users</p>
                <p className="text-xs text-textMuted mb-2">
                  ₹{selectedSystem ? Math.round(selectedSystem.price / 2) : '—'}/hr (half session price)
                </p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setExtraUsersCount(n)}
                      className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                        extraUsersCount === n
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-textMuted hover:border-primary/50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {step === 1 ? (
            <button onClick={onClose} className="text-sm text-textMuted hover:text-textMain">
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-textMuted hover:text-textMain"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreateSession}
              disabled={loading || !selectedSystem}
              className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayGameModal;
