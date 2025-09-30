import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService{
    private apiUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient){}

    getProducts(params?: any): Observable<any>{
        return this.http.get(`${this.apiUrl}/products`, { params });
    }
    getProduct(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/products/${id}`);
    }
    
      // Users
    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/register`, userData);
    }
    
    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/login`, credentials);
    }
}