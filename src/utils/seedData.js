import mongoose from "mongoose";
import dotenv from 'dotenv';
import Product from "../models/Product.js";

dotenv.config();

const seedProducts = [
  {
    name: 'Classic White T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    description: 'Premium cotton t-shirt with a comfortable fit',
    category: 'Tops',
    brand: 'FashionCo',
    images: ['/assets/images/tshirt1.avif', '/assets/images/tshirt2.webp'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    isOnSale: true,
    discount: 25
  },
  {
    name: 'Denim Jeans',
    price: 79.99,
    description: 'Classic blue denim jeans with modern fit',
    category: 'Bottoms',
    brand: 'DenimBrand',
    images: ['/assets/images/jeans1.jpg', '/assets/images/jeans2.webp'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    rating: 4.2,
    reviewCount: 89,
    inStock: true,
    isNew: true
  },
  {
    name: 'Summer Dress',
    price: 59.99,
    description: 'Light and breezy summer dress perfect for warm weather',
    category: 'Dresses',
    brand: 'SummerStyle',
    images: ['/assets/images/dress1.webp', '/assets/images/dress2.webp'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral', 'Solid Blue', 'White'],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    isOnSale: true,
    discount: 15
  },
  {
    name: 'Hoodie',
    price: 49.99,
    description: 'Comfortable hoodie for casual wear',
    category: 'Outerwear',
    brand: 'ComfortWear',
    images: ['/assets/images/hoodie1.webp', '/assets/images/hoodie2.webp'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Gray', 'Black', 'Navy'],
    rating: 4.3,
    reviewCount: 67,
    inStock: true
  },
  {
    name: 'Running Shoes',
    price: 129.99,
    description: 'High-performance running shoes with excellent cushioning',
    category: 'Shoes',
    brand: 'SportMax',
    images: ['/assets/images/shoes1.jpg', '/assets/images/shoes2.webp'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Blue'],
    rating: 4.6,
    reviewCount: 203,
    inStock: true,
    isNew: true
  },
  {
    name: 'Winter Jacket',
    price: 199.99,
    originalPrice: 249.99,
    description: 'Warm winter jacket with waterproof material',
    category: 'Outerwear',
    brand: 'WinterGear',
    images: ['/assets/images/jacket1.jpg', '/assets/images/jacket2.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Brown'],
    rating: 4.8,
    reviewCount: 91,
    inStock: true,
    isOnSale: true,
    discount: 20
  }
];

async function seedDatabase(){
    try{
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
    }
}

seedDatabase();