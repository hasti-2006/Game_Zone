const mongoose = require('mongoose');

const userPackageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    checkoutOption: { type: String },
    purchasedAt: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model('UserPackage', userPackageSchema);
