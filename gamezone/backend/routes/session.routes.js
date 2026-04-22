const express = require('express');
const router = express.Router();
const {
  checkUser,
  createGuest,
  createSession,
  addRemotes,
  stopRemote,
  addBeverage,
  removeBeverage,
  getSessionDetails,
  stopSession,
  getBill,
  checkout,
} = require('../controllers/session.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/check-user', verifyToken, checkUser);
router.post('/create-guest', verifyToken, createGuest);
router.post('/create', verifyToken, createSession);
router.post('/add-remotes/:sessionId', verifyToken, addRemotes);
router.post('/stop-remote/:sessionId/:remoteId', verifyToken, stopRemote);
router.post('/add-beverage/:sessionId', verifyToken, addBeverage);
router.delete('/remove-beverage/:sessionId/:beverageItemId', verifyToken, removeBeverage);
router.get('/details/:sessionId', verifyToken, getSessionDetails);
router.post('/stop/:sessionId', verifyToken, stopSession);
router.get('/bill/:billId', verifyToken, getBill);
router.post('/checkout/:billId', verifyToken, checkout);

module.exports = router;
