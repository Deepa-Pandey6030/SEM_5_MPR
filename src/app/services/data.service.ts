import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private apiService: ApiService){}

  private toArray(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(';')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    return [];
  }

  private mapProduct = (p: any) => {
    const mapped = {
      ...p,
      id: p?.id ?? p?._id,
    };
    return {
      ...mapped,
      images: this.toArray(mapped.images),
      sizes: this.toArray(mapped.sizes),
      colors: this.toArray(mapped.colors)
    };
  };

  getProducts(filters?: any): Observable<any>{
    return this.apiService.getProducts(filters).pipe(
      map((res: any) => {
        const list = Array.isArray(res) ? res : (res?.products ?? []);
        return list.map(this.mapProduct);
      })
    );
  }

  getProductById(id:string): Observable<any>{
    return this.apiService.getProduct(id).pipe(
      map((p: any) => this.mapProduct(p))
    );
  }

  // Temporary static categories until backend endpoint is wired
  private categories = [
    { id: '1', name: 'Tops', image: '/assets/images/category-tops.webp', productCount: 45 },
    { id: '2', name: 'Bottoms', image: '/assets/images/categories-bottoms.avif', productCount: 32 },
    { id: '3', name: 'Dresses', image: '/assets/images/categories-dresses.webp', productCount: 28 },
    { id: '4', name: 'Outerwear', image: '/assets/images/category-outwear.jpg', productCount: 18 }
  ];

  getCategories(){
    return this.categories;
  }

  // Temporary static reviews until backend endpoint is wired
  private reviews = [
    {
      id: '1',
      productId: '1',
      userName: 'Sarah Johnson',
      rating: 5,
      comment: 'Love this t-shirt! Great quality and perfect fit.',
      date: new Date('2024-01-15'),
      verified: true
    },
    {
      id: '2',
      productId: '1',
      userName: 'Mike Chen',
      rating: 4,
      comment: 'Good quality but runs a bit small. Size up!',
      date: new Date('2024-01-10'),
      verified: true
    }
  ];

  getReviewsByProductId(productId: string){
    return this.reviews.filter(r => r.productId === productId);
  }
}
