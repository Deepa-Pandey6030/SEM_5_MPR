export interface Product {
  id: string;
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
  gender?: 'Men' | 'Women' | 'Unisex';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
}

export interface SortOption {
  value: string;
  label: string;
}
