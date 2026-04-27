import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, User, Smartphone, Plus, Trash2,
  StopCircle, Coffee, Zap, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useSession } from '../context/SessionContext';

const REMOTE_FLAT_PRICE = 30; // flat ₹30 per additional remote

const formatDuration = (startTime) => {
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [selectedBev, setSelectedBev] = useState('');
  const [bevQty, setBevQty] = useState(1);
  const [timer, setTimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);

  const { masterBeverages, fetchMasterBeverages } = useSession();
  const beverages = masterBeverages;

  // Live timer — only for main session
  useEffect(() => {
    if (!session?.startTime) return;
    const tick = () => setTimer(formatDuration(session.startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.startTime]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/session/details/${sessionId}`);
      setSession(res.data.session);
    } catch {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchMasterBeverages();
  }, [sessionId]);

  // Stop session — no confirm dialog
  const handleStopSession = async () => {
    setStopping(true);
    try {
      const res = await api.post(`/session/stop/${sessionId}`);
      toast.success('Session ended');
      navigate(`/billing/${res.data.billId}`);
    } catch {
      toast.error('Failed to stop session');
      setStopping(false);
    }
  };

  // Add a remote (flat ₹30)
  const handleAddRemote = async () => {
    try {
      await api.post(`/session/add-remotes/${sessionId}`, { count: 1, type: 'remote' });
      toast.success('Remote added');
      fetchDetails();
    } catch {
      toast.error('Failed to add remote');
    }
  };

  // Add an extra user (half session price, time-based)
  const handleAddExtraUser = async () => {
    try {
      await api.post(`/session/add-remotes/${sessionId}`, { count: 1, type: 'extraUser' });
      toast.success('Extra user added');
      fetchDetails();
    } catch {
      toast.error('Failed to add extra user');
    }
  };

  const handleAddBeverage = async () => {
    if (!selectedBev) return toast.error('Select a beverage');
    try {
      await api.post(`/session/add-beverage/${sessionId}`, {
        beverageId: selectedBev,
        quantity: Number(bevQty),
      });
      toast.success('Beverage added');
      // Keep selectedBev and bevQty as-is so user can add more of the same
      fetchDetails();
    } catch {
      toast.error('Failed to add beverage');
    }
  };

  const handleRemoveBeverage = async (beverageItemId) => {
    try {
      await api.delete(`/session/remove-beverage/${sessionId}/${beverageItemId}`);
      toast.success('Beverage removed');
      fetchDetails();
    } catch {
      toast.error('Failed to remove beverage');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-textMuted text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-textMain font-medium">Session not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 text-primary text-sm hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sys = session.systemId;
  const pricePerMin = (sys?.price || 0) / 60;
  const extraUserPricePerMin = (sys?.price || 0) / 2 / 60; // half session price per min
  const elapsedMins = (Date.now() - new Date(session.startTime).getTime()) / 60000;
  const mainEst = parseFloat((elapsedMins * pricePerMin).toFixed(2));

  // Split additionalRemotes by type
  const remotes = (session.additionalRemotes || []).filter((r) => r.type !== 'extraUser');
  const extraUsers = (session.additionalRemotes || []).filter((r) => r.type === 'extraUser');

  // Remotes: flat ₹30 each
  const remotesEst = remotes.length * REMOTE_FLAT_PRICE;

  // Extra users: time-based at half session price
  const extraUsersEst = parseFloat(
    extraUsers
      .reduce((sum, u) => {
        const mins = (Date.now() - new Date(u.startTime).getTime()) / 60000;
        return sum + mins * extraUserPricePerMin;
      }, 0)
      .toFixed(2)
  );

  const bevEst = session.beverages.reduce((sum, b) => {
    const bev = beverages.find((bv) => bv._id === (b.beverageId?._id || b.beverageId));
    return sum + (bev ? bev.price * b.quantity : 0);
  }, 0);

  const totalEst = parseFloat((mainEst + remotesEst + extraUsersEst + bevEst).toFixed(2));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 py-2.5 md:px-6 md:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 md:p-2 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm md:text-lg font-semibold text-textMain leading-tight">Session Details</h2>
            <p className="text-[11px] md:text-xs text-textMuted truncate">{sys?.name} — {sys?.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <button
            onClick={fetchDetails}
            className="p-1.5 md:p-2 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleStopSession}
            disabled={stopping}
            className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2 bg-red-500 text-white text-xs md:text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 font-medium whitespace-nowrap"
          >
            <StopCircle size={14} />
            {stopping ? 'Stopping…' : 'Stop'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-3 md:space-y-5">

          {/* User + Timer hero card */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-lg font-semibold text-textMain truncate">
                    {session.userId?.name || 'Guest'}
                  </p>
                  {session.userId?.mobile && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Smartphone size={12} className="text-textMuted shrink-0" />
                      <span className="text-xs text-textMuted">{session.userId.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-textMuted shrink-0" />
                    <span className="text-[11px] text-textMuted">
                      Started {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end text-accent font-mono font-bold text-lg md:text-2xl">
                  <Clock size={16} className="md:w-5 md:h-5" />
                  {timer}
                </div>
                <p className="text-xs text-textMuted mt-0.5">
                  Est. <span className="font-semibold text-textMain">₹{totalEst}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Remotes + Extra Users row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5">

            {/* Additional Remotes — flat ₹30 each */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap size={15} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-textMain text-sm">Additional Remotes</h3>
                    <p className="text-xs text-textMuted">Flat ₹{REMOTE_FLAT_PRICE} per remote</p>
                  </div>
                  {remotes.length > 0 && (
                    <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">
                      {remotes.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAddRemote}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {remotes.length === 0 ? (
                <p className="text-xs text-textMuted text-center py-4">No additional remotes</p>
              ) : (
                <div className="space-y-2">
                  {remotes.map((remote, i) => (
                    <div
                      key={remote._id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-accent/5"
                    >
                      <div>
                        <p className="text-xs font-medium text-textMain">Remote {i + 1}</p>
                        <p className="text-xs text-textMuted">
                          Added {new Date(remote.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-xs text-accent font-semibold">₹{REMOTE_FLAT_PRICE}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extra Users — half session price, time-based */}
            <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User size={15} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-textMain text-sm">Extra Users</h3>
                    <p className="text-xs text-textMuted">
                      ₹{sys?.price ? Math.round(sys.price / 2) : '—'}/hr (half price)
                    </p>
                  </div>
                  {extraUsers.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                      {extraUsers.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAddExtraUser}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {extraUsers.length === 0 ? (
                <p className="text-xs text-textMuted text-center py-4">No extra users</p>
              ) : (
                <div className="space-y-2">
                  {extraUsers.map((u, i) => {
                    const mins = (Date.now() - new Date(u.startTime).getTime()) / 60000;
                    const est = parseFloat((mins * extraUserPricePerMin).toFixed(2));
                    return (
                      <div
                        key={u._id}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-blue-50"
                      >
                        <div>
                          <p className="text-xs font-medium text-textMain">User {i + 1}</p>
                          <p className="text-xs text-textMuted">
                            Added {new Date(u.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold">~₹{est}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Beverages */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Coffee size={15} className="text-blue-500" />
              </div>
              <h3 className="font-semibold text-textMain text-sm">Beverages</h3>
              {session.beverages.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                  {session.beverages.length}
                </span>
              )}
            </div>

            {session.beverages.length > 0 && (
              <div className="space-y-2 mb-4">
                {session.beverages.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-textMain">{b.name}</p>
                      <p className="text-xs text-textMuted">Qty: {b.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBeverage(b._id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={selectedBev}
                onChange={(e) => setSelectedBev(e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">Select beverage</option>
                {beverages.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} — ₹{b.price}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={bevQty}
                onChange={(e) => setBevQty(e.target.value)}
                className="w-14 border border-border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleAddBeverage}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Live Bill Estimate */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
            <h3 className="font-semibold text-textMain text-sm mb-3">Live Bill Estimate</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
              <div className="bg-background rounded-xl p-2.5 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-textMuted mb-1">Session</p>
                <p className="font-bold text-textMain text-xs md:text-sm">₹{mainEst.toFixed(2)}</p>
              </div>
              <div className="bg-background rounded-xl p-2.5 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-textMuted mb-1">Remotes</p>
                <p className="font-bold text-textMain text-xs md:text-sm">₹{remotesEst.toFixed(2)}</p>
              </div>
              <div className="bg-background rounded-xl p-2.5 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-textMuted mb-1">Extra Users</p>
                <p className="font-bold text-textMain text-xs md:text-sm">₹{extraUsersEst.toFixed(2)}</p>
              </div>
              <div className="bg-background rounded-xl p-2.5 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-textMuted mb-1">Beverages</p>
                <p className="font-bold text-textMain text-xs md:text-sm">₹{bevEst.toFixed(2)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-primary/5 border border-primary/20 rounded-xl p-2.5 md:p-3 text-center">
                <p className="text-[10px] md:text-xs text-primary mb-1 font-medium">Total Est.</p>
                <p className="font-bold text-primary text-base md:text-lg">₹{totalEst.toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
