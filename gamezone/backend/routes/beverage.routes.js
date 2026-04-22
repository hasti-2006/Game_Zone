const express = require('express');
const router = express.Router();
const {
  getAllBeverages,
  addBeverage,
  editBeverage,
  deleteBeverage,
} = require('../controllers/beverage.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-beverages', verifyToken, getAllBeverages);
router.post('/add', verifyToken, addBeverage);
router.put('/edit/:id', verifyToken, editBeverage);
router.delete('/delete/:id', verifyToken, deleteBeverage);

module.exports = router;
