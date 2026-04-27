import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Coffee, Monitor, Wallet, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Topbar from '../components/Topbar';

const Billing = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [userWallet, setUserWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Billing form state
  const [discount, setDiscount] = useState(0);
  const [adjustFinalPrice, setAdjustFinalPrice] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      const res = await api.get(`/session/bill/${billId}`);
      setBill(res.data.bill);
      setUserWallet(res.data.userWallet);
    } catch {
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-textMuted">Loading bill...</p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-textMuted">Bill not found</p>
      </div>
    );
  }

  // Billing calculations
  const mainSessionAmt = bill.totals?.mainSession || 0;
  const remotesAmt = bill.totals?.additionalRemotes || 0;
  const beveragesAmt = bill.totals?.beverages || 0;
  const discountableAmount = mainSessionAmt + remotesAmt;
  const discountAmount = parseFloat((discountableAmount * (discount / 100)).toFixed(2));
  const afterDiscount = parseFloat((discountableAmount - discountAmount + beveragesAmt).toFixed(2));
  const finalPrice = adjustFinalPrice !== '' ? parseFloat(adjustFinalPrice) : afterDiscount;

  const handleCheckout = async () => {
    if (paymentMethod === 'wallet') {
      if (!userWallet) return toast.error('No wallet found for this user');
      if (userWallet.remainingBalance < finalPrice) {
        return toast.error('Insufficient wallet balance');
      }
    }

    setCheckoutLoading(true);
    try {
      await api.post(`/session/checkout/${billId}`, {
        discount: Number(discount),
        finalPrice,
        remarks,
        checkoutOption: paymentMethod,
      });
      toast.success('Checkout successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatMins = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    const s = Math.round((mins % 1) * 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Billing">
        <span className="text-sm text-textMuted">
          {bill.userId?.name || 'Guest'} — {bill.systemId?.name}
        </span>
      </Topbar>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Bill breakdown */}
          <div className="space-y-4">
            {/* Main Session */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Monitor size={18} className="text-primary" />
                <h3 className="font-semibold text-textMain">Main Session</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-textMuted">
                  <span>Start</span>
                  <span>{new Date(bill.mainSession?.startTime).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-textMuted">
                  <span>End</span>
                  <span>{new Date(bill.mainSession?.endTime).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-textMuted">
                  <span>Duration</span>
                  <span>{formatMins(bill.mainSession?.totalMintues)}</span>
                </div>
                <div className="flex justify-between font-semibold text-textMain border-t border-border pt-2 mt-2">
                  <span>Amount</span>
                  <span className="text-accent">₹{bill.mainSession?.calculatedAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Remotes (flat ₹30) */}
            {(() => {
              // A remote is: type === 'remote', OR type is missing but amount is exactly ₹30 (old bills before type was saved)
              const remotes = bill.additionalRemotes?.filter(
                (r) => r.type === 'remote' || (!r.type && r.calculatedAmount === 30)
              ) || [];
              // An extra user is: type === 'extraUser', OR type is missing but amount is NOT ₹30 (old bills)
              const extraUsers = bill.additionalRemotes?.filter(
                (r) => r.type === 'extraUser' || (!r.type && r.calculatedAmount !== 30)
              ) || [];

              return (
                <>
                  {remotes.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={18} className="text-primary" />
                        <h3 className="font-semibold text-textMain">Additional Remotes</h3>
                        <span className="text-xs text-textMuted">(₹30 each)</span>
                      </div>
                      <div className="space-y-2">
                        {remotes.map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-textMuted">Remote {i + 1}</span>
                            <span className="font-medium text-textMain">₹{r.calculatedAmount?.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold text-textMain border-t border-border pt-2 mt-1">
                          <span>Remotes Total</span>
                          <span className="text-accent">
                            ₹{remotes.reduce((s, r) => s + (r.calculatedAmount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {extraUsers.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={18} className="text-blue-500" />
                        <h3 className="font-semibold text-textMain">Extra Users</h3>
                        <span className="text-xs text-textMuted">(half session price/hr)</span>
                      </div>
                      <div className="space-y-2">
                        {extraUsers.map((r, i) => (
                          <div key={i} className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between text-textMuted">
                              <span>User {i + 1}</span>
                              <span>{formatMins(r.totalMintues)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-textMain">
                              <span></span>
                              <span>₹{r.calculatedAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold text-textMain border-t border-border pt-2 mt-1">
                          <span>Extra Users Total</span>
                          <span className="text-accent">
                            ₹{extraUsers.reduce((s, r) => s + (r.calculatedAmount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Beverages */}
            {bill.beverages?.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee size={18} className="text-primary" />
                  <h3 className="font-semibold text-textMain">Beverages</h3>
                </div>
                <div className="space-y-2">
                  {bill.beverages.map((b, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-textMuted">
                        {b.name} × {b.quantity}
                      </span>
                      <span className="font-medium text-textMain">₹{b.totalAmount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-textMain border-t border-border pt-2 mt-1">
                    <span>Beverages Total</span>
                    <span className="text-accent">₹{beveragesAmt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Customize Bill */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-textMain mb-4">Customize Bill</h3>
              <div className="space-y-4">
                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => {
                      setDiscount(Number(e.target.value));
                      setAdjustFinalPrice('');
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-textMuted mt-1">
                    Applied to session + remotes only (not beverages)
                  </p>
                </div>

                {/* Adjust Final Price */}
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Adjust Final Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustFinalPrice}
                    onChange={(e) => setAdjustFinalPrice(e.target.value)}
                    placeholder={afterDiscount.toString()}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional note..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-textMain mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'cash', label: 'Cash', icon: Banknote },
                      { id: 'upi', label: 'UPI', icon: CreditCard },
                      ...(userWallet ? [{ id: 'wallet', label: 'Wallet', icon: Wallet }] : []),
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition-colors ${
                          paymentMethod === id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-textMuted hover:border-primary/50'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'wallet' && userWallet && (
                    <p className="text-xs text-textMuted mt-2">
                      Wallet balance: ₹{userWallet.remainingBalance}
                      {userWallet.remainingBalance < finalPrice && (
                        <span className="text-red-500 ml-2">Insufficient balance</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-textMain mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-textMuted">
                  <span>Session + Remotes</span>
                  <span>₹{discountableAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-textMuted">
                  <span>Beverages</span>
                  <span>₹{beveragesAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-textMain text-base border-t border-border pt-2 mt-1">
                  <span>Final Price</span>
                  <span className="text-primary">₹{finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={
                  checkoutLoading ||
                  (paymentMethod === 'wallet' &&
                    userWallet &&
                    userWallet.remainingBalance < finalPrice)
                }
                className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
