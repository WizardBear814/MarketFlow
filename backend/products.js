const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('./Product');
const { protect, restrictTo } = require('./auth-middleware');

// GET /api/products  (public, optional ?search=)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ status: 'success', count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/mine  (any authenticated user)
router.get('/mine', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id  (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ status: 'success', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products  (admin, seller)
router.post(
  '/',
  protect,
  restrictTo('seller', 'admin'),
  [
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { sku, name, description, price, quantity } = req.body;
      const existing = await Product.findOne({ sku: sku.toUpperCase() });
      if (existing) return res.status(409).json({ message: 'SKU already exists' });
      const product = await Product.create({ sku, name, description, price, quantity, seller: req.user._id });
      res.status(201).json({ status: 'success', product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/products/:id  (admin, seller)
router.put(
  '/:id',
  protect,
  [
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const existing = await Product.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Product not found' });

      const isAdmin = req.user.role === 'admin';
      const isOwner = String(existing.seller) === String(req.user._id);
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: 'You can only update your own products' });
      }

      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json({ status: 'success', product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE /api/products/:id  (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = String(product.seller) === String(req.user._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await product.deleteOne();
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
