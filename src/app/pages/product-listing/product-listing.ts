import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../../components/product-card/product-card';
import { Product, FilterOptions, SortOption } from '../../models/product.model';

@Component({
  selector: 'app-product-listing',
  imports: [CommonModule, FormsModule, ProductCard],
  templateUrl: './product-listing.html',
  styleUrl: './product-listing.scss'
})
export class ProductListing implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  brands: string[] = [];
  sizes: string[] = [];
  colors: string[] = [];
  
  // Filters
  selectedCategory: string = '';
  selectedBrand: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  priceRange = { min: 0, max: 1000 };
  searchQuery: string = '';
  
  // Sorting
  sortOptions: SortOption[] = [
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' }
  ];
  selectedSort: string = 'name-asc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 0;

  constructor(
    private dataService: DataService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataService.getProducts().subscribe((res: any) => {
      const data = res;
      this.products = Array.isArray(data) ? data : (data?.products ?? []);
      this.categories = this.dataService.getCategories();
      this.extractFilters();
      this.applyFilters();

      // Listen to query parameters after products are loaded
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.selectedCategory = params['category'] || '';
        this.applyFilters();
      });
    });
  }

  extractFilters(): void {
    this.brands = [...new Set(this.products.map(p => p.brand))];
    this.sizes = [...new Set(this.products.flatMap(p => p.sizes))];
    this.colors = [...new Set(this.products.flatMap(p => p.colors))];
    
    const prices = this.products.map(p => p.price);
    this.priceRange.min = Math.min(...prices);
    this.priceRange.max = Math.max(...prices);
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Brand filter
    if (this.selectedBrand) {
      filtered = filtered.filter(p => p.brand === this.selectedBrand);
    }

    // Size filter
    if (this.selectedSize) {
      filtered = filtered.filter(p => p.sizes.includes(this.selectedSize));
    }

    // Color filter
    if (this.selectedColor) {
      filtered = filtered.filter(p => p.colors.includes(this.selectedColor));
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= this.priceRange.min && p.price <= this.priceRange.max);

    // Sort
    this.sortProducts(filtered);
    
    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortProducts(products: Product[]): void {
    switch (this.selectedSort) {
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        products.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.sortProducts(this.filteredProducts);
  }

  onAddToCart(event: {product: Product, size: string, color: string}): void {
    this.cartService.addToCart(event.product, event.size, event.color);
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedSize = '';
    this.selectedColor = '';
    this.priceRange = { min: 0, max: 1000 };
    this.searchQuery = '';
    this.selectedSort = 'name-asc';
    this.applyFilters();
  }

  getPaginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
  }
}
