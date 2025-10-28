export interface CartItem {
    product_id: number;
    quantity: number;
    shop_id: number;
    shop_name: string;
    product_name: string;
    product_price: number;
    product_url: string;
    logo_url: string;
}

export interface CartType {
    shop_id: number;
    shop_name: string;
    logo_url: string;
    items: CartItem[];
}