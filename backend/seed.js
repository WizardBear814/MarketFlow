// seed.js — Populate the database with test users and a few sample products.
// Run from the backend folder:  npm run seed
//
// Existing users with the same email or products with the same SKU are skipped,
// so re-running this script is safe.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');

const TEST_USERS = [
  { fullName: 'Admin User',    email: 'admin@marketflow.com',  password: 'admin123',  role: 'admin'  },
  { fullName: 'Sample Seller', email: 'seller@marketflow.com', password: 'seller123', role: 'seller' },
  { fullName: 'Sample Buyer',  email: 'buyer@marketflow.com',  password: 'buyer123',  role: 'buyer'  },
];

const SAMPLE_PRODUCTS = [
  { sku: 'SKU-001', name: 'Wireless Headphones', description: 'Noise-canceling headphones with 30-hour battery life.', price: 89.99, quantity: 42 },
  { sku: 'SKU-002', name: 'Portable Blender',    description: 'Rechargeable blender for smoothies and protein shakes.', price: 39.95, quantity: 18 },
  { sku: 'SKU-003', name: 'Smart Watch',         description: 'Fitness tracking, sleep metrics, and notifications.',     price: 129.0, quantity: 5  },
  { sku: 'SKU-004', name: 'Ergonomic Keyboard',  description: 'Split-layout mechanical keyboard for all-day comfort.',   price: 74.5,  quantity: 25 },
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in .env — cannot seed.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  for (const u of TEST_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`  • user already exists: ${u.email} (${existing.role})`);
      continue;
    }
    await User.create(u);
    console.log(`  ✓ created user: ${u.email} / ${u.password}  (${u.role})`);
  }

  const seller = await User.findOne({ email: 'seller@marketflow.com' });
  for (const p of SAMPLE_PRODUCTS) {
    const existing = await Product.findOne({ sku: p.sku });
    if (existing) {
      console.log(`  • product already exists: ${p.sku}`);
      continue;
    }
    await Product.create({ ...p, seller: seller?._id });
    console.log(`  ✓ created product: ${p.sku} — ${p.name}`);
  }

  await mongoose.disconnect();
  console.log('\nDone. You can now log in with any of the test accounts.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
