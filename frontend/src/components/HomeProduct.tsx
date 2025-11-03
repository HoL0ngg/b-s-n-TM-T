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
                    setProducts(data);
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
            // Khi 'selectedList' thay đổi, effect cũ sẽ bị hủy
            // và hàm này chạy, tắt cờ 'isActive'
            isActive = false;
        }
    }, [selectedList])

    const handleChangeMenu = (id: number) => {
        if (id == selectedList) return;

        setSelectedList(id);
    }
    return (
        <div className="container">
            <div className="fs-1 text-center text-primary mt-5 fw-bolder">
                GỢI Ý HÔM NAY
            </div>
            <div className="d-flex justify-content-center gap-4">
                {menuList.map((item, ind) => (
                    <div className={ind == selectedList ? "text-primary fs-5 pointer user-select-none position-relative p-3 category-component" : "text-muted fs-5 pointer user-select-none position-relative p-3 category-component"} onClick={() => handleChangeMenu(ind)}>
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
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4 mt-4">
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