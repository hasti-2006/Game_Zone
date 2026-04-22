const mongoose = require('mongoose');

const guestUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', guestUserSchema);
