const Bill = require('../models/Bill');
const User = require('../models/User');
const GuestUser = require('../models/GuestUser');

// GET /api/history/sessions — returns only today's paid sessions
const getSessions = async (req, res) => {
  try {
    const { search } = req.query;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      status: 'paid',
      createdAt: { $gte: todayStart, $lte: todayEnd },
    })
      .populate('systemId', 'name type')
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      bills.map(async (bill) => {
        let userName = 'Unknown';
        let userMobile = null;

        if (bill.userModel === 'User') {
          const user = await User.findById(bill.userId);
          if (user) { userName = user.name; userMobile = user.mobile; }
        } else if (bill.userModel === 'Guest') {
          const guest = await GuestUser.findById(bill.userId);
          if (guest) userName = guest.name;
        }

        if (search) {
          const s = search.toLowerCase();
          const nameMatch = userName.toLowerCase().includes(s);
          const mobileMatch = userMobile ? String(userMobile).includes(s) : false;
          if (!nameMatch && !mobileMatch) return null;
        }

        return {
          _id: bill._id,
          user: { name: userName, mobile: userMobile },
          system: bill.systemId ? { name: bill.systemId.name, type: bill.systemId.type } : null,
          billDetails: {
            totals: bill.totals,
            finalPrice: bill.finalPrice,
            mainSession: bill.mainSession,
            additionalRemotes: bill.additionalRemotes,
            beverages: bill.beverages,
            checkoutOption: bill.checkoutOption,
            remarks: bill.remarks,
          },
          userModel: bill.userModel,
          startTime: bill.mainSession?.startTime,
          endTime: bill.mainSession?.endTime,
        };
      })
    );

    return res.status(200).json({ success: true, data: data.filter(Boolean) });
  } catch (error) {
    console.error('getSessions error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSessions };
