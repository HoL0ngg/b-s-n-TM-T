import { User } from "./user.model";

export interface Product {
    id: string;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_id: number;
    shop_id: number;
}

export interface ProductReview {
    id: number;
    rating: number;
    comment: number;
    created_at: string;
    phone_number: string;
    email: string;
    avatar_url: string;
}

export interface ProductDetails {
    id: number,
    product_id: number,
    attribute: string,
    value: string,
}
