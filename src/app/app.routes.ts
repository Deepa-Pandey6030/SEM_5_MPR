import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { ProductListing } from './pages/product-listing/product-listing';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'products', component: ProductListing },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: Cart },
  { path: '**', redirectTo: '' }
];
