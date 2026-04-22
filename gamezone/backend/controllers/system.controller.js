const System = require('../models/System');
const Session = require('../models/Session');
const User = require('../models/User');
const GuestUser = require('../models/GuestUser');

const getAllSystems = async (req, res) => {
  try {
    const systems = await System.find().sort({ seq: 1 });

    const activeSessions = await Session.find({ status: 'active' }).populate('systemId');

    const sessionMap = {};
    for (const session of activeSessions) {
      let username = 'Unknown';
      let mobile = null;

      if (session.userModel === 'User') {
        const user = await User.findById(session.userId);
        if (user) { username = user.name; mobile = user.mobile; }
      } else if (session.userModel === 'Guest') {
        const guest = await GuestUser.findById(session.userId);
        if (guest) username = guest.name;
      }

      sessionMap[session.systemId._id.toString()] = {
        sessionId: session._id,
        startTime: session.startTime,
        username,
        mobile,
      };
    }

    const data = systems.map((sys) => {
      const sessionInfo = sessionMap[sys._id.toString()];
      return sessionInfo
        ? { _id: sys._id, name: sys.name, type: sys.type, seq: sys.seq, price: sys.price, extraUserPrice: sys.extraUserPrice, sessionId: sessionInfo.sessionId, isActive: true, startTime: sessionInfo.startTime, username: sessionInfo.username, mobile: sessionInfo.mobile }
        : { _id: sys._id, name: sys.name, type: sys.type, seq: sys.seq, price: sys.price, extraUserPrice: sys.extraUserPrice, sessionId: null, isActive: false, startTime: null, username: null, mobile: null };
    });

    return res.status(200).json({ message: 'Systems Fetched successfully', data });
  } catch (error) {
    console.error('getAllSystems error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const addSystem = async (req, res) => {
  try {
    const { name, type, seq, price, extraUserPrice } = req.body;
    const system = await System.create({ name, type, seq, price, extraUserPrice });
    return res.status(201).json({ message: 'System created successfully', system });
  } catch (error) {
    console.error('addSystem error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const editSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const system = await System.findByIdAndUpdate(id, req.body, { new: true });
    if (!system) return res.status(404).json({ message: 'System not found' });
    return res.status(200).json({ message: 'System updated successfully', system });
  } catch (error) {
    console.error('editSystem error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllSystems, addSystem, editSystem };
