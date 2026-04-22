const Beverage = require('../models/Beverage');

const getAllBeverages = async (req, res) => {
  try {
    const beverages = await Beverage.find().sort({ createdAt: -1 });
    return res.status(200).json({ beverages });
  } catch (error) {
    console.error('getAllBeverages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const addBeverage = async (req, res) => {
  try {
    const { name, price, qty } = req.body;
    const beverage = await Beverage.create({ name, price, qty });
    return res.status(201).json({ success: true, message: 'Beverage created successfully', data: beverage });
  } catch (error) {
    console.error('addBeverage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const editBeverage = async (req, res) => {
  try {
    const { id } = req.params;
    const beverage = await Beverage.findByIdAndUpdate(id, req.body, { new: true });
    if (!beverage) return res.status(404).json({ message: 'Beverage not found' });
    return res.status(200).json({ success: true, message: 'Beverage updated successfully', data: beverage });
  } catch (error) {
    console.error('editBeverage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteBeverage = async (req, res) => {
  try {
    const { id } = req.params;
    const beverage = await Beverage.findByIdAndDelete(id);
    if (!beverage) return res.status(404).json({ message: 'Beverage not found' });
    return res.status(200).json({ success: true, message: 'Beverage deleted successfully' });
  } catch (error) {
    console.error('deleteBeverage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllBeverages, addBeverage, editBeverage, deleteBeverage };
