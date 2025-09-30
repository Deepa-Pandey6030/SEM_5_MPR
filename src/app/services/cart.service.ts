import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);

  constructor() {
    // Load cart from localStorage on service initialization
    this.loadCartFromStorage();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getCartItemsValue(): CartItem[] {
    return this.cartItems;
  }

  addToCart(product: any, selectedSize: string, selectedColor: string, quantity: number = 1): void {
    const existingItem = this.cartItems.find(
      item => item.product.id === product.id && 
              item.selectedSize === selectedSize && 
              item.selectedColor === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        product,
        quantity,
        selectedSize,
        selectedColor
      });
    }

    this.updateCart();
  }

  removeFromCart(itemId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== itemId);
    this.updateCart();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const item = this.cartItems.find(cartItem => cartItem.product.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next([...this.cartItems]);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItems = [];
      }
    }
  }
}
