import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { Product, Review } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;
  showReviews: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: string): void {
    this.dataService.getProductById(id).subscribe((p: any) => {
      this.product = p || null;
      if (this.product) {
        this.selectedImage = this.product.images[0];
        this.selectedSize = this.product.sizes[0] || '';
        this.selectedColor = this.product.colors[0] || '';
        this.reviews = this.dataService.getReviewsByProductId(id);
      }
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  onAddToCart(): void {
    if (this.product && this.selectedSize && this.selectedColor) {
      this.cartService.addToCart(this.product, this.selectedSize, this.selectedColor, this.quantity);
    }
  }

  toggleReviews(): void {
    this.showReviews = !this.showReviews;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }
}
