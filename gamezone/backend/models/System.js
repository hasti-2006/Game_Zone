const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['PS5', 'PC', 'Simulator'],
      required: true,
    },
    seq: { type: Number },
    price: { type: Number, required: true },
    extraUserPrice: { type: Number, default: 0 },
    is_active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('System', systemSchema);
