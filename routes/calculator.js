const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

// POST /api/calculate - perform calculation and save to DB
router.post('/calculate', async (req, res) => {
  try {
    const { maxRisk, entryPrice, stopLossPrice } = req.body;

    // Validate inputs
    if (maxRisk === undefined || entryPrice === undefined || stopLossPrice === undefined) {
      return res.status(400).json({ error: 'All fields are required: maxRisk, entryPrice, stopLossPrice' });
    }

    const mR = parseFloat(maxRisk);
    const eP = parseFloat(entryPrice);
    const sL = parseFloat(stopLossPrice);

    if (isNaN(mR) || isNaN(eP) || isNaN(sL)) {
      return res.status(400).json({ error: 'All fields must be valid numbers' });
    }

    if (eP === sL) {
      return res.status(400).json({ error: 'Entry Price and Stop-loss Price cannot be the same (division by zero)' });
    }

    if (mR <= 0) {
      return res.status(400).json({ error: 'Maximum Risk must be a positive number' });
    }

    // Formula: Quantity = ⌊ Max Risk / |Entry Price − Stop Loss Price| ⌋
    const absDiff = Math.abs(eP - sL);
    const quantityExact = mR / absDiff;
    const quantityFloored = Math.floor(quantityExact);

    // Save to MongoDB
    const calculation = new Calculation({
      maxRisk: mR,
      entryPrice: eP,
      stopLossPrice: sL,
      quantity: quantityExact,
    });

    await calculation.save();

    return res.status(200).json({
      success: true,
      quantity: parseFloat(quantityExact.toFixed(4)),
      quantityRounded: quantityFloored,
      riskPerShare: absDiff,
      inputs: { maxRisk: mR, entryPrice: eP, stopLossPrice: sL },
    });
  } catch (err) {
    console.error('Error in /calculate:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/history - fetch last 10 calculations
router.get('/history', async (req, res) => {
  try {
    const history = await Calculation.find().sort({ createdAt: -1 }).limit(10);
    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error('Error in /history:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/history - clear all history
router.delete('/history', async (req, res) => {
  try {
    await Calculation.deleteMany({});
    return res.status(200).json({ success: true, message: 'History cleared' });
  } catch (err) {
    console.error('Error in DELETE /history:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
