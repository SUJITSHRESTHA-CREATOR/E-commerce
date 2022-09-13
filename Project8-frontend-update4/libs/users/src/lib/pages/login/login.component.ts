import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LocalstorageService } from '../../services/localstorage.service';

@Component({
    selector: 'users-login',
    templateUrl: './login.component.html',
    styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
    loginFormGroup: FormGroup;
    isSubmitted = false;
    authError = false;
    login = false;

    authMessage = 'Email or Password credentials are wrong!';
    endsubs$: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private auth: AuthService,
        private localStorageService: LocalstorageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._initLoginForm();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private _initLoginForm() {
        this.loginFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.loginFormGroup.invalid) {
            return;
        }
        this.auth
            .login(this.loginForm.email.value, this.loginForm.password.value)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (user) => {
                    this.authError = false;
                    this.localStorageService.setToken(user.token);
                    const tokenDecode = JSON.parse(atob(user.token.split('.')[1]));

                    if (!tokenDecode.isAdmin) {
                        this.authError = true;
                        this.authMessage = 'User is not Admin';
                    } else {
                        this.authError = false;
                    }
                    this.login = true;
                    this.router.navigate(['/']);
                },
                (error: HttpErrorResponse) => {
                    this.authError = true;
                    if (error.status !== 400) {
                        this.authMessage = 'Error in the Server! Please,try again later';
                        this.login = false;
                    }
                }
            );
        this.auth.loginValue = this.login;
    }

    get loginForm() {
        return this.loginFormGroup.controls;
    }

    directToSignup() {
        this.router.navigate(['/register']);
    }
}
