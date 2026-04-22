const User = require('../models/User');
const Bill = require('../models/Bill');
const Session = require('../models/Session');

// GET /api/users/all — returns all users with live session status
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('walletId').sort({ createdAt: -1 });

    const activeSessions = await Session.find({ status: 'active', userModel: 'User' })
      .populate('systemId', 'name type')
      .lean();

    const activeMap = {};
    for (const s of activeSessions) {
      activeMap[s.userId.toString()] = {
        sessionId: s._id,
        systemName: s.systemId?.name || '—',
        systemType: s.systemId?.type || '—',
        startTime: s.startTime,
      };
    }

    const data = users.map((u) => {
      const activeSession = activeMap[u._id.toString()] || null;
      return {
        _id: u._id,
        name: u.name,
        mobile: u.mobile,
        email: u.email,
        walletId: u.walletId,
        createdAt: u.createdAt,
        isActive: Boolean(activeSession),
        activeSession,
      };
    });

    return res.status(200).json({ success: true, data, message: 'Users fetched successfully' });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:userId/history
const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const bills = await Bill.find({ userId, userModel: 'User', status: 'paid' })
      .populate('systemId', 'name type')
      .sort({ createdAt: -1 });

    const user = await User.findById(userId).populate('walletId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const data = bills.map((bill) => ({
      _id: bill._id,
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
      startTime: bill.mainSession?.startTime,
      endTime: bill.mainSession?.endTime,
      createdAt: bill.createdAt,
    }));

    return res.status(200).json({
      success: true,
      user: { _id: user._id, name: user.name, mobile: user.mobile, email: user.email, wallet: user.walletId },
      data,
      message: 'User history fetched successfully',
    });
  } catch (error) {
    console.error('getUserHistory error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserHistory };
