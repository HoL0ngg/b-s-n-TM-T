import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProductType } from "../types/ProductType";
import { apiGetForYouRecommendations, apiGetHotRecommendations, apiGetNewRecommendations } from "../api/products";
import ProductCard from "./ProductCard";

export default function HomeProduct() {
    const menuList = ["Dành cho bạn", "Hàng mới về", "Hàng hót"];
    const [selectedList, setSelectedList] = useState(0);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isActive = true;
        const loadProduct = async () => {
            try {
                setLoading(true);
                let data;
                switch (selectedList) {
                    case 0:
                        data = await apiGetForYouRecommendations();
                        break;
                    case 1:
                        data = await apiGetNewRecommendations();
                        break;
                    case 2:
                        data = await apiGetHotRecommendations();
                        break;
                }
                if (isActive) {
                    // Dữ liệu trả về có thể là mảng hoặc object { products: [...] } tùy API
                    // Nếu API trả về mảng trực tiếp thì gán luôn
                    if (Array.isArray(data)) {
                        setProducts(data);
                    } else if (data && Array.isArray(data.products)) {
                         setProducts(data.products);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.log(err);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        loadProduct();

        return () => {
            isActive = false;
        }
    }, [selectedList])

    const handleChangeMenu = (id: number) => {
        if (id == selectedList) return;
        setSelectedList(id);
    }
    return (
        <div className="container mb-4">
            <div className="d-flex align-items-center justify-content-center mt-5 gap-4">
                <div className="section-line" ></div>
                <div className="fs-1 text-center text-primary fw-bolder">
                    GỢI Ý HÔM NAY
                </div>
                <div className="section-line" ></div>
            </div>
            <div className="d-flex justify-content-center gap-4">
                {menuList.map((item, ind) => (
                    <div key={ind} className={ind == selectedList ? "text-primary fs-5 pointer user-select-none position-relative p-3 category-component" : "text-muted fs-5 pointer user-select-none position-relative p-3 category-component"} onClick={() => handleChangeMenu(ind)}>
                        {item}
                        {selectedList === ind && (
                            <motion.div
                                className="position-absolute bottom-0 start-0 end-0"
                                style={{ height: '2px', backgroundColor: '#ff7708' }}
                                layoutId="underline"
                                transition={{ type: 'spring', stiffness: 380, damping: 10 }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4 mt-2">
                {loading && (
                    <div className="loader-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
                {products.length > 0 ? (
                    products.map((product) => (
                        <div className="col" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))
                ) : (
                    <div className="w-100">
                        <p className="text-center fs-5">
                            Không có sản phẩm
                        </p>
                    </div>
                )}
            </div>
        </div >
    )
}