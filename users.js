const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('./User');
const { protect, restrictTo } = require('./auth-middleware');

// All user management routes require admin
router.use(protect, restrictTo('admin'));

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ status: 'success', count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ status: 'success', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users
router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { fullName, email, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      const user = await User.create({ fullName, email, password, role });
      res.status(201).json({ status: 'success', user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/users/:id
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'suspended']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      delete req.body.password; // never update password through this route
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ status: 'success', user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ status: 'success', message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
