export interface Shop {
    id: Number;
    name: String;
    logo_url: String;
    description: String;
    status: Number;
    created_at: String;
    totalProduct: number;
    avgRating: number;
}

export interface ShopCategories {
    id: Number;
    name: String;
}