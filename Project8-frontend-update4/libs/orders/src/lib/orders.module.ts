import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { CartService } from './services/cart.service';
import { CartIconComponent } from './components/cart-icon/cart-icon.component';
import { BadgeModule } from 'primeng/badge';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';
// import { AuthGuard, AuthGuardCustomerService } from '@bluebits/users';
import { AuthGuardCustomerService } from '@bluebits/users';

import { AgmCoreModule } from '@agm/core';
// import KhaltiCheckout from 'khalti-checkout-web';

export const routes: Route[] = [
    {
        path: 'cart',
        component: CartPageComponent
    },
    {
        path: 'checkout',
        canActivate: [AuthGuardCustomerService],
        component: CheckoutPageComponent
    },
    {
        path: 'success',
        component: ThankYouComponent
    }
];

@NgModule({
    imports: [
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAhYG3y_QQQHJK9vYYTqkRDhs3ES5Dghhk'
        }),
        CommonModule,
        RouterModule,
        BadgeModule,
        InputTextModule,
        ButtonModule,
        InputMaskModule,
        InputNumberModule,
        DropdownModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
        // KhaltiCheckout
    ],
    declarations: [
        CartIconComponent,
        CartPageComponent,
        OrderSummaryComponent,
        CheckoutPageComponent,
        ThankYouComponent
    ],
    exports: [
        CartIconComponent,
        CartPageComponent,
        OrderSummaryComponent,
        CheckoutPageComponent,
        ThankYouComponent
    ]
})
export class OrdersModule {
    constructor(cartService: CartService) {
        cartService.initCartLocalStorage();
    }
}
