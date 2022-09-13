import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Product, ProductsService } from '@bluebits/products';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil, timer } from 'rxjs';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styles: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
    editMode = false;
    form: FormGroup;
    isSubmitted = false;
    categories = [];
    imageDisplay: string | ArrayBuffer;
    imageDisplays = [];
    currentProductId: string;
    currentCategoryId;
    endsubs$: Subject<any> = new Subject();
    loaded = false;
    loaded1 = false;

    constructor(
        private formBuilder: FormBuilder,
        private categoriesService: CategoriesService,
        private productsService: ProductsService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._getCategories();
        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    latitude_p;
    longitude_p;
    locationChosen = false;

    myLocations: Array<any> = [1];
    // prettier-ignore
    onChooseLocation(event) {
        // console.log(myLocations.length);
        if (this.myLocations.length==5 || this.myLocations.length>5){
           return;
            //  myLocations = [
            //      { lat: 7.423568, lng: 80.462287 },
            //      { lat: 7.532321, lng: 81.021187 },
            //      { lat: 6.11701, lng: 80.126269 },
            //      { lat: 6.11701, lng: 80.126269 }
            //  ];
        } 
         this.myLocations.push({
             lat: event.coords.lat,
             lng: event.coords.lng
         });
         
        console.log(this.myLocations.length);
        console.log(this.myLocations);

        // const test = {
        //     coordinates: [
        //         [
        //             [85.299448, 27.736671],
        //             [85.364723, 27.726947],
        //             [85.351668, 27.65946],
        //             [85.27059, 27.663109],
        //             [85.299448, 27.736671]
        //         ]
        //     ]
        // }; 
        // console.log(test.coordinates[0][0][1]);
        

        
        // this.latitude_p = event.coords.lat;
        // this.longitude_p = event.coords.lng;
        this.locationChosen = true;
        // console.log(event);
    }

    latitude_p1;
    longitude_p1;
    locationChosen1 = false;

    myLocations1: Array<any> = [1];

    onChooseLocation1(event) {
        if (this.myLocations1.length == 5 || this.myLocations1.length > 5) {
            return;
        }
        this.myLocations1.push({
            lat: event.coords.lat,
            lng: event.coords.lng
        });

        console.log(this.myLocations1.length);
        console.log(this.myLocations1);
        this.locationChosen1 = true;
    }

    private _initForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            brand: ['', Validators.required],
            price: ['', Validators.required],
            priceMax: ['', Validators.required],
            thresholdCount: ['', Validators.required],
            timeCount: ['', Validators.required],
            category: ['', Validators.required],
            countInStock: ['', Validators.required],
            description: ['', Validators.required],
            keywords: ['', Validators.required],
            richDescription: [''],
            image: ['', Validators.required],
            isFeatured: [false],
            images: ['']
        });
    }

    private _getCategories() {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endsubs$))
            .subscribe((categories) => {
                this.categories = categories;
            });
    }

    private _addProduct(productData: FormData) {
        this.productsService
            .createProduct(productData)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (product: Product) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Product ${product.name} is created!`
                    });
                    timer(2000)
                        .toPromise()
                        .then((done) => {
                            this.location.back();
                        });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product cannot be created!'
                    });
                }
            );
    }

    private _updateProduct(productFormData: FormData) {
        this.productsService
            .updateProduct(productFormData, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Product is updated!'
                    });
                    timer(2000)
                        .toPromise()
                        .then((done) => {
                            this.location.back();
                        });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product cannot be updated!'
                    });
                }
            );
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.editMode = true;
                this.currentProductId = params.id;
                this.productsService.getProduct(params.id).subscribe((product) => {
                    console.log(product);
                    this.productForm.name.setValue(product.name);
                    this.productForm.category.setValue(product.category);
                    this.currentCategoryId = product.category;
                    console.log(this.currentCategoryId);
                    this.productForm.brand.setValue(product.brand);
                    this.productForm.price.setValue(product.price);
                    this.productForm.priceMax.setValue(product.priceMax);
                    this.productForm.thresholdCount.setValue(product.thresholdCount);
                    this.productForm.timeCount.setValue(product.timeCount);
                    this.productForm.countInStock.setValue(product.countInStock);
                    this.productForm.isFeatured.setValue(product.isFeatured);
                    this.productForm.description.setValue(product.description);
                    this.productForm.keywords.setValue(product.keywords);
                    this.productForm.richDescription.setValue(product.richDescription);
                    // console.log(product.location.coordinates.length);
                    // console.log(product.location.coordinates.length);
                    // console.log(product.location.coordinates[0][0].length);
                    // console.log(product?.location?.coordinates[0][0]?.length);
                    // console.log(product?.location?.coordinates[0][1][0] == undefined);
                    // console.log('hellodsicfjsdofjsodjf');
                    // if (product.location.coordinates.length != 0) {
                    const after = product.location?.coordinates;
                    const afterp = product.plocation?.coordinates;
                    console.log(after, 'after---------------------');
                    if (after) {
                        console.log('inside!!!');
                        // if (product.location.coordinates[0][0].length != 0) {
                        if (after) {
                            this.myLocations.push({
                                lng: product.location.coordinates[0][0][0],
                                lat: product.location.coordinates[0][0][1]
                            });
                            this.myLocations.push({
                                lng: product.location.coordinates[0][1][0],
                                lat: product.location.coordinates[0][1][1]
                            });
                            this.myLocations.push({
                                lng: product.location.coordinates[0][2][0],
                                lat: product.location.coordinates[0][2][1]
                            });
                            this.myLocations.push({
                                lng: product.location.coordinates[0][3][0],
                                lat: product.location.coordinates[0][3][1]
                            });
                            this.latitude_p = product.location.coordinates[0][3][1];
                            this.longitude_p = product.location.coordinates[0][3][0];
                            this.locationChosen = true;
                            this.loaded = true;
                        }
                        // this.latitude_p = 27.699587;
                        // this.longitude_p = 85.31663;
                        // this.locationChosen = false;
                        // this.loaded = true;
                        // } else {
                        //     this.latitude_p = 27.699587;
                        //     this.longitude_p = 85.31663;
                        //     this.locationChosen = false;
                        //     this.loaded = true;
                        // }
                    }
                    if (!this.latitude_p) {
                        this.latitude_p = 27.699587;
                        this.longitude_p = 85.31663;
                        this.locationChosen = false;
                        this.loaded = true;
                    }
                    //-----------------------------------------------------------------------------------------------------
                    if (afterp) {
                        this.myLocations1.push({
                            lng: product.plocation.coordinates[0][0][0],
                            lat: product.plocation.coordinates[0][0][1]
                        });
                        this.myLocations1.push({
                            lng: product.plocation.coordinates[0][1][0],
                            lat: product.plocation.coordinates[0][1][1]
                        });
                        this.myLocations1.push({
                            lng: product.plocation.coordinates[0][2][0],
                            lat: product.plocation.coordinates[0][2][1]
                        });
                        this.myLocations1.push({
                            lng: product.plocation.coordinates[0][3][0],
                            lat: product.plocation.coordinates[0][3][1]
                        });
                        this.latitude_p1 = product.plocation.coordinates[0][3][1];
                        this.longitude_p1 = product.plocation.coordinates[0][3][0];
                        this.locationChosen1 = true;
                        this.loaded1 = true;
                    }

                    if (!this.latitude_p1) {
                        this.latitude_p1 = 27.699587;
                        this.longitude_p1 = 85.31663;
                        this.locationChosen1 = false;
                        this.loaded1 = true;
                        console.log(this.loaded1, 'This is loaded 1');
                    }

                    this.imageDisplay = product.image;
                    if (product.images) {
                        // for(let i=0;i<product.images.length;i++){
                        //     this.imageDisplays.push();

                        // }
                        product.images.forEach((im) => {
                            this.imageDisplays.push(im);
                        });
                    }
                    this.productForm.images.setValidators([]);
                    this.productForm.images.updateValueAndValidity();

                    this.productForm.image.setValidators([]);
                    this.productForm.image.updateValueAndValidity();
                });
            }
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const productFormData = new FormData();
        Object.keys(this.productForm).map((key) => {
            productFormData.append(key, this.productForm[key].value);
        });
        if (this.editMode) {
            this._updateProduct(productFormData);
        } else {
            this._addProduct(productFormData);
        }
    }

    onCancel() {
        this.location.back();
    }

    onImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.form.patchValue({ image: file });
            this.form.get('image').updateValueAndValidity();
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.imageDisplay = fileReader.result;
            };
            fileReader.readAsDataURL(file);
        }
    }

    onImages(e) {
        if (e.target.files) {
            const productFormData = new FormData();
            for (let i = 0; i < e.target.files.length; i++) {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    this.imageDisplays.push(fileReader.result);
                };
                fileReader.readAsDataURL(e.target.files[i]);

                productFormData.append('images', e.target.files[i]);
            }
            this._onUpdateMultipleImages(productFormData);
        }
    }

    // onSubmitImages() {
    //     this.isSubmitted = true;
    //     if (this.form.invalid) {
    //         return;
    //     }
    //     const productFormData = new FormData();

    //     Object.keys(this.productForm).map((key) => {
    //         console.log(key);
    //         console.log(this.productForm[key].value);
    //         productFormData.append(key, this.productForm[key].value);
    //     });
    //     console.log(productFormData);
    //     //  if (this.editMode) {
    //     this._onUpdateMultipleImages(productFormData);
    // }

    private _onUpdateMultipleImages(productFormData: FormData) {
        this.productsService
            .updatePics(productFormData, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Multiple pics are updated!'
                    });
                    // timer(2000)
                    //     .toPromise()
                    //     .then((done) => {
                    //         this.location.back();
                    //     });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Multiple pics cannot be updated!'
                    });
                }
            );
    }

    get productForm() {
        return this.form.controls;
    }

    onLocUpdate() {
        console.log(this.currentCategoryId);
        const sndData = {
            category: this.currentCategoryId,
            a1: this.myLocations[1].lng,
            a2: this.myLocations[1].lat,
            b1: this.myLocations[2].lng,
            b2: this.myLocations[2].lat,
            c1: this.myLocations[3].lng,
            c2: this.myLocations[3].lat,
            d1: this.myLocations[4].lng,
            d2: this.myLocations[4].lat
        };
        // console.log(this.myLocations[1].lat);
        // console.log(this.myLocations[1].lng);
        // console.log(this.myLocations);
        this._updateLoc(sndData);
    }

    private _updateLoc(product: any) {
        this.productsService
            .updateGeoLocation(product, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Product availability location updated!'
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

    onClear() {
        this.myLocations = [1];
    }

    onDel() {
        const emptyData = {
            category: this.currentCategoryId
        };
        this._delLoc(emptyData);
    }

    private _delLoc(product: any) {
        this.productsService
            .delGeoLocation(product, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Product availability location deleted!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Location is not deleted!'
                    });
                }
            );
    }

    onLocUpdate1() {
        console.log(this.currentCategoryId);
        const sndData = {
            category: this.currentCategoryId,
            pa1: this.myLocations1[1].lng,
            pa2: this.myLocations1[1].lat,
            pb1: this.myLocations1[2].lng,
            pb2: this.myLocations1[2].lat,
            pc1: this.myLocations1[3].lng,
            pc2: this.myLocations1[3].lat,
            pd1: this.myLocations1[4].lng,
            pd2: this.myLocations1[4].lat
        };
        // console.log(this.myLocations[1].lat);
        // console.log(this.myLocations[1].lng);
        // console.log(this.myLocations);
        this._updateLoc1(sndData);
    }

    private _updateLoc1(product: any) {
        this.productsService
            .updateGeopLocation(product, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Dynamic pricing location updated!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Dynamic pricing location not updated!'
                    });
                }
            );
    }

    onClear1() {
        this.myLocations1 = [1];
    }

    onDel1() {
        const emptyData = {
            category: this.currentCategoryId
        };
        this._delLoc1(emptyData);
    }

    private _delLoc1(product: any) {
        this.productsService
            .delGeopLocation(product, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Dynamic pricing location deleted!'
                    });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Dynamic pricing location not deleted!'
                    });
                }
            );
    }
}

// [filter] = 'true';
// filterBy = 'name'[showClear] = 'true';
// placeholder = 'Select a Category';
