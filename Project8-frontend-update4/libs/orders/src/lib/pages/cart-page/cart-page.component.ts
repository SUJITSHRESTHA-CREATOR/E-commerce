import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartItem, CartItemDetailed } from '../../models/cart';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'orders-cart-page',
    templateUrl: './cart-page.component.html',
    styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
    cartItemsDetailed: CartItemDetailed[] = [];
    cartCount = 0;
    endsubs$: Subject<any> = new Subject();
    max;

    constructor(
        private router: Router,
        private cartService: CartService,
        private ordersService: OrdersService
    ) {}

    ngOnInit(): void {
        this._getCartDetails();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private _getCartDetails() {
        this.cartService.cart$.pipe(takeUntil(this.endsubs$)).subscribe((respCart) => {
            this.cartItemsDetailed = [];
            this.cartCount = respCart?.items?.length ?? 0;
            respCart.items.forEach((cartItem) => {
                this.ordersService
                    .getProduct(cartItem.productId)
                    .subscribe((respProduct) => {
                        this.cartItemsDetailed.push({
                            product: respProduct,
                            quantity: cartItem.quantity
                        });
                    });
            });
        });
    }

    backToShop() {
        this.router.navigate(['/products']);
    }

    deleteCartItem(cartItem: CartItemDetailed) {
        this.cartService.deleteCartItem(cartItem.product.id);
    }

    updateCartItemQuantity(event, cartItem: CartItemDetailed) {
        this.max = cartItem.product.countInStock;
        console.log(event);
        if (event.value === 0 || event.value < 0 || event.value === null) {
            this.cartService.setCartItem(
                {
                    productId: cartItem.product.id,
                    quantity: 1
                },
                true
            );
        } else if (event.value > this.max) {
            this.cartService.setCartItem(
                {
                    productId: cartItem.product.id,
                    quantity: this.max
                },
                true
            );
        } else {
            this.cartService.setCartItem(
                {
                    productId: cartItem.product.id,
                    quantity: event.value
                },
                true
            );
        }
    }
}
