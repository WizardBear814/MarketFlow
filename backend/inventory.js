const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('./Transaction');
const Product = require('./Product');
const { protect, restrictTo } = require('./auth-middleware');

// All inventory routes require login; some restricted to admin/seller
router.use(protect);

// ─── GET /api/inventory ───────────────────────────────────────────────────────
// Summary KPIs + recent transactions
router.get('/', restrictTo('admin', 'seller'), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(50);

    // Aggregate KPIs
    const kpis = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalQty: { $sum: '$quantity' },
          totalValue: { $sum: '$total' },
        },
      },
    ]);

    const sales = kpis.find((k) => k._id === 'sale') || { totalQty: 0, totalValue: 0 };
    const purchases = kpis.find((k) => k._id === 'purchase') || { totalQty: 0, totalValue: 0 };

    res.json({
      status: 'success',
      kpis: {
        totalUnitsSold: sales.totalQty,
        totalRevenue: sales.totalValue.toFixed(2),
        totalCost: purchases.totalValue.toFixed(2),
        estimatedProfit: (sales.totalValue - purchases.totalValue).toFixed(2),
      },
      transactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/inventory ──────────────────────────────────────────────────────
// Record a sale or purchase transaction
router.post(
  '/',
  restrictTo('admin', 'seller'),
  [
    body('type').isIn(['sale', 'purchase']).withMessage('Type must be sale or purchase'),
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { type, productId, quantity, unitPrice } = req.body;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // Adjust stock
      if (type === 'sale') {
        if (product.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock for this sale' });
        }
        product.quantity -= quantity;
      } else {
        product.quantity += quantity;
      }
      await product.save();

      const transaction = await Transaction.create({
        type,
        product: productId,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        createdBy: req.user._id,
      });

      res.status(201).json({ status: 'success', transaction });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── DELETE /api/inventory/:id ────────────────────────────────────────────────
router.delete('/:id', restrictTo('admin'), async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ status: 'success', message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
