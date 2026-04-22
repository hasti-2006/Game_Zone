const express = require('express');
const router = express.Router();
const { getAllSystems, addSystem, editSystem } = require('../controllers/system.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-systems', verifyToken, getAllSystems);
router.post('/add', verifyToken, addSystem);
router.put('/edit/:id', verifyToken, editSystem);

module.exports = router;
