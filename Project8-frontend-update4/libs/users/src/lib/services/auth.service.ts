import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { Value } from '../models/value';
import { LocalstorageService } from './localstorage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    loginValue$ = new BehaviorSubject(false);
    apiURLUsers = environment.apiURL + 'users';
    loginValue = false;

    constructor(
        private http: HttpClient,
        private token: LocalstorageService,
        private router: Router
    ) {}

    login(email: string, password: string): Observable<User> {
        return this.http.post<User>(`${this.apiURLUsers}/login`, {
            email: email,
            password: password
        });
    }

    logout() {
        this.token.removeToken();
        this.router.navigate(['/login']);
    }

    checkLogin() {
        if (this.loginValue) {
            this.loginValue$.next(true);
        }

        this.loginValue$.next(false);
    }
}
