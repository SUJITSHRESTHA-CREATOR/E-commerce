export class User {
    id?: string;
    name?: string;
    password?: string;
    email?: string;
    phone?: string;
    token?: string;
    isAdmin?: true;
    street?: string;
    apartment?: string;
    zip?: string;
    city?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    userlocation?: {
        type?: string;
        coordinates?: any;
    };
}
