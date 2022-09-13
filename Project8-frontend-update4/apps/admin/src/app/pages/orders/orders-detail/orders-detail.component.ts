import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrdersService, ORDER_STATUS } from '@bluebits/orders';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs';

@Component({
    selector: 'admin-orders-detail',
    templateUrl: './orders-detail.component.html',
    styles: []
})
export class OrdersDetailComponent implements OnInit, OnDestroy {
    order: Order;
    orderStatuses = [];
    selectedStatus: any;
    endsubs$: Subject<any> = new Subject();
    latitude_p;
    longitude_p;
    locationChosen = false;
    marked = false;

    constructor(
        private orderService: OrdersService,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._mapOrderStatus();
        this._getOrder();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private _mapOrderStatus() {
        this.orderStatuses = Object.keys(ORDER_STATUS).map((key) => {
            return {
                id: key,
                name: ORDER_STATUS[key].label
            };
        });
    }

    private _getOrder() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.orderService
                    .getOrder(params.id)
                    .pipe(takeUntil(this.endsubs$))
                    .subscribe((order) => {
                        this.order = order;
                        this.selectedStatus = order.status;
                        if (order.longitude) {
                            this.longitude_p = +order.longitude;
                            this.latitude_p = +order.latitude;
                            this.locationChosen = true;
                            this.marked = true;
                        } else {
                            this.latitude_p = 27.700432;
                            this.longitude_p = 85.314932;
                            this.locationChosen = true;
                        }
                    });
            }
        });
    }

    onStatusChange(event) {
        this.orderService
            .updateOrder({ status: event.value }, this.order.id)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (order) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Order is created!`
                    });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Orders cannot be updated!'
                    });
                }
            );
    }
}

// mapClick = 'onChooseLocation($event)';
