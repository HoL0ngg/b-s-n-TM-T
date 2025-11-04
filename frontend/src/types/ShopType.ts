export interface ShopType {
    id: number;
    name: string;
    logo_url: string;
    description: string;
    status: Number;
    created_at: Date;
    totalProduct: number;
    avgRating: number;
}

export interface ShopCateType {
    id: Number;
    name: string;
}