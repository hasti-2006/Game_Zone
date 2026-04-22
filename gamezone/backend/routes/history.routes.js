const express = require('express');
const router = express.Router();
const { getSessions } = require('../controllers/history.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/all-history', verifyToken, getSessions);

module.exports = router;
