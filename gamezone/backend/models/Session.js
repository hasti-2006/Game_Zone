const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['User', 'Guest'],
      required: true,
    },
    systemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'System',
      required: true,
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    additionalRemotes: [
      {
        // 'remote' = flat ₹30 fee | 'extraUser' = half session price, time-based
        type: { type: String, enum: ['remote', 'extraUser'], default: 'remote' },
        startTime: { type: Date },
        endTime: { type: Date, default: null },
      },
    ],
    beverages: [
      {
        beverageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beverage' },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
