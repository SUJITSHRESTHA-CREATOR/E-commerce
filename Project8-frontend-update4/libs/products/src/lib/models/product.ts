import { Category } from './category';

export class Product {
    id?: string;
    name?: string;
    description?: string;
    richDescription?: string;
    image?: string;
    images?: string[];
    brand?: string;
    price?: number;
    priceMax?: number;
    priceMin?: number;
    thresholdCount?: number;
    timeCount?: number;
    category?: Category;
    countInStock?: number;
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    dateCreated?: string;
    geography?: string;
    location?: {
        type?: string;
        coordinates?: any;
    };
    pgeography?: string;
    plocation?: {
        type?: string;
        coordinates?: any;
    };
    keywords?: string[];
    reviews?: { name: string; review: string }[];
}
