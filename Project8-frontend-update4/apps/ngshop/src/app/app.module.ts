import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

import { AccordionModule } from 'primeng/accordion';
import { NavComponent } from './shared/nav/nav.component';
import { ProductsModule } from '@bluebits/products';
import { UiModule } from '@bluebits/ui';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OrdersModule } from '@bluebits/orders';
import { MessagesComponent } from './shared/messages/messages.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { JwtInterceptor, UsersModule } from '@bluebits/users';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgxStripeModule } from 'ngx-stripe';
import { ButtonModule } from 'primeng/button';
import { RegisterComponent } from './pages/register/register.component';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { SettingComponent } from './pages/setting/setting.component';
import { OrderhistoryComponent } from './pages/orderhistory/orderhistory.component';
import { OrderhistorydetailComponent } from './pages/orderhistorydetail/orderhistorydetail.component';

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },

    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'settings',
        component: SettingComponent
    },
    {
        path: 'orderhistory',
        component: OrderhistoryComponent
    },
    {
        path: 'orderhistorydetail/:id',
        component: OrderhistorydetailComponent
    }
];

@NgModule({
    declarations: [
        AppComponent,
        NxWelcomeComponent,
        HomePageComponent,
        HeaderComponent,
        FooterComponent,
        NavComponent,
        MessagesComponent,
        RegisterComponent,
        SettingComponent,
        OrderhistoryComponent,
        OrderhistorydetailComponent
    ],
    imports: [
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAhYG3y_QQQHJK9vYYTqkRDhs3ES5Dghhk'
        }),
        CardModule,
        ToolbarModule,
        FormsModule,
        ReactiveFormsModule,
        InputMaskModule,
        InputSwitchModule,
        DropdownModule,

        ButtonModule,
        TableModule,
        TagModule,

        BrowserModule,
        ProductsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        HttpClientModule,
        UiModule,
        OrdersModule,
        AccordionModule,
        ToastModule,
        UsersModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        NgxStripeModule.forRoot(
            'pk_test_51K4juWSILkqWlNJONCdI5ZieADFXn8EcKzq2oAtYZSqsVgFADvdZrtldu8xhH2B4iSX6hcr4jWpn2bW6lyBRQzDg00ZYGv2z11'
        )
    ],
    providers: [
        MessageService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    exports: []
})
export class AppModule {}
