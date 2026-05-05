const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Virtual: calculate order total
cartSchema.virtual('total').get(function () {
  return this.items.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
});

cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
