import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsersService, User } from '@bluebits/users';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil, timer } from 'rxjs';

@Component({
    selector: 'ngshop-register',
    templateUrl: './register.component.html',
    styles: []
})
export class RegisterComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editmode = false;
    currentUserId: string;
    countries = [];
    endsubs$: Subject<any> = new Subject();

    latitude_p = 27.673007134040933;
    longitude_p = 85.31179482383641;
    locationChosen = false;

    // prettier-ignore
    onChooseLocation(event) {
        this.longitude_p = event.coords.lng;
        this.latitude_p = event.coords.lat;
        // prettier-ignore
        this.userForm.latitude.patchValue(event.coords.lat);
        this.userForm.longitude.patchValue(event.coords.lng);
        // this.userForm.latitude= event.coords.lat;
        // this.userForm.longitude = event.coords.lng,
        this.locationChosen = true;
        console.log(this.userForm);
        console.log(event);
    }

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
        // this._checkEditMode();
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
            country: ['', Validators.required],
            latitude: ['', Validators.required],
            longitude: ['', Validators.required]
        });
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();

        // console.log(this.countries);
    }

    private _addUser(user: User) {
        this.usersService
            .createUser(user)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (user: User) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `User ${user.name} is created!`
                    });
                    timer(2000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                (err) => {
                    if (err.status === 302) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Email already exists. Try another one.'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'User is not created!'
                        });
                    }
                }
            );
    }

    // private _updateUser(user: User) {
    //     this.usersService
    //         .updateUser(user)
    //         .pipe(takeUntil(this.endsubs$))
    //         .subscribe(
    //             () => {
    //                 this.messageService.add({
    //                     severity: 'success',
    //                     summary: 'Success',
    //                     detail: 'User is updated!'
    //                 });
    //                 timer(2000)
    //                     .toPromise()
    //                     .then(() => {
    //                         this.location.back();
    //                     });
    //             },
    //             () => {
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'User is not updated!'
    //                 });
    //             }
    //         );
    // }

    // private _checkEditMode() {
    //     this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
    //         if (params.id) {
    //             this.editmode = true;
    //             this.currentUserId = params.id;
    //             this.usersService.getUser(params.id).subscribe((user) => {
    //                 this.userForm.name.setValue(user.name);
    //                 this.userForm.email.setValue(user.email);
    //                 this.userForm.phone.setValue(user.phone);
    //                 this.userForm.isAdmin.setValue(user.isAdmin);
    //                 this.userForm.street.setValue(user.street);
    //                 this.userForm.apartment.setValue(user.apartment);
    //                 this.userForm.zip.setValue(user.zip);
    //                 this.userForm.city.setValue(user.city);
    //                 this.userForm.country.setValue(user.country);

    //                 this.userForm.password.setValidators([]);
    //                 this.userForm.password.updateValueAndValidity();
    //             });
    //         }
    //     });
    // }

    onSubmit() {
        this.isSubmitted = true;
        console.log(this.form.invalid);
        console.log(this.userForm.latitude.value, 'value');
        console.log(this.userForm.latitude, 'latitude');
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
            country: this.userForm.country.value,
            latitude: this.userForm.latitude.value,
            longitude: this.userForm.longitude.value
        };
        // if (this.editmode) {
        //     this._updateUser(user);
        // } else {
        console.log(this.userForm.latitude.value, 'value');
        console.log(this.userForm.latitude, 'latitude');
        user.password = this.userForm.password.value;
        this._addUser(user);
        // }
    }

    onCancel() {
        this.location.back();
    }

    get userForm() {
        return this.form.controls;
    }
}
