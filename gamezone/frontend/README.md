# GameZone Admin Panel — MERN Full Stack

A complete Gaming Zone / Gaming Cafe Admin Panel built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **Dashboard**: Real-time system monitoring with live session timers
- **Session Management**: Start/stop gaming sessions for PS5/PC/Simulator systems
- **Billing**: Automated billing with discount, wallet payment, and custom pricing
- **Beverages**: Manage beverage inventory and add to sessions
- **Systems**: Add and manage gaming systems
- **Bookings**: Reserve systems for future sessions
- **Packages**: Wallet packages with bonus points
- **Session History**: Complete transaction history with filters

## Tech Stack

### Backend
- Node.js v18+
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js (Vite)
- React Router DOM v6
- Axios with interceptors
- Tailwind CSS
- Lucide React icons
- React Hot Toast

## Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally on port 27017

### Backend Setup

```bash
cd gamezone/backend
npm install
```

Create `.env` file (already created):
```
MONGO_URI=mongodb://localhost:27017/track-your-tables
JWT_SECRET=gamezone_secret_2026
PORT=5000
```

Start MongoDB (if not running):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

Start backend server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd gamezone/frontend
npm install
npm run dev
```

## Default Admin Credentials

```
Email: kheldestination@gmail.com
Password: admin123
```

## Project Structure

```
gamezone/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── config/          # Database config
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance
    │   ├── context/     # React Context
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── App.jsx      # Main app
    │   └── main.jsx     # Entry point
    └── tailwind.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Systems
- `GET /api/systems/get-all-systems` - Get all systems with live session data
- `POST /api/systems/add` - Add new system
- `PUT /api/systems/edit/:id` - Update system

### Sessions
- `POST /api/session/check-user` - Check if user exists
- `POST /api/session/create-guest` - Create guest user
- `POST /api/session/create` - Start new session
- `POST /api/session/add-remotes/:sessionId` - Add extra remotes
- `POST /api/session/stop-remote/:sessionId/:remoteId` - Stop remote
- `POST /api/session/add-beverage/:sessionId` - Add beverage to session
- `DELETE /api/session/remove-beverage/:sessionId/:beverageItemId` - Remove beverage
- `GET /api/session/details/:sessionId` - Get session details
- `POST /api/session/stop/:sessionId` - End session and generate bill
- `GET /api/session/bill/:billId` - Get bill details
- `POST /api/session/checkout/:billId` - Complete checkout

### Beverages
- `GET /api/beverages/all` - Get all beverages
- `POST /api/beverages/add` - Add beverage
- `PUT /api/beverages/edit/:id` - Update beverage
- `DELETE /api/beverages/delete/:id` - Delete beverage

### History
- `GET /api/history/sessions?startDate=&endDate=&search=` - Get session history

### Packages
- `GET /api/packages/all` - Get all packages
- `POST /api/packages/add` - Add package
- `GET /api/packages/purchased-users` - Get purchase history
- `POST /api/packages/check-user` - Check user by mobile
- `POST /api/packages/purchase` - Purchase package for user

### Bookings
- `GET /api/bookings/all` - Get all bookings
- `POST /api/bookings/check-availability` - Check slot availability
- `POST /api/bookings/create` - Create booking
- `POST /api/bookings/start-session/:bookingId` - Start session from booking
- `PUT /api/bookings/cancel/:bookingId` - Cancel booking

## Color Theme

```js
primary: '#04594A'       // Deep teal green
accent: '#BF9227'        // Golden mustard
background: '#F5F7F6'    // Soft neutral
card: '#FFFFFF'
border: '#E5E7EB'
textMain: '#111827'
textMuted: '#6B7280'
```

## Key Features Explained

### Live Session Tracking
- Real-time timer on dashboard cards
- Automatic system status updates
- Live bill estimation

### Billing System
- Hourly rate calculation for main session
- Separate pricing for additional remotes
- Beverage billing (not discountable)
- Discount percentage (applies to session + remotes only)
- Manual final price override
- Multiple payment methods: Cash, UPI, Wallet

### Wallet System
- Purchase packages to add wallet balance
- Deduct from wallet during checkout
- Track total and remaining balance

### Network Logging
All API requests and responses are logged in the browser console with color-coded formatting for easy debugging.

## Development Notes

- Backend uses `nodemon` for auto-restart
- Frontend uses Vite for fast HMR
- All API responses match the exact format specified in requirements
- JWT tokens stored in localStorage
- Protected routes redirect to login if unauthenticated

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## License

MIT

## Author

Built for Gaming Zone Admin Panel Project
