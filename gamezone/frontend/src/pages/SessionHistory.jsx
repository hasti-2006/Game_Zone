import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, X, TrendingUp, Coffee, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';

const DetailModal = ({ session, onClose }) => {
  if (!session) return null;
  const b = session.billDetails;
  const mins = b?.mainSession?.totalMintues || 0;
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const duration = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <h3 className="font-semibold text-textMain">Session Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 md:px-6 py-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">User</p>
              <p className="font-medium text-textMain">{session.user?.name}</p>
              {session.user?.mobile && (
                <p className="text-xs text-textMuted">{session.user.mobile}</p>
              )}
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">System</p>
              <p className="font-medium text-textMain">{session.system?.name}</p>
              <p className="text-xs text-textMuted">{session.system?.type}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">Duration</p>
              <p className="font-medium text-textMain">{duration}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">Payment</p>
              <p className="font-medium text-textMain capitalize">{b?.checkoutOption}</p>
            </div>
          </div>

          {b?.remarks && (
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">Remarks</p>
              <p className="text-textMain">{b.remarks}</p>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <p className="text-xs uppercase tracking-wide text-textMuted font-medium mb-2">
              Bill Breakdown
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-textMuted">Main Session</span>
                <span className="font-medium">₹{b?.totals?.mainSession?.toFixed(2)}</span>
              </div>
              {(b?.totals?.additionalRemotes || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-textMuted">Remotes</span>
                  <span className="font-medium">₹{b?.totals?.additionalRemotes?.toFixed(2)}</span>
                </div>
              )}
              {(b?.totals?.beverages || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-textMuted">Beverages</span>
                  <span className="font-medium">₹{b?.totals?.beverages?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-textMain border-t border-border pt-1.5 mt-1">
                <span>Final Price</span>
                <span className="text-primary">₹{b?.finalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {b?.beverages?.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs uppercase tracking-wide text-textMuted font-medium mb-2">
                Beverages
              </p>
              {b.beverages.map((bev, i) => (
                <div key={i} className="flex justify-between text-textMuted">
                  <span>{bev.name} × {bev.quantity}</span>
                  <span>₹{bev.totalAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Mobile session card (replaces table row on small screens) ── */
const SessionCard = ({ s, onView }) => {
  const mins = s.billDetails?.mainSession?.totalMintues || 0;
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const duration = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-textMain truncate">{s.user?.name}</p>
          {s.user?.mobile && (
            <p className="text-xs text-textMuted">{s.user.mobile}</p>
          )}
        </div>
        <button
          onClick={() => onView(s)}
          className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-textMain">{s.system?.name}</span>
        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
          {s.system?.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-textMuted pt-1 border-t border-border">
        <div className="flex items-center gap-3">
          <span>
            {s.startTime
              ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
          <span className="text-textMuted/50">·</span>
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary text-sm">
            ₹{s.billDetails?.finalPrice?.toFixed(2)}
          </span>
          <span className="capitalize bg-primary/10 text-accent-dark px-2 py-0.5 rounded-full">
            {s.billDetails?.checkoutOption}
          </span>
        </div>
      </div>
    </div>
  );
};

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/history/all-history?${params.toString()}`);
      setSessions(res.data.data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.billDetails?.finalPrice || 0), 0);
  const withoutBev = sessions.reduce(
    (sum, s) =>
      sum +
      (s.billDetails?.totals?.mainSession || 0) +
      (s.billDetails?.totals?.additionalRemotes || 0),
    0
  );

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Session History">
        <span className="hidden sm:inline text-xs text-textMuted bg-background px-3 py-1.5 rounded-lg border border-border whitespace-nowrap">
          {today}
        </span>
      </Topbar>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">

        {/* Stats — 1 col on mobile, 3 on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-textMuted">Today's Revenue</p>
              <p className="text-xl font-bold text-primary">₹{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Coffee size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-textMuted">Without Beverages</p>
              <p className="text-xl font-bold text-accent">₹{withoutBev.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Hash size={18} className="text-accent-dark" />
            </div>
            <div>
              <p className="text-xs text-textMuted">Sessions Today</p>
              <p className="text-xl font-bold text-textMain">{sessions.length}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4 w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <p className="font-medium text-textMain">No sessions today</p>
            <p className="text-sm text-textMuted mt-1">
              {search ? 'No results match your search' : 'Sessions will appear here once completed'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {sessions.map((s) => (
                <SessionCard key={s._id} s={s} onView={setSelectedSession} />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">User</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">System</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Duration</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Final</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Payment</th>
                      <th className="text-right px-4 py-3 font-medium text-textMuted">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sessions.map((s) => {
                      const mins = s.billDetails?.mainSession?.totalMintues || 0;
                      const h = Math.floor(mins / 60);
                      const m = Math.floor(mins % 60);
                      const duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
                      return (
                        <tr key={s._id} className="hover:bg-background/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-textMain">{s.user?.name}</p>
                            {s.user?.mobile && (
                              <p className="text-xs text-textMuted">{s.user.mobile}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-textMuted">
                            <p>{s.system?.name}</p>
                            <p className="text-xs">{s.system?.type}</p>
                          </td>
                          <td className="px-4 py-3 text-textMuted text-xs">
                            {s.startTime
                              ? new Date(s.startTime).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-textMuted">{duration}</td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            ₹{s.billDetails?.finalPrice?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs capitalize bg-primary/10 text-accent-dark px-2 py-0.5 rounded-full whitespace-nowrap">
                              {s.billDetails?.checkoutOption}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedSession(s)}
                              className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedSession && (
        <DetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
};

export default SessionHistory;
