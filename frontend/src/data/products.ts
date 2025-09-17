// src/data/products.ts
export type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
};

export const products: Product[] = [
    { id: 1, name: "iPhone 15", price: 1000, category: "Phone", image: "https://via.placeholder.com/150" },
    { id: 2, name: "MacBook Pro", price: 2000, category: "Laptop", image: "https://via.placeholder.com/150" },
    { id: 3, name: "AirPods Pro", price: 250, category: "Accessory", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Samsung S23", price: 900, category: "Phone", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Dell XPS 13", price: 1500, category: "Laptop", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Logitech Mouse", price: 50, category: "Accessory", image: "https://via.placeholder.com/150" },
    // thêm vài cái nữa để test phân trang
    { id: 7, name: "Sony WH-1000XM5", price: 400, category: "Accessory", image: "https://via.placeholder.com/150" },
    { id: 8, name: "Asus ROG", price: 2200, category: "Laptop", image: "https://via.placeholder.com/150" },
    { id: 9, name: "Google Pixel 8", price: 800, category: "Phone", image: "https://via.placeholder.com/150" },
    { id: 10, name: "iPad Pro", price: 1200, category: "Tablet", image: "https://via.placeholder.com/150" },
];
