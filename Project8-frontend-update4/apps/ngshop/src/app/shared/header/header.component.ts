import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@bluebits/users';
import { UsersService, User } from '@bluebits/users';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil, timer } from 'rxjs';

@Component({
    selector: 'ngshop-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLogin = false;
    endsubs$: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private authService: AuthService,
        private usersService: UsersService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getLocation();
        this.checkLogin();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private checkLogin() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            this.isLogin = true;
        }
    }

    directToLogin() {
        this.router.navigate(['/login']);
        // this.isLogin = false;
        // console.log(this.isLogin);
        // this.ngOnInit();
    }

    directToHomepage() {
        this.authService.logout();
        this.isLogin = false;
        this.router.navigate(['']);
    }

    directTo() {
        console.log('clicked directTo()');
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            this.router.navigate(['/settings']);
        } else {
            this.router.navigate(['/login']);
        }
    }

    getLocation() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            this.usersService.getLocationService().then((resp) => {
                const tokenDecode = JSON.parse(atob(result.split('.')[1]));
                const idToken = tokenDecode.userId;
                const location = {
                    id: idToken,
                    longitude: resp.lng,
                    latitude: resp.lat
                };
                console.log(resp.lng);
                console.log(resp.lat);
                this._updateLocation(location);
            });
        }
    }

    private _updateLocation(user: any) {
        this.usersService
            .updateLocation(user)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Location updated!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Location is not updated!'
                    });
                }
            );
    }
}
