import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<{product: Product, size: string, color: string}>();

  selectedSize: string = '';
  selectedColor: string = '';

  ngOnInit(): void {
    if (this.product.sizes.length > 0) {
      this.selectedSize = this.product.sizes[0];
    }
    if (this.product.colors.length > 0) {
      this.selectedColor = this.product.colors[0];
    }
  }

  onAddToCart(): void {
    if (this.selectedSize && this.selectedColor) {
      this.addToCart.emit({
        product: this.product,
        size: this.selectedSize,
        color: this.selectedColor
      });
    }
  }

  getDiscountPrice(): number {
    if (this.product.originalPrice && this.product.discount) {
      return this.product.originalPrice * (1 - this.product.discount / 100);
    }
    return this.product.price;
  }
}
