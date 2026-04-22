const Booking = require('../models/Booking');
const System = require('../models/System');
const Session = require('../models/Session');
const User = require('../models/User');

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name mobile email')
      .populate('systemId', 'name type')
      .sort({ startTime: 1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('getAllBookings error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { systemId, startTime, endTime } = req.body;

    const conflict = await Booking.findOne({
      systemId,
      status: 'active',
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
      ],
    });

    return res.status(200).json(
      conflict
        ? { available: false, message: 'Slot already booked' }
        : { available: true, message: 'Slot is available' }
    );
  } catch (error) {
    console.error('checkAvailability error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createBooking = async (req, res) => {
  try {
    const { userId, systemId, startTime, endTime, name, mobile } = req.body;

    let resolvedUserId = userId;
    if (!resolvedUserId && mobile) {
      let user = await User.findOne({ mobile: Number(mobile) });
      if (!user) {
        user = await User.create({ name: name || 'Unknown', mobile: Number(mobile), isAdminRegistered: true });
      }
      resolvedUserId = user._id;
    }

    if (!resolvedUserId) {
      return res.status(400).json({ message: 'User information required' });
    }

    const booking = await Booking.create({ userId: resolvedUserId, systemId, startTime, endTime });

    const now = new Date();
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);
    if (new Date(startTime) <= thirtyMinsLater) {
      await System.findByIdAndUpdate(systemId, { is_active: false });
    }

    return res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('createBooking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const startSessionFromBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const session = await Session.create({
      userId: booking.userId,
      userModel: 'User',
      systemId: booking.systemId,
      startTime: new Date(),
      additionalRemotes: [],
      beverages: [],
    });

    await System.findByIdAndUpdate(booking.systemId, { is_active: true });

    booking.status = 'completed';
    await booking.save();

    return res.status(201).json({ message: 'Session started from booking', session });
  } catch (error) {
    console.error('startSessionFromBooking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.status(200).json({ message: 'Booking cancelled', booking });
  } catch (error) {
    console.error('cancelBooking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllBookings, checkAvailability, createBooking, startSessionFromBooking, cancelBooking };
