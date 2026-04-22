require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/systems', require('./routes/system.routes'));
app.use('/api/session', require('./routes/session.routes'));
app.use('/api/beverages', require('./routes/beverage.routes'));
app.use('/api/history', require('./routes/history.routes'));
app.use('/api/packages', require('./routes/package.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'GameZone API is running' }));

// Seed admin — credentials come from .env
const seedAdmin = async () => {
  const Admin = require('./models/Admin');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(' ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({
      name: 'Admin',
      email,
      password_hash: bcrypt.hashSync(password, 10),
      role: 'admin',
      is_active: true,
    });
    console.log(`✅ Admin created: ${email}`);
  } else {
    // Update password in case it changed in .env
    existing.password_hash = bcrypt.hashSync(password, 10);
    await existing.save();
    console.log(`ℹ️  Admin credentials synced from .env`);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
