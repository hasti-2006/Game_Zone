import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, Wallet, Eye, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';

// Session detail modal for user history
const SessionDetailModal = ({ session, onClose }) => {
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
            className="text-textMuted hover:text-textMain p-1 rounded-lg hover:bg-background min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 md:px-6 py-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
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
              <p className="font-medium text-textMain capitalize">{b?.checkoutOption || '—'}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">Final Price</p>
              <p className="font-bold text-primary text-base">₹{b?.finalPrice?.toFixed(2)}</p>
            </div>
          </div>

          {b?.remarks && (
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-textMuted mb-0.5">Remarks</p>
              <p className="text-textMain">{b.remarks}</p>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <p className="font-medium text-textMain mb-2 text-xs uppercase tracking-wide text-textMuted">
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
                <span>Final</span>
                <span className="text-primary">₹{b?.finalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {b?.beverages?.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs uppercase tracking-wide text-textMuted font-medium mb-2">Beverages</p>
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

// User history panel
const UserHistoryPanel = ({ userId, user: userProp, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/users/${userId}/history`);
        setData(res.data);
      } catch {
        toast.error('Failed to load user history');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-textMuted text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, data: sessions } = data;
  const totalSpent = sessions.reduce((sum, s) => sum + (s.billDetails?.finalPrice || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-header — sticky */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h3 className="font-semibold text-textMain truncate">{user.name}</h3>
          <p className="text-xs text-textMuted">{user.mobile} · Full Session History</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Active session banner */}
        {userProp?.isActive && userProp?.activeSession && (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Currently Playing</p>
              <p className="text-xs text-green-700 mt-0.5">
                {userProp.activeSession.systemName} ({userProp.activeSession.systemType}) · Started{' '}
                {new Date(userProp.activeSession.startTime).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="bg-card rounded-xl border border-border p-3 md:p-4">
            <p className="text-xs text-textMuted mb-1">Sessions</p>
            <p className="text-xl md:text-2xl font-bold text-textMain">{sessions.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 md:p-4">
            <p className="text-xs text-textMuted mb-1">Spent</p>
            <p className="text-xl md:text-2xl font-bold text-primary">₹{totalSpent.toFixed(0)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 md:p-4">
            <p className="text-xs text-textMuted mb-1">Wallet</p>
            <p className="text-xl md:text-2xl font-bold text-accent">
              ₹{user.wallet?.remainingBalance || 0}
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-accent-dark" />
            </div>
            <p className="text-textMuted">No sessions found for this user</p>
          </div>
        ) : (
          <>
            {/* Mobile: session cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {sessions.map((s) => {
                const mins = s.billDetails?.mainSession?.totalMintues || 0;
                const h = Math.floor(mins / 60);
                const m = Math.floor(mins % 60);
                const dur = h > 0 ? `${h}h ${m}m` : `${m}m`;
                return (
                  <div key={s._id} className="bg-card rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-textMain">{s.system?.name}</p>
                        <p className="text-xs text-textMuted">{s.system?.type}</p>
                      </div>
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-textMuted pt-1 border-t border-border">
                      <span>
                        {s.startTime
                          ? new Date(s.startTime).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{dur}</span>
                        <span className="font-semibold text-primary text-sm">
                          ₹{s.billDetails?.finalPrice?.toFixed(2)}
                        </span>
                        <span className="capitalize bg-primary/10 text-accent-dark px-1.5 py-0.5 rounded-full">
                          {s.billDetails?.checkoutOption || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">System</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Duration</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Amount</th>
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
                          <td className="px-4 py-3 text-textMuted">
                            {s.startTime
                              ? new Date(s.startTime).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-textMain">{s.system?.name}</p>
                            <p className="text-xs text-textMuted">{s.system?.type}</p>
                          </td>
                          <td className="px-4 py-3 text-textMuted">{duration}</td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            ₹{s.billDetails?.finalPrice?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs capitalize bg-primary/10 text-accent-dark px-2 py-0.5 rounded-full whitespace-nowrap">
                              {s.billDetails?.checkoutOption || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedSession(s)}
                              className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center justify-center"
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
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

/* ── Mobile user card ── */
const UserCard = ({ user, index, onView }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${user.isActive ? 'bg-green-100' : 'bg-primary/10'}`}>
          <span className={`font-semibold text-sm ${user.isActive ? 'text-green-700' : 'text-primary'}`}>
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-textMain truncate">{user.name}</p>
          <p className="text-xs text-textMuted">{user.mobile}</p>
        </div>
      </div>
      <button
        onClick={() => onView(user._id)}
        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
      >
        <Eye size={16} />
      </button>
    </div>

    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      {user.isActive ? (
        <div>
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Playing
          </span>
          {user.activeSession && (
            <p className="text-xs text-textMuted mt-0.5">
              {user.activeSession.systemName}
            </p>
          )}
        </div>
      ) : (
        <span className="text-xs bg-primary/10 text-accent-dark px-2 py-0.5 rounded-full font-medium">
          Inactive
        </span>
      )}

      {user.walletId ? (
        <div className="flex items-center gap-1.5">
          <Wallet size={13} className="text-accent" />
          <span className="font-medium text-accent text-sm">₹{user.walletId.remainingBalance}</span>
        </div>
      ) : (
        <span className="text-xs text-textMuted">No wallet</span>
      )}
    </div>
  </div>
);

// Main Users page
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get('/users/get-all-users');
      setUsers(res.data?.data ?? []);
    } catch (err) {
      console.error('[Users] fetch error:', err);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (selectedUserId) {
    return (
      <UserHistoryPanel
        userId={selectedUserId}
        user={users.find((u) => u._id === selectedUserId)}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Users">
        <span className="text-sm text-textMuted">
          {users.length} users
          {activeCount > 0 && (
            <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {activeCount} active
            </span>
          )}
        </span>
      </Topbar>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-accent-dark" />
            </div>
            <p className="font-medium text-textMain">No users yet</p>
            <p className="text-sm text-textMuted mt-1">Users are created when sessions are started</p>
          </div>
        ) : (
          <>
            {/* Mobile: user cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {users.map((user, i) => (
                <UserCard key={user._id} user={user} index={i} onView={setSelectedUserId} />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">#</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Mobile</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-textMuted">Wallet</th>
                      <th className="text-right px-4 py-3 font-medium text-textMuted">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user, i) => (
                      <tr key={user._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-3 text-textMuted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.isActive ? 'bg-green-100' : 'bg-primary/10'}`}>
                              <span className={`font-semibold text-xs ${user.isActive ? 'text-green-700' : 'text-primary'}`}>
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-textMain">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-textMuted">{user.mobile}</td>
                        <td className="px-4 py-3">
                          {user.isActive ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Playing
                              </span>
                              {user.activeSession && (
                                <p className="text-xs text-textMuted mt-0.5">
                                  {user.activeSession.systemName} · {new Date(user.activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs bg-primary/10 text-accent-dark px-2 py-0.5 rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.walletId ? (
                            <div className="flex items-center gap-1.5">
                              <Wallet size={13} className="text-accent" />
                              <span className="font-medium text-accent">
                                ₹{user.walletId.remainingBalance}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-textMuted">No wallet</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedUserId(user._id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors ml-auto font-medium"
                          >
                            <Eye size={13} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
