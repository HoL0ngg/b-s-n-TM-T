export interface CartItem {
    product_id: number;
    quantity: number;
    shop_id: number;
    shop_name: string;
    product_name: string;
    product_price: number;
    product_url: string;
    product_variant_id: number;
    logo_url: string;

    options?: IVariantOption[];

    original_price: number;
    sale_price: number | null;
    discount_percentage: number | null;
}

interface IVariantOption {
    attribute: string;
    value: string;
}

export interface CartType {
    shop_id: number;
    shop_name: string;
    logo_url: string;
    items: CartItem[];
}