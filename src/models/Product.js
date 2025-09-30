import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  images: [String],
  sizes: [String],
  colors: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  discount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);