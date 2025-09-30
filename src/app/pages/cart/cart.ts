import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  constructor(public cartService: CartService) {}
}
