export interface ProductType {
    id: number;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_id: number;
    shop_id: number;
    image_url: string;
}

export interface ProductImageType {
    image_id: number;
    image_url: string;
    is_main: number;
}