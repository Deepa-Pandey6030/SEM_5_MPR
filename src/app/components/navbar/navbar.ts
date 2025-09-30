import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  searchQuery: string = '';
  cartItemCount: number = 0;
  categories: any[] = [];

  constructor(
    private router: Router,
    private cartService: CartService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = this.cartService.getTotalItems();
    });
    this.categories = this.dataService.getCategories();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { 
        queryParams: { search: this.searchQuery } 
      });
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
