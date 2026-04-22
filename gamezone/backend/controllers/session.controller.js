const Session = require('../models/Session');
const System = require('../models/System');
const User = require('../models/User');
const GuestUser = require('../models/GuestUser');
const Beverage = require('../models/Beverage');
const Bill = require('../models/Bill');
const Wallet = require('../models/Wallet');

const REMOTE_FLAT_PRICE = 30; // flat ₹30 per additional remote

// POST /api/session/check-user — finds or auto-creates user
const checkUser = async (req, res) => {
  try {
    const { mobile, name } = req.body;
    let user = await User.findOne({ mobile });
    let created = false;

    if (!user) {
      if (name) {
        user = await User.create({ name, mobile, isAdminRegistered: true });
        created = true;
      } else {
        return res.status(200).json({ success: true, message: 'User not found', userFound: false });
      }
    }

    return res.status(200).json({
      success: true,
      message: created ? 'User created successfully' : 'User found',
      userFound: true,
      created,
      user: { _id: user._id, name: user.name, mobile: user.mobile },
    });
  } catch (error) {
    console.error('checkUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/create-guest
const createGuest = async (req, res) => {
  try {
    const { name } = req.body;
    const guestGamer = await GuestUser.create({ name });
    return res.status(201).json({ success: true, message: 'Guest user created successfully', guestGamer });
  } catch (error) {
    console.error('createGuest error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/create
const createSession = async (req, res) => {
  try {
    const { userId, userModel, systemId, additionalRemotesCount, extraUsersCount } = req.body;

    const remotes = [];
    const rCount = parseInt(additionalRemotesCount) || 0;
    for (let i = 0; i < rCount; i++) remotes.push({ type: 'remote', startTime: new Date() });

    const uCount = parseInt(extraUsersCount) || 0;
    for (let i = 0; i < uCount; i++) remotes.push({ type: 'extraUser', startTime: new Date() });

    const session = await Session.create({ userId, userModel, systemId, startTime: new Date(), additionalRemotes: remotes, beverages: [] });
    await System.findByIdAndUpdate(systemId, { is_active: true });

    return res.status(201).json({ message: 'Session created successfully!', session });
  } catch (error) {
    console.error('createSession error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/add-remotes/:sessionId
const addRemotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { count, type = 'remote' } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    for (let i = 0; i < count; i++) session.additionalRemotes.push({ type, startTime: new Date() });
    await session.save();

    return res.status(200).json({
      message: `${String(count).padStart(2, '0')} ${type}(s) added successfully`,
      session: { _id: session._id, additionalRemotes: session.additionalRemotes },
    });
  } catch (error) {
    console.error('addRemotes error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/stop-remote/:sessionId/:remoteId
const stopRemote = async (req, res) => {
  try {
    const { sessionId, remoteId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const remote = session.additionalRemotes.id(remoteId);
    if (!remote) return res.status(404).json({ message: 'Remote not found' });

    remote.endTime = new Date();
    await session.save();
    return res.status(200).json({ message: 'Remote stopped', session });
  } catch (error) {
    console.error('stopRemote error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/add-beverage/:sessionId
const addBeverage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { beverageId, quantity } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const existing = session.beverages.find((b) => b.beverageId.toString() === beverageId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      session.beverages.push({ beverageId, quantity });
    }
    await session.save();

    return res.status(200).json({ message: 'Beverage added to session successfully', session: { _id: session._id, beverages: session.beverages } });
  } catch (error) {
    console.error('addBeverage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/session/remove-beverage/:sessionId/:beverageItemId
const removeBeverage = async (req, res) => {
  try {
    const { sessionId, beverageItemId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.beverages = session.beverages.filter((b) => b._id.toString() !== beverageItemId);
    await session.save();
    return res.status(200).json({ message: 'Beverage removed', session });
  } catch (error) {
    console.error('removeBeverage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/session/details/:sessionId
const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId)
      .populate('userId', 'name mobile')
      .populate('systemId', 'name type price extraUserPrice');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const beveragesWithNames = await Promise.all(
      session.beverages.map(async (b) => {
        const bev = await Beverage.findById(b.beverageId);
        return { beverageId: b.beverageId, name: bev ? bev.name : 'Unknown', quantity: b.quantity, _id: b._id };
      })
    );

    return res.status(200).json({
      message: 'Session details retrieved successfully',
      session: {
        _id: session._id,
        userId: session.userId,
        userModel: session.userModel,
        systemId: session.systemId,
        startTime: session.startTime,
        additionalRemotes: session.additionalRemotes,
        beverages: beveragesWithNames,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('getSessionDetails error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const calcMinutes = (start, end) => parseFloat(((new Date(end) - new Date(start)) / 60000).toFixed(2));

// POST /api/session/stop/:sessionId
const stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).populate('systemId');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const endTime = new Date();
    session.endTime = endTime;
    session.status = 'completed';
    session.additionalRemotes.forEach((r) => { if (!r.endTime) r.endTime = endTime; });
    await session.save();

    await System.findByIdAndUpdate(session.systemId._id, { is_active: false });

    const system = session.systemId;
    const mainMinutes = calcMinutes(session.startTime, endTime);
    const mainAmount = parseFloat(((mainMinutes / 60) * system.price).toFixed(2));

    const additionalRemotesBilling = session.additionalRemotes.map((remote) => {
      const remoteEnd = remote.endTime || endTime;
      const mins = calcMinutes(remote.startTime, remoteEnd);
      const calculatedAmount = remote.type === 'extraUser'
        ? parseFloat(((mins / 60) * (system.price / 2)).toFixed(2))
        : REMOTE_FLAT_PRICE;
      return { type: remote.type || 'remote', startTime: remote.startTime, endTime: remoteEnd, totalMintues: mins, calculatedAmount, _id: remote._id };
    });

    const beveragesBilling = await Promise.all(
      session.beverages.map(async (b) => {
        const bev = await Beverage.findById(b.beverageId);
        const totalAmount = bev ? bev.price * b.quantity : 0;
        return {
          beverageId: bev ? { _id: bev._id, name: bev.name, price: bev.price } : b.beverageId,
          name: bev ? bev.name : 'Unknown',
          quantity: b.quantity,
          totalAmount,
          _id: b._id,
        };
      })
    );

    const totalRemotes = additionalRemotesBilling.reduce((sum, r) => sum + r.calculatedAmount, 0);
    const totalBeverages = beveragesBilling.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalAmount = parseFloat((mainAmount + totalRemotes + totalBeverages).toFixed(2));

    const bill = await Bill.create({
      sessionId: session._id,
      userId: session.userId,
      userModel: session.userModel,
      systemId: session.systemId._id,
      referenceType: 'Session',
      mainSession: { startTime: session.startTime, endTime, totalMintues: mainMinutes, calculatedAmount: mainAmount },
      additionalRemotes: additionalRemotesBilling.map((r) => ({
        startTime: r.startTime, endTime: r.endTime, totalMintues: r.totalMintues, calculatedAmount: r.calculatedAmount,
      })),
      beverages: beveragesBilling.map((b) => ({
        beverageId: b.beverageId._id || b.beverageId, name: b.name, quantity: b.quantity, totalAmount: b.totalAmount,
      })),
      totals: { mainSession: mainAmount, additionalRemotes: parseFloat(totalRemotes.toFixed(2)), beverages: totalBeverages, totalAmount },
      discount: 0,
      finalPrice: 0,
      remarks: '',
      status: 'pending',
    });

    let userWallet = null;
    if (session.userModel === 'User') userWallet = await Wallet.findOne({ userId: session.userId });

    return res.status(200).json({
      message: 'Session ended and bill generated successfully',
      billId: bill._id,
      bill: { mainSession: bill.mainSession, additionalRemotes: additionalRemotesBilling, beverages: beveragesBilling, totals: bill.totals, discount: bill.discount, remarks: bill.remarks },
      userWallet,
    });
  } catch (error) {
    console.error('stopSession error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/session/bill/:billId
const getBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findById(billId).populate('userId', 'name mobile').populate('systemId', 'name type');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    let userWallet = null;
    if (bill.userModel === 'User' && bill.userId) userWallet = await Wallet.findOne({ userId: bill.userId._id });

    return res.status(200).json({ message: 'Bill details retrieved successfully', bill, userWallet });
  } catch (error) {
    console.error('getBill error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/session/checkout/:billId
const checkout = async (req, res) => {
  try {
    const { billId } = req.params;
    const { discount, finalPrice, remarks, checkoutOption } = req.body;

    const bill = await Bill.findById(billId).populate('userId', 'name mobile').populate('systemId', 'name type');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (checkoutOption === 'wallet' && bill.userModel === 'User') {
      const wallet = await Wallet.findOne({ userId: bill.userId._id });
      if (!wallet || wallet.remainingBalance < finalPrice) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      wallet.remainingBalance = parseFloat((wallet.remainingBalance - finalPrice).toFixed(2));
      wallet.latestBillId = bill._id;
      await wallet.save();
    }

    bill.discount = discount;
    bill.finalPrice = finalPrice;
    bill.remarks = remarks;
    bill.checkoutOption = checkoutOption;
    bill.status = 'paid';
    bill.referenceType = 'OldSession';
    await bill.save();

    return res.status(200).json({ message: 'Session checkout completed successfully', oldSessionId: bill.sessionId, billId: bill._id, finalBill: bill });
  } catch (error) {
    console.error('checkout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { checkUser, createGuest, createSession, addRemotes, stopRemote, addBeverage, removeBeverage, getSessionDetails, stopSession, getBill, checkout };
