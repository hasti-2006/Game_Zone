const mongoose = require('mongoose');

const beverageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Beverage', beverageSchema);
