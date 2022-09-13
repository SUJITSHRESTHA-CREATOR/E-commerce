import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UsersService } from '@bluebits/users';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'bluebits-users-list',
    templateUrl: './users-list.component.html',
    styles: []
})
export class UsersListComponent implements OnInit, OnDestroy {
    users: User[] = [];
    endsubs$: Subject<any> = new Subject();

    constructor(
        private confirmationService: ConfirmationService,
        private usersService: UsersService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._getUsers();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    deleteUser(userId: string) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this User?',
            header: 'Delete User',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService
                    .deleteUser(userId)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe(
                        (response) => {
                            this._getUsers();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'User is deleted!'
                            });
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'User cannot be deleted!'
                            });
                        }
                    );
            },
            reject: (type) => {}
        });
    }

    updateUser(userId: string) {
        this.router.navigateByUrl(`users/form/${userId}`);
    }

    getCountryName(countryKey: string) {
        if (countryKey) {
            return this.usersService.getCountry(countryKey);
        }
    }

    private _getUsers() {
        this.usersService
            .getUsers()
            .pipe(takeUntil(this.endsubs$))
            .subscribe((users) => {
                this.users = users;
            });
    }
}
