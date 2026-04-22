import { useEffect, useState } from 'react';
import { Monitor, Clock, User, Smartphone } from 'lucide-react';

const formatDuration = (startTime) => {
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SystemCard = ({ system, onPlayGame, onSessionDetails, onStopSession, onAddRemote, onAddBeverage }) => {
  const [timer, setTimer] = useState('');

  useEffect(() => {
    if (!system.isActive || !system.startTime) return;
    const interval = setInterval(() => {
      setTimer(formatDuration(system.startTime));
    }, 1000);
    setTimer(formatDuration(system.startTime));
    return () => clearInterval(interval);
  }, [system.isActive, system.startTime]);

  const borderColor = system.isActive
    ? 'border-l-4 border-l-green-500'
    : 'border-l-4 border-l-gray-300';

  return (
    <div className={`bg-card rounded-xl shadow-sm p-4 ${borderColor} flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={18} className={system.isActive ? 'text-green-500' : 'text-gray-400'} />
          <span className="font-semibold text-textMain">{system.name}</span>
          <span className="text-xs bg-gray-100 text-textMuted px-2 py-0.5 rounded-full">
            {system.type}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            system.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {system.isActive ? 'Active' : 'Idle'}
        </span>
      </div>

      {/* Active session info */}
      {system.isActive ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <User size={14} />
            <span className="font-medium text-textMain">{system.username}</span>
          </div>
          {system.mobile && (
            <div className="flex items-center gap-2 text-sm text-textMuted">
              <Smartphone size={14} />
              <span>{system.mobile}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-accent font-mono font-semibold">
            <Clock size={14} />
            <span>{timer}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-textMuted">No active session</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-1">
        {system.isActive ? (
          <>
            <button
              onClick={() => onSessionDetails(system.sessionId)}
              className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Session Details
            </button>
            <button
              onClick={() => onAddRemote(system.sessionId)}
              className="text-xs px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Add Remote
            </button>
            <button
              onClick={() => onAddBeverage(system.sessionId)}
              className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Beverage
            </button>
            <button
              onClick={() => onStopSession(system.sessionId, system.username)}
              className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Stop Session
            </button>
          </>
        ) : (
          <button
            onClick={() => onPlayGame(system)}
            className="text-xs px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            + Play Game
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemCard;
