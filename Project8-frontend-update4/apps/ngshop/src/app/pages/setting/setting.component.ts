import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsersService, User } from '@bluebits/users';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil, timer } from 'rxjs';

@Component({
    selector: 'ngshop-setting',
    templateUrl: './setting.component.html',
    styles: []
})
export class SettingComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;

    currentUserId: string;
    countries = [];
    endsubs$: Subject<any> = new Subject();
    loaded = false;

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initUserForm();
        this._getCountries();
        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private _initUserForm() {
        this.form = this.formBuilder.group({
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern('[a-zA-Z ]*'),
                    Validators.maxLength(18)
                ]
            ],
            password: ['', [Validators.required, Validators.minLength(6)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            isAdmin: [false],
            street: ['', Validators.required],
            apartment: ['', Validators.required],
            zip: ['', [Validators.required]],
            city: ['', Validators.required],
            country: ['', Validators.required]
            // latitude: ['', Validators.required],
            // longitude: ['', Validators.required]
        });
    }

    // latitude_p = this.userForm.latitude.value;
    // longitude_p = this.userForm.longitude.value;
    // latitude_p = 27.644671;
    // longitude_p = 85.254917;
    latitude_p;
    longitude_p;
    locationChosen = false;

    // prettier-ignore
    onChooseLocation(event) {
         const result = localStorage.getItem(`jwtToken`);
         if (result) {
             const tokenDecode = JSON.parse(atob(result.split('.')[1]));
             const idToken = tokenDecode.userId;
             const location = {
                 id: idToken,
                 longitude: event.coords.lng,
                 latitude: event.coords.lat
             };
             console.log(event.coords.lng);
             console.log(event.coords.lat);
             this._updateLocation(location);
         }


        this.longitude_p = event.coords.lng;
        this.latitude_p = event.coords.lat;
        // prettier-ignore
        // this.userForm.latitude.patchValue(event.coords.lat);
        // this.userForm.longitude.patchValue(event.coords.lng);
        // this.form.patchValue({
        //     latitude: event.coords.lat,
        //     longitude:event.coords.lng,
        // });
        // console.log(this.form);
        // this.userForm.latitude= event.coords.lat;
        // this.userForm.longitude = event.coords.lng,
        this.locationChosen = true;
        // console.log(this.userForm);
        console.log(event);
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();

        // console.log(this.countries);
    }

    // private _addUser(user: User) {
    //     this.usersService
    //         .createUser(user)
    //         .pipe(takeUntil(this.endsubs$))
    //         .subscribe(
    //             (user: User) => {
    //                 this.messageService.add({
    //                     severity: 'success',
    //                     summary: 'Success',
    //                     detail: `User ${user.name} is created!`
    //                 });
    //                 timer(2000)
    //                     .toPromise()
    //                     .then(() => {
    //                         this.location.back();
    //                     });
    //             },
    //             (err) => {
    //                 if (err.status === 302) {
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: 'Email already exists. Try another one.'
    //                     });
    //                 } else {
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: 'Error',
    //                         detail: 'User is not created!'
    //                     });
    //                 }
    //             }
    //         );
    // }

    private _updateUser(user: User) {
        this.usersService
            .updateUser(user)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'User is updated!'
                    });
                    timer(2000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'User is not updated!'
                    });
                }
            );
    }

    private _checkEditMode() {
        const result = localStorage.getItem(`jwtToken`);
        const tokenDecode = JSON.parse(atob(result.split('.')[1]));
        const idToken = tokenDecode.userId;

        this.currentUserId = idToken;
        this.usersService.getUser(idToken).subscribe((user) => {
            console.log(user.latitude);
            this.userForm.name.setValue(user.name);
            this.userForm.email.setValue(user.email);
            this.userForm.phone.setValue(user.phone);
            this.userForm.isAdmin.setValue(user.isAdmin);
            this.userForm.street.setValue(user.street);
            this.userForm.apartment.setValue(user.apartment);
            this.userForm.zip.setValue(user.zip);
            this.userForm.city.setValue(user.city);
            this.userForm.country.setValue(user.country);
            // this.userForm.latitude.setValue(user.latitude);
            // this.userForm.longitude.setValue(user.longitude);

            // this.latitude_p = +user.latitude;
            this.latitude_p = +user.userlocation.coordinates[1];
            // this.longitude_p = +user.longitude;
            this.longitude_p = +user.userlocation.coordinates[0];
            this.locationChosen = true;
            this.loaded = true;
            this.userForm.password.setValidators([]);
            this.userForm.password.updateValueAndValidity();
        });
        // console.log(this.userForm.latitude.value);
    }

    onSubmit() {
        if (!this.longitude_p) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Location is required!'
            });
            return;
        }
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const user: User = {
            id: this.currentUserId,
            name: this.userForm.name.value,
            email: this.userForm.email.value,
            phone: this.userForm.phone.value,
            isAdmin: this.userForm.isAdmin.value,
            street: this.userForm.street.value,
            apartment: this.userForm.apartment.value,
            zip: this.userForm.zip.value,
            city: this.userForm.city.value,
            country: this.userForm.country.value
            // latitude: this.userForm.latitude.value,
            // longitude: this.userForm.longitude.value
        };

        if (this.userForm.password.value) {
            user.password = this.userForm.password.value;
            this._updateUser(user);
        } else {
            this._updateUser(user);
        }
    }

    onCancle() {
        this.location.back();
    }

    get userForm() {
        return this.form.controls;
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
