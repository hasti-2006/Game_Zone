import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, RefreshCw, Monitor, Clock, User, Smartphone,
  Gamepad2, Bell, CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import PlayGameModal from '../components/PlayGameModal';

const formatDuration = (startTime) => {
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Live timer hook
const useTimer = (startTime, active) => {
  const [timer, setTimer] = useState('');
  useEffect(() => {
    if (!active || !startTime) return;
    const tick = () => setTimer(formatDuration(startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, startTime]);
  return timer;
};

// Active system card
const ActiveCard = ({ system, onNavigate, isBookedToday }) => {
  const timer = useTimer(system.startTime, system.isActive);

  return (
    <div
      onClick={() => onNavigate(system.sessionId)}
      className="bg-card rounded-2xl border-l-4 border-l-green-500 border border-border shadow-sm p-4 md:p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Monitor size={18} className="text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-textMain text-sm truncate">{system.name}</p>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
              {system.type}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            Active
          </span>
          {isBookedToday && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              Booked
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <User size={13} className="text-textMuted shrink-0" />
          <span className="text-sm font-medium text-textMain truncate">{system.username}</span>
        </div>
        {system.mobile && (
          <div className="flex items-center gap-2">
            <Smartphone size={13} className="text-textMuted shrink-0" />
            <span className="text-sm text-textMuted">{system.mobile}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-accent font-mono font-bold text-base">
          <Clock size={14} />
          {timer}
        </div>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          View Details →
        </span>
      </div>
    </div>
  );
};

// Idle system card
const IdleCard = ({ system, onPlayGame, isBookedToday }) => (
  <div
    onClick={() => onPlayGame(system)}
    className="bg-card rounded-2xl border-l-4 border-l-gray-200 border border-border shadow-sm p-4 md:p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-l-primary transition-all group"
  >
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          <Monitor size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-textMain text-sm truncate">{system.name}</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
            {system.type}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        {isBookedToday ? (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            Booked
          </span>
        ) : (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            Available
          </span>
        )}
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-border">
      <p className="text-xs text-textMuted">₹{system.price}/hr</p>
      <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus size={12} /> Start Session
      </div>
    </div>
  </div>
);

// Bell icon with dropdown — receives today's bookings list as prop
const BookingsBell = ({ bookings }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Today's bookings"
      >
        <Bell size={18} />
        {bookings.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {bookings.length > 9 ? '9+' : bookings.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: full-width panel fixed below topbar */}
          <div className="md:hidden fixed left-0 right-0 top-14 z-50 mx-3 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <CalendarDays size={15} className="text-accent" />
              <p className="text-sm font-semibold text-textMain">Today's Bookings</p>
              <span className="ml-auto text-xs text-textMuted">{bookings.length} total</span>
            </div>
            {bookings.length === 0 ? (
              <p className="text-xs text-textMuted text-center py-6">No bookings today</p>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto divide-y divide-border">
                {bookings.map((b) => (
                  <li key={b._id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="text-sm font-medium text-textMain truncate">{b.systemId?.name || '—'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                        b.status === 'active' ? 'bg-green-100 text-green-700'
                        : b.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted">{b.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-textMuted mt-0.5">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop: normal dropdown */}
          <div className="hidden md:block absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <CalendarDays size={15} className="text-accent" />
              <p className="text-sm font-semibold text-textMain">Today's Bookings</p>
              <span className="ml-auto text-xs text-textMuted">{bookings.length} total</span>
            </div>
            {bookings.length === 0 ? (
              <p className="text-xs text-textMuted text-center py-6">No bookings today</p>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-border">
                {bookings.map((b) => (
                  <li key={b._id} className="px-4 py-3 hover:bg-background transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-medium text-textMain">{b.systemId?.name || '—'}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                        b.status === 'active' ? 'bg-green-100 text-green-700'
                        : b.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted">{b.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-textMuted mt-0.5">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [preSelectedSystem, setPreSelectedSystem] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [todayBookings, setTodayBookings] = useState([]); // full list, not just count
  const navigate = useNavigate();

  const fetchSystems = useCallback(async () => {
    try {
      const res = await api.get('/systems/get-all-systems');
      setSystems(res.data.data);
    } catch {
      toast.error('Failed to load systems');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/get-all-bookings');
      const today = new Date().toDateString();
      const list = (res.data.bookings || []).filter(
        (b) => new Date(b.startTime).toDateString() === today
      );
      setTodayBookings(list);
    } catch {
      // non-critical — silently ignore
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchSystems();
    fetchBookings();
  }, [fetchSystems, fetchBookings]);

  // Single fetch on mount — no polling, empty deps
  useEffect(() => {
    fetchSystems();
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSystems = systems.filter((s) => s.isActive);
  const idleSystems = systems.filter((s) => !s.isActive);

  const TABS = ['All', 'PS5', 'PC', 'Simulator'];
  const filteredSystems = filterType === 'All'
    ? systems
    : systems.filter((s) => s.type === filterType);

  // Build a Set of systemIds that have an active (non-cancelled) booking today for O(1) lookup
  const bookedSystemIds = new Set(
    todayBookings
      .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
      .map((b) => b.systemId?._id?.toString())
      .filter(Boolean)
  );

  const handlePlayGame = (system = null) => {
    setPreSelectedSystem(system);
    setShowPlayModal(true);
  };

  const handleNavigateToSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Dashboard">
        <div className="hidden sm:flex items-center gap-2">
          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
            {activeSystems.length} Active
          </span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
            {idleSystems.length} Idle
          </span>
        </div>

        {/* Bookings bell — always visible, badge shows count */}
        <BookingsBell bookings={todayBookings} />

        <button
          onClick={handleRefresh}
          className="p-2 text-textMuted hover:text-textMain hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => handlePlayGame()}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Play Game</span>
        </button>
      </Topbar>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-textMuted text-sm">Loading systems...</p>
            </div>
          </div>
        ) : systems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-textMain">No systems found</p>
              <p className="text-sm text-textMuted mt-1">Add gaming systems to get started</p>
            </div>
            <a
              href="/systems"
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
            >
              Add Systems
            </a>
          </div>
        ) : (
          <div>
            {/* Filter tabs — horizontally scrollable on mobile */}
            <div className="overflow-x-auto pb-1 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex items-center gap-1 bg-background rounded-xl p-1 w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                      filterType === tab
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-textMuted hover:text-textMain'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {activeSystems.length > 0 && (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium text-textMain">
                    {activeSystems.length} Active Session{activeSystems.length !== 1 ? 's' : ''}
                  </p>
                  <span className="text-textMuted text-xs">·</span>
                </>
              )}
              <p className="text-sm text-textMuted">
                {idleSystems.length} system{idleSystems.length !== 1 ? 's' : ''} idle
              </p>
            </div>

            {filteredSystems.length === 0 ? (
              <p className="text-sm text-textMuted py-8 text-center">
                No {filterType} systems found
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSystems.map((system) => {
                  const isBookedToday = bookedSystemIds.has(system._id?.toString());
                  return system.isActive ? (
                    <ActiveCard
                      key={system._id}
                      system={system}
                      onNavigate={handleNavigateToSession}
                      isBookedToday={isBookedToday}
                    />
                  ) : (
                    <IdleCard
                      key={system._id}
                      system={system}
                      onPlayGame={handlePlayGame}
                      isBookedToday={isBookedToday}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showPlayModal && (
        <PlayGameModal
          onClose={() => {
            setShowPlayModal(false);
            setPreSelectedSystem(null);
          }}
          onSessionCreated={fetchSystems}
          preSelectedSystem={preSelectedSystem}
        />
      )}
    </div>
  );
};

export default Dashboard;
