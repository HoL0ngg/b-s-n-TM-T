export interface ShopType {
    id: Number;
    name: String;
    logo_url: String;
    description: String;
    status: Number;
    created_at: Date;
    totalProduct: number;
    avgRating: number;
}

export interface ShopCateType {
    id: Number;
    name: String;
}