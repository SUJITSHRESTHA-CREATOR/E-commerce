import { OrderItem } from './order-item';
import { User } from '@bluebits/users';

export class Order {
    id?: string;
    orderItems?: OrderItem[];
    shippingAddress1?: string;
    shippingAddress2?: string;
    city?: string;
    zip?: string;
    country?: string;
    phone?: string;
    status?: number;
    totalPrice?: string;
    user?: any;
    dateOrdered?: string;
    latitude?: string;
    longitude?: string;
}
