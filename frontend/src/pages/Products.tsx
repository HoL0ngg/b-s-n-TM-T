// src/pages/Products.tsx
import React, { useState, useMemo } from "react";
import { products, type Product } from "../data/products";  // Data tạm thời hardcode, mốt sẽ xóa
import Pagination from "../components/Pagination";
import Breadcrumbs from "../components/Breadcrumb";

// Mốt sẽ fetch từ backend
const categories = ["All", "Phone", "Laptop", "Accessory", "Tablet"];

const Products: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 4;

    // lọc sản phẩm
    const filteredProducts = useMemo(() => {
        return selectedCategory === "All"
            ? products
            : products.filter((p) => p.category === selectedCategory);
    }, [selectedCategory]);

    // phân trang
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const displayedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <Breadcrumbs />
            <div className="container mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Categories</h5>
                        <ul className="list-group">
                            {categories.map((cat) => (
                                <li key={cat} className="list-group-item p-0">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setCurrentPage(1);
                                        }}
                                        className={`btn w-100 text-start ${selectedCategory === cat
                                            ? "bg-primary text-white"
                                            : "btn-light"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product list */}
                    <div className="col-md-9">
                        <h2 className="mb-4">Products</h2>
                        <div className="row g-4">
                            {displayedProducts.map((p: Product) => (
                                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                                    <div className="card h-100 shadow-sm">
                                        <img
                                            src={p.image}
                                            className="card-img-top"
                                            alt={p.name}
                                            style={{ height: "150px", objectFit: "cover" }}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h6 className="card-title">{p.name}</h6>
                                            <p className="card-text text-muted">${p.price}</p>
                                            <button className="btn btn-outline-primary mt-auto">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div ></>

    );
};

export default Products;
