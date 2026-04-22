import { useState, useEffect } from 'react';
import { X, Clock, User, Plus, Trash2, StopCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useSession } from '../context/SessionContext';

const formatDuration = (startTime) => {
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SessionDetailModal = ({ sessionId, onClose, onRefresh }) => {
  const [session, setSession] = useState(null);
  const [selectedBev, setSelectedBev] = useState('');
  const [bevQty, setBevQty] = useState(1);
  const [timer, setTimer] = useState('');

  const { masterBeverages, fetchMasterBeverages } = useSession();
  const beverages = masterBeverages;

  useEffect(() => {
    fetchDetails();
    fetchMasterBeverages();
  }, [sessionId]);

  useEffect(() => {
    if (!session?.startTime) return;
    const interval = setInterval(() => setTimer(formatDuration(session.startTime)), 1000);
    setTimer(formatDuration(session.startTime));
    return () => clearInterval(interval);
  }, [session?.startTime]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/session/details/${sessionId}`);
      setSession(res.data.session);
    } catch {
      toast.error('Failed to load session details');
    }
  };

  const handleStopRemote = async (remoteId) => {
    try {
      await api.post(`/session/stop-remote/${sessionId}/${remoteId}`);
      toast.success('Remote stopped');
      fetchDetails();
    } catch {
      toast.error('Failed to stop remote');
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

  const handleAddBeverage = async () => {
    if (!selectedBev) return toast.error('Select a beverage');
    try {
      await api.post(`/session/add-beverage/${sessionId}`, {
        beverageId: selectedBev,
        quantity: Number(bevQty),
      });
      toast.success('Beverage added');
      setSelectedBev('');
      setBevQty(1);
      fetchDetails();
    } catch {
      toast.error('Failed to add beverage');
    }
  };

  const handleAddRemote = async () => {
    try {
      await api.post(`/session/add-remotes/${sessionId}`, { count: 1 });
      toast.success('Remote added');
      fetchDetails();
      onRefresh?.();
    } catch {
      toast.error('Failed to add remote');
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-2xl p-8">
          <p className="text-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  const sys = session.systemId;
  const pricePerMin = sys?.price / 60 || 0;
  const extraPricePerMin = sys?.extraUserPrice / 60 || 0;
  const elapsedMins = (Date.now() - new Date(session.startTime).getTime()) / 60000;
  const mainEst = parseFloat((elapsedMins * pricePerMin).toFixed(2));
  const remotesEst = session.additionalRemotes
    .filter((r) => !r.endTime)
    .reduce((sum, r) => {
      const mins = (Date.now() - new Date(r.startTime).getTime()) / 60000;
      return sum + mins * extraPricePerMin;
    }, 0);
  const bevEst = session.beverages.reduce((sum, b) => {
    const bev = beverages.find((bv) => bv._id === (b.beverageId?._id || b.beverageId));
    return sum + (bev ? bev.price * b.quantity : 0);
  }, 0);
  const totalEst = parseFloat((mainEst + remotesEst + bevEst).toFixed(2));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <div>
            <h3 className="text-lg font-semibold text-textMain">Session Details</h3>
            <p className="text-xs text-textMuted">{sys?.name} — {sys?.type}</p>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* User + Timer */}
          <div className="flex items-center justify-between bg-background rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-textMain">{session.userId?.name || 'Guest'}</p>
                <p className="text-xs text-textMuted">{session.userModel}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-accent font-mono font-bold text-lg">
                <Clock size={16} />
                {timer}
              </div>
              <p className="text-xs text-textMuted">Est. ₹{totalEst}</p>
            </div>
          </div>

          {/* Additional Remotes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-textMain text-sm">Additional Remotes</h4>
              <button
                onClick={handleAddRemote}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus size={14} /> Add Remote
              </button>
            </div>
            {session.additionalRemotes.length === 0 ? (
              <p className="text-xs text-textMuted">No additional remotes</p>
            ) : (
              <div className="space-y-2">
                {session.additionalRemotes.map((remote) => (
                  <div
                    key={remote._id}
                    className="flex items-center justify-between bg-background rounded-lg px-3 py-2"
                  >
                    <div className="text-xs text-textMuted">
                      Started: {new Date(remote.startTime).toLocaleTimeString()}
                      {remote.endTime && (
                        <span className="ml-2 text-green-600">
                          Ended: {new Date(remote.endTime).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {!remote.endTime && (
                      <button
                        onClick={() => handleStopRemote(remote._id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                      >
                        <StopCircle size={14} /> Stop
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Beverages */}
          <div>
            <h4 className="font-medium text-textMain text-sm mb-2">Beverages</h4>
            {session.beverages.length === 0 ? (
              <p className="text-xs text-textMuted mb-2">No beverages added</p>
            ) : (
              <div className="space-y-2 mb-3">
                {session.beverages.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between bg-background rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-textMain">
                      {b.name} × {b.quantity}
                    </span>
                    <button
                      onClick={() => handleRemoveBeverage(b._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add beverage form */}
            <div className="flex gap-2">
              <select
                value={selectedBev}
                onChange={(e) => setSelectedBev(e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-16 border border-border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleAddBeverage}
                className="px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
