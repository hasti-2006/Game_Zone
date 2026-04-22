import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import { useSession } from '../context/SessionContext';

const BeverageModal = ({ beverage, onClose, onSave }) => {
  const [name, setName] = useState(beverage?.name || '');
  const [price, setPrice] = useState(beverage?.price || '');
  const [qty, setQty] = useState(beverage?.qty || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !qty) return toast.error('Fill all fields');
    setLoading(true);
    try {
      if (beverage) {
        await api.put(`/beverages/edit/${beverage._id}`, { name, price: Number(price), qty: Number(qty) });
        toast.success('Beverage updated');
      } else {
        await api.post('/beverages/add', { name, price: Number(price), qty: Number(qty) });
        toast.success('Beverage added');
      }
      onSave();
      onClose();
    } catch {
      toast.error('Failed to save beverage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-textMain">
            {beverage ? 'Edit Beverage' : 'Add Beverage'}
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
              placeholder="e.g. Coke"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="120"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="100"
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

const Beverages = () => {
  const [beverages, setBeverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBeverage, setEditBeverage] = useState(null);

  const { fetchMasterBeverages } = useSession();

  const fetchBeverages = async () => {
    try {
      const res = await api.get('/beverages/get-all-beverages');
      setBeverages(res.data.beverages);
    } catch {
      toast.error('Failed to load beverages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeverages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beverage?')) return;
    try {
      await api.delete(`/beverages/delete/${id}`);
      toast.success('Beverage deleted');
      fetchBeverages();
      fetchMasterBeverages();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Beverages">
        <button
          onClick={() => { setEditBeverage(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} /> Add Beverage
        </button>
      </Topbar>

      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <p className="text-textMuted">Loading...</p>
        ) : beverages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-textMuted">No beverages yet.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">#</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Qty</th>
                  {/* <th className="text-left px-4 py-3 font-medium text-textMuted">Status</th> */}
                  <th className="text-right px-4 py-3 font-medium text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {beverages.map((bev, i) => (
                  <tr key={bev._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 text-textMuted">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-textMain">{bev.name}</td>
                    <td className="px-4 py-3 text-accent font-medium">₹{bev.price}</td>
                    <td className="px-4 py-3 text-textMuted">{bev.qty}</td>
                     <td className="px-4 py-3">
                        <div className="flex items-center justify-end ">
                        <button
                          onClick={() => { setEditBeverage(bev); setShowModal(true); }}
                          className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(bev._id)}
                          className="p-1.5 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div> 
                    </td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BeverageModal
          beverage={editBeverage}
          onClose={() => setShowModal(false)}
          onSave={() => { fetchBeverages(); fetchMasterBeverages(); }}
        />
      )}
    </div>
  );
};

export default Beverages;
