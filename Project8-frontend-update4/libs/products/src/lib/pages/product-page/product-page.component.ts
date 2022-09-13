import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem, CartService } from '@bluebits/orders';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { MessageService } from 'primeng/api';
import { UsersService } from '@bluebits/users';

@Component({
    selector: 'products-product-page',
    templateUrl: './product-page.component.html',
    styles: []
})
export class ProductPageComponent implements OnInit, OnDestroy {
    product: Product;
    quantity: number = 1;
    endsubs$: Subject<any> = new Subject();
    available = true;
    notLoggedIn = true;
    model = 1;
    text = '';
    arrayReviews;
    initial;

    constructor(
        private prodService: ProductsService,
        private userService: UsersService,
        private route: ActivatedRoute,
        private cartService: CartService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this._initialize();
    }

    private _initialize() {
        this.route.params.subscribe((params) => {
            if (params.productid) {
                this._getProduct(params.productid);
                this.checkLogin();
                if (this.userId) {
                    this.takeName();
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    addProductToCart() {
        console.log(this.quantity);
        if (this.quantity == null) {
            const cartItem: CartItem = {
                productId: this.product.id,
                quantity: 1
            };
            this.cartService.setCartItem(cartItem);
        } else {
            const cartItem: CartItem = {
                productId: this.product.id,
                quantity: this.quantity
            };
            this.cartService.setCartItem(cartItem);
        }
    }

    private _getProduct(id: string) {
        this.prodService
            .getProduct(id)
            .pipe(takeUntil(this.endsubs$))
            .subscribe((resProduct) => {
                this.product = resProduct;
                this.arrayReviews = this.product.reviews;
                if (this.product.countInStock == 0) {
                    this.available = false;
                }
                console.log(this.product);
                // console.log(this.product.numReviews, 'database numReviews');
                // console.log(this.product.rating, 'database rating');
                this.model = this.product.rating;
            });
    }

    userId;
    checkLogin() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            const tokenDecode = JSON.parse(atob(result.split('.')[1]));
            console.log(tokenDecode);
            const idToken = tokenDecode.userId;
            this.userId = idToken;
            this.notLoggedIn = false;
        }
    }

    nameOfUser;
    takeName() {
        this.userService
            .getUser(this.userId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe((user) => {
                this.nameOfUser = user.name;
                // const [first]=this.nameOfUser;
                // this.initial=first;
            });
    }

    rated(input) {
        console.log(input);
        console.log(`Clicked value is ${input.value}`);
        //prettier-ignore
        const newRating =
            ((this.product.rating * this.product.numReviews) + input.value) /
            (this.product.numReviews + 1);
        const updatedRate = {
            category: this.product.category,
            rating: newRating,
            numReviews: this.product.numReviews + 1
        };
        this._updateRating(updatedRate, this.product.id);
    }

    private _updateRating(a, b) {
        this.prodService
            .updateRating(a, b)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Rating is recieved!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error is recieving rating!'
                    });
                }
            );
    }

    postReview(event) {
        const text1 = this.text.trim();
        if (text1) {
            const [firstLetter] = this.nameOfUser;
            console.log(text1);
            const reviewData = {
                category: this.product.category,
                reviews: {
                    name: firstLetter,
                    review: text1
                }
            };
            this._addRe(reviewData, this.product.id);
        }
    }

    private _addRe(data, id) {
        this.prodService
            .addReview(data, id)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Review is added!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Review addition failed!'
                    });
                }
            );
        this.text = '';
        this._initialize();
    }
}
