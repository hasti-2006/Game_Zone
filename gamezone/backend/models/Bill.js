const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
    userModel: { type: String },
    systemId: { type: mongoose.Schema.Types.ObjectId, ref: 'System' },
    referenceType: {
      type: String,
      enum: ['Session', 'OldSession'],
      default: 'Session',
    },
    mainSession: {
      startTime: Date,
      endTime: Date,
      totalMintues: Number,
      calculatedAmount: Number,
    },
    additionalRemotes: [
      {
        startTime: Date,
        endTime: Date,
        totalMintues: Number,
        calculatedAmount: Number,
      },
    ],
    beverages: [
      {
        beverageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beverage' },
        name: String,
        quantity: Number,
        totalAmount: Number,
      },
    ],
    totals: {
      mainSession: { type: Number, default: 0 },
      additionalRemotes: { type: Number, default: 0 },
      beverages: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    checkoutOption: {
      type: String,
      enum: ['cash', 'upi', 'wallet'],
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
