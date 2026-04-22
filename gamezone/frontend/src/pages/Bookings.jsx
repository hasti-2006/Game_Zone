import { useState, useEffect } from 'react';
import { Plus, X, Play, XCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Topbar from '../components/Topbar';

const BookingModal = ({ onClose, onSave }) => {
  const [systems, setSystems] = useState([]);
  const [systemId, setSystemId] = useState('');
  const [userName, setUserName] = useState('');
  const [mobile, setMobile] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/systems/get-all-systems').then((res) => setSystems(res.data.data));
  }, []);

  const computeEndTime = () => {
    if (!date || !startTime) return null;
    const start = new Date(`${date}T${startTime}`);
    return new Date(start.getTime() + duration * 60 * 60 * 1000).toISOString();
  };

  const handleCheckAvailability = async () => {
    if (!systemId || !date || !startTime) return toast.error('Select system, date and time');
    const endTime = computeEndTime();
    const startISO = new Date(`${date}T${startTime}`).toISOString();
    try {
      const res = await api.post('/bookings/check-availability', {
        systemId,
        startTime: startISO,
        endTime,
      });
      setAvailability(res.data.available);
    } catch {
      toast.error('Failed to check availability');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return toast.error('Enter user name');
    if (!mobile.trim()) return toast.error('Enter mobile number');
    if (!systemId) return toast.error('Select a system');
    if (availability === false) return toast.error('Slot already booked');
    if (!date || !startTime) return toast.error('Set date and time');

    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endTime = computeEndTime();

    setLoading(true);
    try {
      await api.post('/bookings/create', {
        name: userName.trim(),
        mobile: Number(mobile),
        systemId,
        startTime: startISO,
        endTime,
      });
      toast.success('Booking confirmed!');
      onSave();
      onClose();
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <h3 className="font-semibold text-textMain">New Booking</h3>
          <button onClick={onClose} className="p-1.5 text-textMuted hover:text-textMain hover:bg-background rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Mobile Number</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">System</label>
            <select
              value={systemId}
              onChange={(e) => { setSystemId(e.target.value); setAvailability(null); }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select system</option>
              {systems.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date + Time — stacked on mobile, side by side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setAvailability(null); }}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setAvailability(null); }}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Duration (hours)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDuration(h)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors min-h-[44px] ${
                    duration === h
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-textMuted hover:border-primary/50'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckAvailability}
            className="w-full py-2.5 border border-primary text-primary text-sm rounded-lg hover:bg-primary/5 font-medium transition-colors min-h-[44px]"
          >
            Check Slot Availability
          </button>

          {availability !== null && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                availability
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <span>{availability ? '✓' : '✗'}</span>
              <span>{availability ? 'Slot is available — ready to book' : 'Slot already booked'}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm text-textMuted hover:bg-background transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availability === false}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Mobile booking card (replaces table row on small screens) ── */
const BookingCard = ({ b, isActive, onStart, onCancel, statusColors }) => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-medium text-textMain truncate">{b.userId?.name}</p>
        <p className="text-xs text-textMuted">{b.userId?.mobile}</p>
      </div>
      {!isActive && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
            statusColors[b.status] || 'bg-gray-100 text-gray-500'
          }`}
        >
          {b.status}
        </span>
      )}
    </div>

    <div className="flex items-center gap-4 text-xs text-textMuted">
      <span className="font-medium text-textMain">{b.systemId?.name}</span>
      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
        {b.systemId?.type}
      </span>
    </div>

    <div className="flex items-center gap-3 text-xs text-textMuted">
      <span>
        {new Date(b.startTime).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })}
      </span>
      {b.endTime && (
        <>
          <span>→</span>
          <span>
            {new Date(b.endTime).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </>
      )}
    </div>

    {isActive && (
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onStart(b._id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors min-h-[44px] font-medium"
        >
          <Play size={13} /> Start Session
        </button>
        <button
          onClick={() => onCancel(b._id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors min-h-[44px] font-medium"
        >
          <XCircle size={13} /> Cancel
        </button>
      </div>
    )}
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/get-all-bookings');
      setBookings(res.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStartSession = async (bookingId) => {
    try {
      await api.post(`/bookings/start-session/${bookingId}`);
      toast.success('Session started!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to start session');
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.put(`/bookings/cancel/${bookingId}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-gray-100 text-gray-500',
  };

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const pastBookings = bookings.filter((b) => b.status !== 'active');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Bookings">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-medium min-h-[44px]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Booking</span>
        </button>
      </Topbar>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} className="text-gray-400" />
            </div>
            <p className="font-medium text-textMain">No bookings yet</p>
            <p className="text-sm text-textMuted mt-1">Create a booking to reserve a system</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Active Bookings ── */}
            {activeBookings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-textMain mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active Bookings ({activeBookings.length})
                </h3>

                {/* Mobile: cards */}
                <div className="flex flex-col gap-3 md:hidden">
                  {activeBookings.map((b) => (
                    <BookingCard
                      key={b._id}
                      b={b}
                      isActive
                      onStart={handleStartSession}
                      onCancel={handleCancel}
                      statusColors={statusColors}
                    />
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead className="bg-background border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">User</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">System</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">Start</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">End</th>
                          <th className="text-right px-4 py-3 font-medium text-textMuted">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activeBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-background/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-textMain">{b.userId?.name}</p>
                              <p className="text-xs text-textMuted">{b.userId?.mobile}</p>
                            </td>
                            <td className="px-4 py-3 text-textMuted">
                              <p>{b.systemId?.name}</p>
                              <p className="text-xs">{b.systemId?.type}</p>
                            </td>
                            <td className="px-4 py-3 text-textMuted text-xs">
                              {new Date(b.startTime).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3 text-textMuted text-xs">
                              {new Date(b.endTime).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleStartSession(b._id)}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors min-h-[36px]"
                                >
                                  <Play size={12} /> Start
                                </button>
                                <button
                                  onClick={() => handleCancel(b._id)}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors min-h-[36px]"
                                >
                                  <XCircle size={12} /> Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Past Bookings ── */}
            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-textMuted mb-3">
                  Past Bookings ({pastBookings.length})
                </h3>

                {/* Mobile: cards */}
                <div className="flex flex-col gap-3 md:hidden">
                  {pastBookings.map((b) => (
                    <BookingCard
                      key={b._id}
                      b={b}
                      isActive={false}
                      onStart={handleStartSession}
                      onCancel={handleCancel}
                      statusColors={statusColors}
                    />
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead className="bg-background border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">User</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">System</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">Start</th>
                          <th className="text-left px-4 py-3 font-medium text-textMuted">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pastBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-background/50 transition-colors opacity-70">
                            <td className="px-4 py-3">
                              <p className="font-medium text-textMain">{b.userId?.name}</p>
                              <p className="text-xs text-textMuted">{b.userId?.mobile}</p>
                            </td>
                            <td className="px-4 py-3 text-textMuted">{b.systemId?.name}</td>
                            <td className="px-4 py-3 text-textMuted text-xs">
                              {new Date(b.startTime).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${
                                  statusColors[b.status] || 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal onClose={() => setShowModal(false)} onSave={fetchBookings} />
      )}
    </div>
  );
};

export default Bookings;
