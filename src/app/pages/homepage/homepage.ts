import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../../components/product-card/product-card';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage implements OnInit {
  featuredProducts: Product[] = [];
  trendingProducts: Product[] = [];
  categories: Category[] = [];
  newsletterEmail: string = '';
  selectedGender: 'Men' | 'Women' | 'All' = 'All';

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.dataService.getProducts().subscribe((res: any) => {
      const products: any[] = Array.isArray(res) ? res : (res?.products ?? []);
      const clothing = products.filter((p: any) => p?.category !== 'Shoes' && p?.category !== 'Accessories');

      this.featuredProducts = clothing.filter((p: any) => p?.isNew || p?.isOnSale).slice(0, 6);
      this.trendingProducts = [...clothing]
        .sort((a: any, b: any) => (b?.rating ?? 0) - (a?.rating ?? 0))
        .slice(0, 4);

      this.categories = this.dataService
        .getCategories()
        .filter((c: any) => c.name !== 'Shoes' && c.name !== 'Accessories');
    });
  }

  filteredCategories(): any[] {
    if (this.selectedGender === 'All') return this.categories;
    const womens = ['Tops', 'Dresses', 'Bottoms', 'Outerwear'];
    // Simple demo segmentation: alternate categories to men/women
    const isWomen = (name: string) => womens.includes(name);
    return this.categories.filter(c => this.selectedGender === 'Women' ? isWomen(c.name) : !isWomen(c.name));
  }

  onAddToCart(event: {product: Product, size: string, color: string}): void {
    this.cartService.addToCart(event.product, event.size, event.color);
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail.trim()) {
      // In a real app, this would send the email to a backend service
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail = '';
    }
  }
}
