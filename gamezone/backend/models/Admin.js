const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'staff'],
      default: 'super_admin',
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
