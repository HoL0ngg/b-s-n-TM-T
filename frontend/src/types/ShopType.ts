export interface ShopType {
    id: number;
    name: string;
    logo_url: string;
    description: string;
    status: number;
    created_at: Date;
    totalProduct: number;
    avgRating: number;
}

export interface ShopCateType {
    id: number;
    name: string;
}

export interface ShopAdminType extends ShopType {
    username: string;
    phone_number: string;
}