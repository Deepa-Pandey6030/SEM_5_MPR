import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
    .sort(sort === 'price-asc' ? { price: 1 } :
        sort === 'price-desc' ? { price: -1 } :
        sort === 'rating-desc' ? { rating: -1 } : { name: 1 })
  .limit(Number(limit))
  .skip((Number(page) - 1) * Number(limit));

const total = await Product.countDocuments(query);
res.json({ products, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total });
} catch (error) {
res.status(500).json({ message: error.message });
}
});

router.get('/:id', async (req, res) => {
try {
const product = await Product.findById(req.params.id);
if (!product) return res.status(404).json({ message: 'Product not found' });
res.json(product);
} catch (error) {
res.status(500).json({ message: error.message });
}
});

export default router;