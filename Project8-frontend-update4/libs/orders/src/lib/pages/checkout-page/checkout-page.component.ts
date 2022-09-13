import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@bluebits/users';
import { Cart } from '../../models/cart';
import { Order } from '../../models/order';
import { OrderItem } from '../../models/order-item';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { ORDER_STATUS } from '../../orders.constants';
import { Subject, take, takeUntil } from 'rxjs';
import { StripeService } from 'ngx-stripe';
import KhaltiCheckout from 'khalti-checkout-web';
import { ThankYouComponent } from '../thank-you/thank-you.component';

@Component({
    selector: 'orders-checkout-page',
    templateUrl: './checkout-page.component.html'
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
    checkoutFormGroup: FormGroup;
    isSubmitted = false;
    orderItems: OrderItem[] = [];
    userId: string;
    countries = [];
    unsubscribe$: Subject<any> = new Subject();
    latitude_p = 27.673007134040933;
    longitude_p = 85.31179482383641;
    locationChosen = false;
    endSubs$: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private usersService: UsersService,
        private formBuilder: FormBuilder,
        private cartService: CartService,
        private ordersService: OrdersService,
        private stripeService: StripeService
    ) {}

    ngOnInit(): void {
        this._initCheckoutForm();
        this._autoFillUserData();
        this._getCartItems();
        this._getCountries();
        this._getOrderSummary();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.complete();
        this.endSubs$.complete();
    }

    // prettier-ignore
    onChooseLocation(event) {
        this.longitude_p = event.coords.lng;
        this.latitude_p = event.coords.lat;
        // prettier-ignore
        this.checkoutForm.latitude.patchValue(event.coords.lat);
        this.checkoutForm.longitude.patchValue(event.coords.lng);
        // this.userForm.latitude= event.coords.lat;
        // this.userForm.longitude = event.coords.lng,
        this.locationChosen = true;
        console.log(this.checkoutForm);
        console.log(event);
    }

    private _initCheckoutForm() {
        this.checkoutFormGroup = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.email, Validators.required]],
            phone: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            zip: ['', Validators.required],
            apartment: ['', Validators.required],
            street: ['', Validators.required],
            latitude: ['', Validators.required],
            longitude: ['', Validators.required]
        });
    }

    private _autoFillUserData() {
        this.usersService
            .observeCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user) => {
                if (user) {
                    this.userId = user.id;
                    this.checkoutForm.name.setValue(user.name);
                    this.checkoutForm.email.setValue(user.email);
                    this.checkoutForm.phone.setValue(user.phone);
                    this.checkoutForm.city.setValue(user.city);
                    this.checkoutForm.country.setValue(user.country);
                    this.checkoutForm.zip.setValue(user.zip);
                    this.checkoutForm.apartment.setValue(user.apartment);
                    this.checkoutForm.street.setValue(user.street);
                    // this.checkoutForm.longitude.setValue('');
                    // this.checkoutForm.latitude.setValue('');
                }
            });
    }

    private _getCartItems() {
        const cart: Cart = this.cartService.getCart();
        this.orderItems = cart.items.map((item) => {
            return {
                product: item.productId,
                quantity: item.quantity
            };
        });

        console.log(this.orderItems);
    }

    private _getCountries() {
        this.countries = this.usersService.getCountries();
    }

    backToCart() {
        this.router.navigate(['/cart']);
    }

    placeOrder() {
        this.isSubmitted = true;
        if (this.checkoutFormGroup.invalid) {
            return;
        }

        const order: Order = {
            orderItems: this.orderItems,
            shippingAddress1: this.checkoutForm.street.value,
            shippingAddress2: this.checkoutForm.apartment.value,
            city: this.checkoutForm.city.value,
            zip: this.checkoutForm.zip.value,
            country: this.checkoutForm.country.value,
            phone: this.checkoutForm.phone.value,
            status: 0,
            user: this.userId,
            dateOrdered: `${Date.now()}`,
            longitude: this.checkoutForm.longitude.value,
            latitude: this.checkoutForm.latitude.value
        };

        this.ordersService.cacheOrderData(order);

        this.ordersService.createCheckoutSession(this.orderItems).subscribe((error) => {
            if (error) {
                console.log('Error in redirect to payment');
            }
        });
    }

    placeOrderKhalti() {
        this.isSubmitted = true;
        if (this.checkoutFormGroup.invalid) {
            return;
        }

        const order: Order = {
            orderItems: this.orderItems,
            shippingAddress1: this.checkoutForm.street.value,
            shippingAddress2: this.checkoutForm.apartment.value,
            city: this.checkoutForm.city.value,
            zip: this.checkoutForm.zip.value,
            country: this.checkoutForm.country.value,
            phone: this.checkoutForm.phone.value,
            status: 0,
            user: this.userId,
            dateOrdered: `${Date.now()}`,
            longitude: this.checkoutForm.longitude.value,
            latitude: this.checkoutForm.latitude.value
        };

        this.ordersService.cacheOrderData(order);

        const that = this.ordersService;
        const thatRouter = this.router;
        //-----------------------------------------------------------------------------------
        const uniqueId = Date.now();
        let config = {
            // replace this key with yours
            publicKey: 'test_public_key_728030d987bf437381f0a8e6e3d2391e',
            productIdentity: uniqueId.toString(),
            productName: 'Product1',
            productUrl: 'http://localhost:4200/',
            eventHandler: {
                onSuccess(payload) {
                    // hit merchant api for initiating verfication
                    console.log(payload, 'frontend success');
                    const info = {
                        token: payload.token,
                        amount: payload.amount
                    };

                    that.createKhalti(info).subscribe(
                        (res) => {
                            console.log(res, 'backend success');
                            thatRouter.navigate(['/success']);
                        },
                        (err) => {
                            console.log(err, 'backend error');
                        }
                    );
                },
                // onError handler is optional
                onError(error) {
                    // handle errors
                    console.log(error, 'frontend error');
                },
                onClose() {
                    console.log('widget is closing');
                }
            },
            paymentPreference: [
                'KHALTI',
                'EBANKING',
                'MOBILE_BANKING',
                'CONNECT_IPS',
                'SCT'
            ]
        };

        let checkout = new KhaltiCheckout(config);
        checkout.show({ amount: this.totalPrice * 100 });
    }

    totalPrice;

    _getOrderSummary() {
        this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((cart) => {
            this.totalPrice = 0;
            if (cart) {
                cart.items.map((item) => {
                    this.ordersService
                        .getProduct(item.productId)
                        .pipe(take(1))
                        .subscribe((product) => {
                            this.totalPrice += product.price * item.quantity;
                        });
                });
            }
        });
    }

    get checkoutForm() {
        return this.checkoutFormGroup.controls;
    }
}
