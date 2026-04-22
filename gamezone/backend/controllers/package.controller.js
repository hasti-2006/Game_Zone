const Package = require('../models/Package');
const UserPackage = require('../models/UserPackage');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ is_active: true });
    return res.status(200).json({ packages });
  } catch (error) {
    console.error('getAllPackages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const addPackage = async (req, res) => {
  try {
    const { name, price, walletAmount, extraPoints } = req.body;
    const pkg = await Package.create({ name, price, walletAmount, extraPoints });
    return res.status(201).json({ success: true, message: 'Package created successfully', data: pkg });
  } catch (error) {
    console.error('addPackage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPurchasedUsers = async (req, res) => {
  try {
    const purchases = await UserPackage.find()
      .populate({ path: 'userId', populate: { path: 'walletId' } })
      .populate('packageId')
      .sort({ purchasedAt: -1 });
    return res.status(200).json({ success: true, data: purchases, message: 'Purchased users fetched successfully' });
  } catch (error) {
    console.error('getPurchasedUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const checkUser = async (req, res) => {
  try {
    const { mobile, name } = req.body;
    let user = await User.findOne({ mobile }).populate('walletId');
    let created = false;

    if (!user && name) {
      user = await User.create({ name, mobile, isAdminRegistered: true });
      user = await User.findById(user._id).populate('walletId');
      created = true;
    }

    return res.status(200).json(
      user
        ? { success: true, data: user, userFound: true, created }
        : { success: true, userFound: false, data: null }
    );
  } catch (error) {
    console.error('checkUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const purchasePackage = async (req, res) => {
  try {
    const { userId, packageId, checkoutOption, name, mobile } = req.body;

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    let user = userId ? await User.findById(userId) : null;
    if (!user && mobile) {
      user = await User.findOne({ mobile: Number(mobile) });
      if (!user) {
        user = await User.create({ name: name || 'Unknown', mobile: Number(mobile), isAdminRegistered: true });
      }
    }
    if (!user) return res.status(400).json({ message: 'User information required' });

    const purchasedPackage = await UserPackage.create({ userId: user._id, packageId, checkoutOption });

    let userWallet = await Wallet.findOne({ userId: user._id });
    if (!userWallet) {
      userWallet = await Wallet.create({ userId: user._id, totalBalance: pkg.walletAmount, remainingBalance: pkg.walletAmount, latestBillId: null });
    } else {
      userWallet.totalBalance += pkg.walletAmount;
      userWallet.remainingBalance += pkg.walletAmount;
      await userWallet.save();
    }

    if (!user.walletId) {
      user.walletId = userWallet._id;
      await user.save();
    }

    return res.status(201).json({ success: true, data: { purchasedPackage, userWallet }, message: 'Package purchased successfully' });
  } catch (error) {
    console.error('purchasePackage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const editPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, walletAmount, extraPoints } = req.body;
    const pkg = await Package.findByIdAndUpdate(id, { name, price, walletAmount, extraPoints }, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    return res.status(200).json({ success: true, message: 'Package updated successfully', data: pkg });
  } catch (error) {
    console.error('editPackage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllPackages, addPackage, editPackage, getPurchasedUsers, checkUser, purchasePackage };
