export interface ProductType {
    id: number;
    name: string;
    description: string;
    status: number;
    base_price: number;
    category_id: number;
    image_url: string;
    sold_count: number;
    shop_cate_id: number;
}

export interface ProductImageType {
    image_id: number;
    image_url: string;
    is_main: number;
}

export interface ProductReviewType {
    id: number;
    rating: number;
    comment: number;
    created_at: string;
    phone_number: string;
    email: string;
    avatar_url: string;
}

export interface ProductReviewSummaryType {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
    avg: number;
}

export interface ProductDetailsType {
    id: number,
    product_id: number,
    attribute: string,
    value: string,
}
export interface AttributeOfProductVariantsType {
    attribute: string,
    values: string[],
}