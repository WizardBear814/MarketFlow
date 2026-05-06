const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Cart = require('./CartModel');
const Product = require('./Product');
const { protect } = require('./auth-middleware');
const Transaction = require('./Transaction');

router.use(protect);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function totalForCart(cart) {
  return cart.items
    .reduce((sum, item) => {
      const p = item.product;
      const price = p && typeof p === 'object' && p.price != null ? p.price : 0;
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product');
    res.json({ items: cart.items, total: totalForCart(cart) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart  { productId, quantity }
router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const productId = req.body.productId;
      const addQty = req.body.quantity != null ? parseInt(req.body.quantity, 10) : 1;
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const cart = await getOrCreateCart(req.user._id);
      const existing = cart.items.find((i) => String(i.product) === String(productId));
      const currentQty = existing ? existing.quantity : 0;
      const nextQty = currentQty + addQty;

      if (nextQty > product.quantity) {
        return res.status(400).json({ message: 'Not enough stock for this quantity' });
      }

      if (existing) {
        existing.quantity = nextQty;
      } else {
        cart.items.push({ product: productId, quantity: addQty });
      }
      await cart.save();
      await cart.populate('items.product');
      res.status(201).json({ items: cart.items, total: totalForCart(cart) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/cart/checkout
router.post('/checkout', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product');

    if (!cart.items.length) {
      return res.status(400).json({ message: 'The cart is empty' });
    }

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({ message: 'The product no longer exists' });
      }

      if (item.quantity > product.quantity) {
        return res.status(400).json({ message: 'There is not enough stock to complete this purchase' });
      }

      product.quantity -= item.quantity;
      await product.save();

      await Transaction.create({
        type: 'sale',
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: item.quantity * product.price,
        createdBy: req.user._id,
      });
    }
    cart.items = [];
    await cart.save();

    res.json({ message: 'Checkout complete!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cart/:productId  { quantity }
router.put(
  '/:productId',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { productId } = req.params;
      const quantity = parseInt(req.body.quantity, 10);
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (quantity > product.quantity) {
        return res.status(400).json({ message: 'Not enough stock for this quantity' });
      }

      const cart = await getOrCreateCart(req.user._id);
      const line = cart.items.find((i) => String(i.product) === String(productId));
      if (!line) return res.status(404).json({ message: 'Item not in cart' });

      line.quantity = quantity;
      await cart.save();
      await cart.populate('items.product');
      res.json({ items: cart.items, total: totalForCart(cart) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE /api/cart  — clear cart
router.delete('/', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ items: [], total: '0.00' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart/:productId — remove line
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id)

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const test = await Cart.findOne({ user: req.user._id });
    if (!test) return res.json({ items: [], total: '0.00' });

    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    await cart.save();
    await cart.populate('items.product');
    res.json({ items: cart.items, total: totalForCart(cart) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
