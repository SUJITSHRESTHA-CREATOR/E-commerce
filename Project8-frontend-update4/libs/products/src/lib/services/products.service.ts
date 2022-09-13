import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Product } from '../models/product';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    apiURLProducts = environment.apiURL + 'products';
    constructor(private http: HttpClient) {}

    getProducts(categoriesFilter?: string[]): Observable<Product[]> {
        let params = new HttpParams();
        if (categoriesFilter) {
            params = params.append('categories', categoriesFilter.join(','));
        }
        return this.http.get<Product[]>(this.apiURLProducts, { params: params });
    }

    createProduct(productData: FormData): Observable<Product> {
        return this.http.post<Product>(this.apiURLProducts, productData);
    }

    getProduct(productId: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiURLProducts}/${productId}`);
    }

    updateProduct(productData: FormData, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<Product>(`${this.apiURLProducts}/${productId}`, productData);
    }

    deleteProduct(productId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiURLProducts}/${productId}`);
    }

    getProductsCount(): Observable<number> {
        return this.http
            .get<number>(`${this.apiURLProducts}/get/count`)
            .pipe(map((objectValue: any) => objectValue.productCount));
    }

    getFeaturedProducts(count: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiURLProducts}/get/featured/${count}`);
    }

    updatePics(productData: FormData, productId: string): Observable<Product> {
        console.log(productData, productId);
        return this.http.put<Product>(
            `${this.apiURLProducts}/gallery-images/${productId}`,
            productData
        );
    }

    updateGeoLocation(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(`${this.apiURLProducts}/geo/${productId}`, productData);
    }

    delGeoLocation(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(
            `${this.apiURLProducts}/delgeo/${productId}`,
            productData
        );
    }

    updateGeopLocation(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(
            `${this.apiURLProducts}/geop/${productId}`,
            productData
        );
    }

    delGeopLocation(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(
            `${this.apiURLProducts}/delgeop/${productId}`,
            productData
        );
    }

    updateRating(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(
            `${this.apiURLProducts}/rating/${productId}`,
            productData
        );
    }

    addReview(productData: any, productId: string): Observable<Product> {
        console.log(productData, productId);

        return this.http.put<any>(
            `${this.apiURLProducts}/review/${productId}`,
            productData
        );
    }
}
