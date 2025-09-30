# Backend Integration Guide: Angular Frontend to Node.js + Express + MongoDB

This guide will help you connect your Angular clothing store frontend to a Node.js + Express + MongoDB backend.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Basic knowledge of JavaScript/TypeScript
- Understanding of REST APIs

## Step 1: Set Up the Backend Project

### 1.1 Create Backend Directory
```bash
mkdir clothing-store-backend
cd clothing-store-backend
npm init -y
```

### 1.2 Install Dependencies
```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install -D nodemon @types/node typescript ts-node
```

### 1.3 Create TypeScript Configuration
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 Update package.json Scripts
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc"
  }
}
```

## Step 2: Backend Project Structure

```
clothing-store-backend/
├── src/
│   ├── models/
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── routes/
│   │   ├── products.ts
│   │   ├── users.ts
│   │   ├── orders.ts
│   │   └── cart.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── userController.ts
│   │   ├── orderController.ts
│   │   └── cartController.ts
│   └── server.ts
├── uploads/
└── .env
```

## Step 3: Environment Configuration

Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clothing-store
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Step 4: Database Models

### 4.1 Product Model (`src/models/Product.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  brand: string;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);
```

### 4.2 User Model (`src/models/User.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
```

### 4.3 Cart Model (`src/models/Cart.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model<ICart>('Cart', CartSchema);
```

## Step 5: API Routes

### 5.1 Products Controller (`src/controllers/productController.ts`)
```typescript
import { Request, Response } from 'express';
import Product from '../models/Product';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    
    let query: any = {};
    
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

    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'name-asc': sortOption = { name: 1 }; break;
      case 'name-desc': sortOption = { name: -1 }; break;
      case 'price-asc': sortOption = { price: 1 }; break;
      case 'price-desc': sortOption = { price: -1 }; break;
      case 'rating-desc': sortOption = { rating: -1 }; break;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
};
```

### 5.2 Products Routes (`src/routes/products.ts`)
```typescript
import express from 'express';
import { getAllProducts, getProductById, createProduct } from '../controllers/productController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', auth, createProduct); // Protected route

export default router;
```

### 5.3 Cart Controller (`src/controllers/cartController.ts`)
```typescript
import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, selectedSize, selectedColor } = req.body;
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    const existingItem = cart.items.find(
      item => item.product.toString() === productId && 
              item.selectedSize === selectedSize && 
              item.selectedColor === selectedColor
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, selectedSize, selectedColor });
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { productId, selectedSize, selectedColor } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => !(item.product.toString() === productId && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor)
    );
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error });
  }
};
```

## Step 6: Authentication Middleware

### 6.1 Auth Middleware (`src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

## Step 7: Main Server File

### 7.1 Server Setup (`src/server.ts`)
```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import cartRoutes from './routes/cart';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 8: Update Angular Services

### 8.1 Create HTTP Service (`src/app/services/http.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Products
  getProducts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Cart
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`, { headers: this.getHeaders() });
  }

  addToCart(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, item, { headers: this.getHeaders() });
  }

  removeFromCart(productId: string, size: string, color: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${productId}/${size}/${color}`, { headers: this.getHeaders() });
  }

  // Auth
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }
}
```

### 8.2 Update Data Service (`src/app/services/data.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Product, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private httpService: HttpService) {}

  getProducts(params?: any): Observable<any> {
    return this.httpService.getProducts(params);
  }

  getProductById(id: string): Observable<Product> {
    return this.httpService.getProductById(id);
  }

  getCategories(): Category[] {
    // You can also fetch this from the backend
    return [
      { id: '1', name: 'Tops', image: '/assets/images/category-tops.jpg', productCount: 45 },
      { id: '2', name: 'Bottoms', image: '/assets/images/category-bottoms.jpg', productCount: 32 },
      { id: '3', name: 'Dresses', image: '/assets/images/category-dresses.jpg', productCount: 28 },
      { id: '4', name: 'Outerwear', image: '/assets/images/category-outerwear.jpg', productCount: 18 },
      { id: '5', name: 'Shoes', image: '/assets/images/category-shoes.jpg', productCount: 25 },
      { id: '6', name: 'Accessories', image: '/assets/images/category-accessories.jpg', productCount: 15 }
    ];
  }
}
```

### 8.3 Update Cart Service (`src/app/services/cart.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { CartItem } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);

  constructor(private httpService: HttpService) {
    this.loadCart();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  private loadCart(): void {
    this.httpService.getCart().subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
        this.cartSubject.next([...this.cartItems]);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }

  addToCart(product: any, selectedSize: string, selectedColor: string, quantity: number = 1): void {
    this.httpService.addToCart({
      productId: product.id,
      quantity,
      selectedSize,
      selectedColor
    }).subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
        this.cartSubject.next([...this.cartItems]);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  removeFromCart(productId: string, size: string, color: string): void {
    this.httpService.removeFromCart(productId, size, color).subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
        this.cartSubject.next([...this.cartItems]);
      },
      error: (error) => {
        console.error('Error removing from cart:', error);
      }
    });
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}
```

## Step 9: Update Angular App Configuration

### 9.1 Add HttpClientModule to app.config.ts
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule)
  ]
};
```

## Step 10: Running the Applications

### 10.1 Start the Backend
```bash
cd clothing-store-backend
npm run dev
```

### 10.2 Start the Frontend
```bash
cd clothing-store
npm start
```

## Step 11: Testing the Integration

1. **Test Product API**: Visit `http://localhost:3000/api/products`
2. **Test Frontend**: Visit `http://localhost:4200`
3. **Check Network Tab**: Verify API calls are being made
4. **Test Cart Functionality**: Add items to cart and verify backend updates

## Step 12: Production Deployment

### 12.1 Environment Variables
- Set `NODE_ENV=production`
- Use MongoDB Atlas for production database
- Set secure JWT secrets
- Configure CORS for your domain

### 12.2 Build Commands
```bash
# Backend
npm run build
npm start

# Frontend
ng build --prod
```

## Additional Features to Implement

1. **User Authentication**: Login/Register pages
2. **Order Management**: Checkout process
3. **Admin Panel**: Product management
4. **Image Upload**: Product image management
5. **Email Notifications**: Order confirmations
6. **Payment Integration**: Stripe/PayPal
7. **Search Functionality**: Advanced search
8. **Reviews System**: Product reviews and ratings

## Troubleshooting

1. **CORS Issues**: Ensure CORS is properly configured
2. **Database Connection**: Check MongoDB connection string
3. **Authentication**: Verify JWT token handling
4. **API Endpoints**: Check route definitions and controllers
5. **Environment Variables**: Ensure all required variables are set

This guide provides a solid foundation for connecting your Angular frontend to a Node.js backend. You can extend it based on your specific requirements.
