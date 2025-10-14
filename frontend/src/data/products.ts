// src/data/products.ts
export type Product = {
    id: number;
    name: string;
    price: number;
    category: Number;
    image: string;
};

export const products: Product[] = [
    { id: 1, name: "iPhone 15", price: 1000, category: 2, image: "https://via.placeholder.com/150" },
    { id: 2, name: "MacBook Pro", price: 2000, category: 3, image: "https://via.placeholder.com/150" },
    { id: 3, name: "AirPods Pro", price: 250, category: 2, image: "https://via.placeholder.com/150" },
    { id: 4, name: "Samsung S23", price: 900, category: 1, image: "https://via.placeholder.com/150" },
    { id: 5, name: "Dell XPS 13", price: 1500, category: 1, image: "https://via.placeholder.com/150" },
    { id: 6, name: "Logitech Mouse", price: 50, category: 2, image: "https://via.placeholder.com/150" },
    // thêm vài cái nữa để test phân trang
    { id: 7, name: "Sony WH-1000XM5", price: 400, category: 2, image: "https://via.placeholder.com/150" },
    { id: 8, name: "Asus ROG", price: 2200, category: 1, image: "https://via.placeholder.com/150" },
    { id: 9, name: "Google Pixel 8", price: 800, category: 1, image: "https://via.placeholder.com/150" },
    { id: 10, name: "iPad Pro", price: 1200, category: 4, image: "https://via.placeholder.com/150" },
];

type Image = {
    image_id: number;
    image_url: string;
    product_id: number;
}

export const images: Image[] = [
    { image_id: 1, image_url: "/assets/logo.jpg", product_id: 1 },
    { image_id: 2, image_url: "/assets/logo1.png", product_id: 1 },
    { image_id: 3, image_url: "/assets/logo.jpg", product_id: 1 },
    { image_id: 4, image_url: "/assets/logo.jpg", product_id: 1 },
]