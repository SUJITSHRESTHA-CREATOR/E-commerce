import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order, OrdersService, ORDER_STATUS } from '@bluebits/orders';
// import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'ngshop-orderhistory',
    templateUrl: './orderhistory.component.html',
    styles: []
})
export class OrderhistoryComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    // orderStatus = ORDER_STATUS;
    orderStatus;
    endsubs$: Subject<any> = new Subject();

    constructor(
        private ordersService: OrdersService,
        private router: Router,
        // private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._directTo();
        this.orderStatus = ORDER_STATUS;
        console.log(this.orderStatus);
        this._getOrders();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    _getOrders() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            const tokenDecode = JSON.parse(atob(result.split('.')[1]));
            const idToken = tokenDecode.userId;
            console.log(idToken);
            this.ordersService
                .getUserOrders(idToken)
                .pipe(takeUntil(this.endsubs$))
                .subscribe((orders) => {
                    this.orders = orders;
                    console.log(orders);
                });
        }
    }

    showOrder(orderId) {
        this.router.navigateByUrl(`orderhistorydetail/${orderId}`);
    }

    private _directTo() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            this.router.navigate(['/orderhistory']);
        } else {
            this.router.navigate(['/login']);
        }
    }

    // deleteOrder(orderId: string) {
    //     this.confirmationService.confirm({
    //         message: 'Do you want to Delete this Order?',
    //         header: 'Delete Order',
    //         icon: 'pi pi-exclamation-triangle',
    //         accept: () => {
    //             this.ordersService
    //                 .deleteOrder(orderId)
    //                 .pipe(takeUntil(this.endsubs$))
    //                 .subscribe(
    //                     () => {
    //                         this._getOrders();
    //                         this.messageService.add({
    //                             severity: 'success',
    //                             summary: 'Success',
    //                             detail: 'Order is deleted!'
    //                         });
    //                     },
    //                     () => {
    //                         this.messageService.add({
    //                             severity: 'error',
    //                             summary: 'Error',
    //                             detail: 'Order cannot be deleted!'
    //                         });
    //                     }
    //                 );
    //         }
    //     });
    // }
}
