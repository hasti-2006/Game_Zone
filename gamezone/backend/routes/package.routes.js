const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  addPackage,
  editPackage,
  getPurchasedUsers,
  checkUser,
  purchasePackage,
} = require('../controllers/package.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-packages', verifyToken, getAllPackages);
router.post('/add', verifyToken, addPackage);
router.put('/edit/:id', verifyToken, editPackage);
router.get('/purchased-users', verifyToken, getPurchasedUsers);
router.post('/check-user', checkUser);
router.post('/purchase', verifyToken, purchasePackage);

module.exports = router;
