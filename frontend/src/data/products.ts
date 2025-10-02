// src/data/products.ts
export type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
};

export const products: Product[] = [
    { id: 1, name: "iPhone 15", price: 1000, category: "quan", image: "https://via.placeholder.com/150" },
    { id: 2, name: "MacBook Pro", price: 2000, category: "ao", image: "https://via.placeholder.com/150" },
    { id: 3, name: "AirPods Pro", price: 250, category: "quan", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Samsung S23", price: 900, category: "Phone", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Dell XPS 13", price: 1500, category: "Laptop", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Logitech Mouse", price: 50, category: "quan", image: "https://via.placeholder.com/150" },
    // thêm vài cái nữa để test phân trang
    { id: 7, name: "Sony WH-1000XM5", price: 400, category: "quan", image: "https://via.placeholder.com/150" },
    { id: 8, name: "Asus ROG", price: 2200, category: "Laptop", image: "https://via.placeholder.com/150" },
    { id: 9, name: "Google Pixel 8", price: 800, category: "Phone", image: "https://via.placeholder.com/150" },
    { id: 10, name: "iPad Pro", price: 1200, category: "Tablet", image: "https://via.placeholder.com/150" },
];
export type Category = {
    id: string;
    name: string;
    image: string;
}
export const categories: Category[] = [
    { id: "quan", name: "Quần", image: "/assets/logo.jpg" },
    { id: "ao", name: "Áo", image: "/assets/logo.jpg" },
    { id: "giay", name: "Giày", image: "/assets/logo.jpg" },
    { id: "giay1", name: "Giày", image: "/assets/logo.jpg" },
    { id: "giay2", name: "Giày", image: "/assets/logo.jpg" },
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
