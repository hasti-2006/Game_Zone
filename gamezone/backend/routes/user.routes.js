const express = require('express');
const router = express.Router();
const { getAllUsers, getUserHistory } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-users', verifyToken, getAllUsers);
router.get('/:userId/history', verifyToken, getUserHistory);

module.exports = router;
