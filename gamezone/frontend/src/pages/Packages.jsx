import { useState, useEffect } from 'react';
import { Plus, X, ChevronRight, ChevronLeft, Package, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';

// Input with no spinners (type="text" with numeric validation)
const NumericInput = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={value}
    onChange={(e) => {
      const v = e.target.value.replace(/[^0-9]/g, '');
      onChange(v);
    }}
    placeholder={placeholder}
    className={`w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
  />
);

const AssignModal = ({ packages, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [user, setUser] = useState(null);
  const [userFound, setUserFound] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleCheckUser = async () => {
    if (!mobile) return toast.error('Enter mobile number');
    try {
      // Pass name so backend auto-creates if not found
      const res = await api.post('/packages/check-user', {
        mobile: Number(mobile),
        name: name.trim() || undefined,
      });
      setUserFound(res.data.userFound);
      if (res.data.userFound) {
        setUser(res.data.data);
        setName(res.data.data.name);
      }
    } catch {
      toast.error('Failed to check user');
    }
  };

  const handleNext = () => {
    if (!name.trim()) return toast.error('Enter user name');
    if (!mobile) return toast.error('Enter mobile number');
    if (userFound === null) return toast.error('Click Verify first');
    setStep(2);
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return toast.error('Select a package');
    setLoading(true);
    try {
      await api.post('/packages/purchase', {
        userId: user?._id || undefined,
        name: name.trim(),
        mobile: Number(mobile),
        packageId: selectedPkg._id,
        checkoutOption: paymentMethod,
      });
      toast.success('Package assigned!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-textMain">Assign Package</h3>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all ${
                    step >= s ? 'bg-primary w-8' : 'bg-gray-200 w-4'
                  }`}
                />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-textMuted hover:text-textMain hover:bg-background rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-textMain">User Details</p>

              <div>
                <label className="block text-xs text-textMuted mb-1.5">User Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setUserFound(null); }}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs text-textMuted mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <NumericInput
                    value={mobile}
                    onChange={(v) => { setMobile(v); setUserFound(null); }}
                    placeholder="10-digit mobile"
                  />
                  <button
                    onClick={handleCheckUser}
                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 whitespace-nowrap"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {userFound === true && user && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-green-700 font-medium text-sm">✓ {user.name}</p>
                  {user.walletId && (
                    <p className="text-green-600 text-xs mt-0.5">
                      Wallet balance: ₹{user.walletId.remainingBalance}
                    </p>
                  )}
                </div>
              )}

              {userFound === false && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-blue-700 text-sm font-medium">New user</p>
                  <p className="text-blue-600 text-xs mt-0.5">
                    Account will be created automatically when package is assigned.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-textMain">Select Package</p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {packages.map((pkg) => (
                  <button
                    key={pkg._id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                      selectedPkg?._id === pkg._id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-textMain capitalize">{pkg.name}</p>
                        <p className="text-xs text-textMuted mt-0.5">
                          Wallet: ₹{pkg.walletAmount} · Points: {pkg.extraPoints}
                        </p>
                      </div>
                      <p className="text-accent font-bold text-lg">₹{pkg.price}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-textMain mb-2">Payment Method</p>
                <div className="flex gap-2">
                  {['cash', 'upi', 'wallet'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-colors ${
                        paymentMethod === m
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-textMuted hover:border-primary/40'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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
              disabled={!name || !mobile || userFound === null}
              className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={loading || !selectedPkg}
              className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {loading ? 'Assigning...' : 'Assign Package'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Handles both Add (no editPkg) and Edit (editPkg provided)
const PackageFormModal = ({ onClose, onSave, editPkg = null }) => {
  const [name, setName] = useState(editPkg?.name || '');
  const [price, setPrice] = useState(editPkg?.price?.toString() || '');
  const [walletAmount, setWalletAmount] = useState(editPkg?.walletAmount?.toString() || '');
  const [extraPoints, setExtraPoints] = useState(editPkg?.extraPoints?.toString() || '');
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(editPkg);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !walletAmount) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/packages/edit/${editPkg._id}`, {
          name,
          price: Number(price),
          walletAmount: Number(walletAmount),
          extraPoints: Number(extraPoints) || 0,
        });
        toast.success('Package updated');
      } else {
        await api.post('/packages/add', {
          name,
          price: Number(price),
          walletAmount: Number(walletAmount),
          extraPoints: Number(extraPoints) || 0,
        });
        toast.success('Package created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} package`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-textMain">
            {isEdit ? 'Edit Package' : 'Add Package'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-textMuted hover:text-textMain hover:bg-background rounded-lg">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Package Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silver, Gold, Platinum"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Price (₹)</label>
            <NumericInput value={price} onChange={setPrice} placeholder="999" />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Wallet Amount (₹)</label>
            <NumericInput value={walletAmount} onChange={setWalletAmount} placeholder="1050" />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-1.5">Extra Points</label>
            <NumericInput value={extraPoints} onChange={setExtraPoints} placeholder="51" />
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
              {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Package' : 'Save Package')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editPkg, setEditPkg] = useState(null); // null = add mode, object = edit mode

  const fetchData = async () => {
    try {
      const [pkgRes, purchaseRes] = await Promise.all([
        api.get('/packages/get-all-packages'),
        api.get('/packages/purchased-users'),
      ]);
      setPackages(pkgRes.data.packages ?? []);
      setPurchases(purchaseRes.data.data ?? []);
    } catch (err) {
      console.error('[Packages] fetch error:', err);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditPkg(null);
    setShowPackageModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditPkg(pkg);
    setShowPackageModal(true);
  };

  const handleClosePackageModal = () => {
    setShowPackageModal(false);
    setEditPkg(null);
  };

  const tierColors = ['bg-gray-100', 'bg-yellow-50', 'bg-blue-50', 'bg-purple-50'];
  const tierBorders = ['border-gray-200', 'border-yellow-200', 'border-blue-200', 'border-purple-200'];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Packages">
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 border border-border text-textMain text-sm rounded-lg hover:bg-background transition-colors"
        >
          <Plus size={16} /> Add Package
        </button>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-medium"
        >
          Assign to User
        </button>
      </Topbar>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Package Tiers */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {packages.map((pkg, i) => (
              <div
                key={pkg._id}
                className={`rounded-2xl border p-5 ${tierColors[i % tierColors.length]} ${tierBorders[i % tierBorders.length]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center">
                      <Package size={16} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-textMain capitalize text-base">{pkg.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-xl">₹{pkg.price}</span>
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 text-textMuted hover:text-primary hover:bg-white/60 rounded-lg transition-colors"
                      title="Edit package"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-textMuted">Wallet Credit</span>
                    <span className="font-semibold text-textMain">₹{pkg.walletAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Bonus Points</span>
                    <span className="font-semibold text-textMain">{pkg.extraPoints}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-black/5">
                    <span className="text-textMuted text-xs">Value</span>
                    <span className="text-xs font-medium text-green-600">
                      +₹{pkg.walletAmount - pkg.price} extra
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchases Table */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-textMain">Purchase History</h3>
          <span className="text-xs text-textMuted">{purchases.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-textMuted text-sm">No packages assigned yet</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">User</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Package</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Total Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Remaining</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-textMain">{p.userId?.name}</p>
                      <p className="text-xs text-textMuted">{p.userId?.mobile}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {p.packageId?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-textMuted">
                      ₹{p.userId?.walletId?.totalBalance || 0}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      ₹{p.userId?.walletId?.remainingBalance || 0}
                    </td>
                    <td className="px-4 py-3 text-textMuted text-xs">
                      {new Date(p.purchasedAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {p.checkoutOption}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAssignModal && (
        <AssignModal
          packages={packages}
          onClose={() => setShowAssignModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showPackageModal && (
        <PackageFormModal
          editPkg={editPkg}
          onClose={handleClosePackageModal}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

export default Packages;
