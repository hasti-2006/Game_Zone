import { useState, useEffect } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';

const SystemModal = ({ system, onClose, onSave }) => {
  const [name, setName] = useState(system?.name || '');
  const [type, setType] = useState(system?.type || 'PS5');
  const [seq, setSeq] = useState(system?.seq || '');
  const [price, setPrice] = useState(system?.price || '');
  const [extraUserPrice, setExtraUserPrice] = useState(system?.extraUserPrice || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (system) {
        await api.put(`/systems/edit/${system._id}`, {
          name, type, seq: Number(seq), price: Number(price), extraUserPrice: Number(extraUserPrice),
        });
        toast.success('System updated');
      } else {
        await api.post('/systems/add', {
          name, type, seq: Number(seq), price: Number(price), extraUserPrice: Number(extraUserPrice),
        });
        toast.success('System added');
      }
      onSave();
      onClose();
    } catch {
      toast.error('Failed to save system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-textMain">
            {system ? 'Edit System' : 'Add System'}
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-textMain">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PS-1"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="PS5">PS5</option>
              <option value="PC">PC</option>
              <option value="Simulator">Simulator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Sequence</label>
            <input
              type="number"
              value={seq}
              onChange={(e) => setSeq(e.target.value)}
              placeholder="10"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Price per hour (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Extra User Price per hour (₹)</label>
            <input
              type="number"
              value={extraUserPrice}
              onChange={(e) => setExtraUserPrice(e.target.value)}
              placeholder="60"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm text-textMuted hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Systems = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSystem, setEditSystem] = useState(null);

  const fetchSystems = async () => {
    try {
      const res = await api.get('/systems/get-all-systems');
      setSystems(res.data.data);
    } catch {
      toast.error('Failed to load systems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Systems">
        <button
          onClick={() => { setEditSystem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 min-h-[44px]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add System</span>
        </button>
      </Topbar>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <p className="text-textMuted">Loading...</p>
        ) : systems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-textMuted">No systems yet.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Seq</th>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Price/hr</th>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Extra/hr</th>
                    <th className="text-left px-4 py-3 font-medium text-textMuted">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {systems.map((sys) => (
                    <tr key={sys._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-textMain">{sys.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {sys.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textMuted">{sys.seq}</td>
                      <td className="px-4 py-3 text-accent font-medium">₹{sys.price}</td>
                      <td className="px-4 py-3 text-textMuted">₹{sys.extraUserPrice}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            sys.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {sys.isActive ? 'Active' : 'Idle'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditSystem(sys); setShowModal(true); }}
                          className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <SystemModal
          system={editSystem}
          onClose={() => setShowModal(false)}
          onSave={fetchSystems}
        />
      )}
    </div>
  );
};

export default Systems;
