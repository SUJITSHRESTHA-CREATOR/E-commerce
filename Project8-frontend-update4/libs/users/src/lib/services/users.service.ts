import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '@env/environment';
import * as countriesLib from 'i18n-iso-countries';
import { UsersFacade } from '../state/users.facade';

declare const require;

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    apiURLUsers = environment.apiURL + 'users';

    constructor(private http: HttpClient, private usersFacade: UsersFacade) {
        countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiURLUsers);
    }

    getUser(userId: string): Observable<User> {
        return this.http.get<User>(`${this.apiURLUsers}/${userId}`);
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.apiURLUsers, user);
    }

    updateUser(user: User): Observable<User> {
        return this.http.put<User>(`${this.apiURLUsers}/${user.id}`, user);
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiURLUsers}/${userId}`);
    }

    getCountries(): { id: string; name: string }[] {
        return Object.entries(countriesLib.getNames('en', { select: 'official' })).map(
            (entry) => {
                return {
                    id: entry[0],
                    name: entry[1]
                };
            }
        );
    }

    getCountry(countryKey: string) {
        return countriesLib.getName(countryKey, 'en');
    }

    getUsersCount(): Observable<number> {
        return this.http
            .get<number>(`${this.apiURLUsers}/get/count`)
            .pipe(map((objectValue: any) => objectValue.userCount));
    }

    initAppSession() {
        this.usersFacade.buildUserSession();
    }

    observeCurrentUser() {
        return this.usersFacade.currentUser$;
    }

    isCurrentUserAuth() {
        return this.usersFacade.currentUser$;
    }

    getLocationService(): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((resp) => {
                resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
            });
        });
    }

    updateLocation(user: any): Observable<User> {
        console.log(user);
        return this.http.put<any>(`${this.apiURLUsers}/locate/${user.id}`, user);
    }
}
