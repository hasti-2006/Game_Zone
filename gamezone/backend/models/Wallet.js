const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalBalance: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    latestBillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
