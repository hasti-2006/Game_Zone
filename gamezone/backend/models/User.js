const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: Number, unique: true, required: true },
    email: { type: String },
    is_verified: { type: Boolean, default: false },
    isAdminRegistered: { type: Boolean, default: false },
    isAdminVerified: { type: Boolean, default: false },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
