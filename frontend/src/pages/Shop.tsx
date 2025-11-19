import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchShop, fetchCateByShopId } from "../api/shop";
import { fetch5ProductByShopId, fetchProductsByShopId } from "../api/products";
import type { ShopType, ShopCateType } from "../types/ShopType";
import type { ProductType } from "../types/ProductType";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { formatTimeAgo } from "../utils/helper";

const Shop = () => {

    const { id } = useParams<{ id: string | undefined }>();
    const [shop, setShop] = useState<ShopType>();
    const [suggestedProducts, setSuggestedProducts] = useState<ProductType[]>([]);
    const [productList, setProductList] = useState<ProductType[]>([]);
    const [shopCateList, setShopCateList] = useState<ShopCateType[]>([]);
    const [curShopCate, setCurShopCate] = useState<number>(0);
    const [curState, setCurState] = useState<number>(1);

    const daoCategory = { id: 0, name: 'Dạo' };
    const fullCateList = useMemo(() => {
        // Nếu shopCateList chưa có, chỉ trả về mảng có "Dạo"
        if (!shopCateList) {
            return [daoCategory];
        }
        // Nối object "Dạo" vào đầu mảng shopCateList
        return [daoCategory, ...shopCateList];
    }, [shopCateList]); // Chỉ tính toán lại khi shopCateList thay đổi

    useEffect(() => {
        const loadShopAndProduct = async () => {
            if (!id) return;
            try {
                const data = await fetchShop(Number(id));

                setShop(data);
                try {
                    const hihi = await fetch5ProductByShopId(Number(data.id));
                    const listCate = await fetchCateByShopId(Number(data.id));
                    setShopCateList(listCate);
                    setSuggestedProducts(hihi);
                } catch (err) {
                    console.log(err);
                }
            } catch (err) {
                console.log(err);
            }
        }
        loadShopAndProduct();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const loadProducts = async () => {
            try {
                // API này sẽ nhận 'shopId' và 'cate' (giống hệt
                // hàm 'getProductOnShopIdService' bạn đã viết)
                const hehe = await fetchProductsByShopId(Number(id), curState, curShopCate);
                setProductList(hehe);
            } catch (err) {
                console.error("Lỗi tải sản phẩm:", err);
            }
        };

        loadProducts();
    }, [id, curState, curShopCate]);

    const handleChangeState = (id: number) => {
        if (id === curState) return;
        setCurState(id);
    }

    const handleChangeCate = (id: number) => {
        if (id === curShopCate) return;
        setCurShopCate(id);
    }

    // const handleChangePriceState = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const value = e.target.value;
    //     if (value === curPriceState) return;
    //     setCurPriceState(value);
    // };

    const bgStyle: React.CSSProperties = {
        position: "relative",
        backgroundImage: shop?.logo_url ? `url(${shop.logo_url})` : 'none',
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        zIndex: -2,
    };
    const overlayStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: -1,
    };
    return (
        <>
            <div className="container w-75 p-4 pb-0">
                <div className="row">
                    <div className="col-4 p-2 rounded" style={bgStyle}>
                        <div style={overlayStyle}></div>
                        <div className="d-flex gap-4">
                            <div>
                                <img src={shop?.logo_url ? shop.logo_url.toString() : undefined} alt="" className="rounded-circle border border-4" style={{ height: "80px", width: "80px" }} />
                            </div>
                            <div>
                                <div className="fs-4 text-white">{shop?.name}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="row p-3 text-center justify-content-center align-items-center h-100">
                            <div className="col-4">
                                <div className="text-muted mt-2">Sản phẩm</div>
                                <div className="text-primary fw-semibold mt-2">{shop?.totalProduct ? shop.totalProduct : 0}</div>
                            </div>
                            <div className="col-4 ps-4 border-start">
                                <div className="text-muted">Đánh giá </div>
                                <div className="text-primary fw-semibold mt-2">{shop?.avgRating ? Number(shop.avgRating).toFixed(2) : 0} ⭐</div>
                            </div>
                            <div className="col-4 ps-4 border-start">
                                <div className="text-muted">Tham gia</div>
                                <div className="text-primary fw-semibold mt-2">
                                    {formatTimeAgo(shop?.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="d-flex p-0 flex-nowrap text-center position-relative">
                        {fullCateList?.map((item) => (
                            <div
                                // 4. Gán ref cho từng item
                                key={Number(item.id)}
                                // Bỏ class border, chỉ giữ lại class active cho text
                                className={curShopCate === item.id ? "p-3 text-primary position-relative category-component" : "p-3 category-component position-relative"}
                                style={{ minWidth: '15%', cursor: 'pointer', textAlign: 'center' }}
                                onClick={() => handleChangeCate(Number(item.id))}
                            >
                                {item.name}
                                {curShopCate === item.id && (
                                    // 3. Sử dụng motion.div và layoutId
                                    <motion.div
                                        className="position-absolute bottom-0 start-0 end-0"
                                        style={{ height: '2px', backgroundColor: '#ff7708' }}
                                        // layoutId là "chìa khóa" để Framer Motion hiểu đây là cùng một element
                                        layoutId="underline"
                                        // Tùy chỉnh hiệu ứng (ví dụ: spring)
                                        transition={{ type: 'spring', stiffness: 380, damping: 10 }}
                                    />
                                )}
                            </div>
                        ))}
                        {/* <div className="p-3 category-component" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component" style={{ minWidth: '10%' }}>Thêm</div> */}

                    </div>
                </div>
            </div>
            <div className="bg-light w-100">
                <div className="container w-75 p-4">
                    <div className="text-muted m-2">
                        Gợi ý cho bạn
                    </div>
                    <div className="d-flex gap-4">
                        {suggestedProducts.length > 0 ? (
                            suggestedProducts.map((product) => (
                                <div className="col" key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <div className="w-100">
                                <p className="text-center fs-5">
                                    Không có sản phẩm nào trong danh mục
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="row mt-4">
                        <div className="col-2 mt-2">
                            <i className="me-2 fa-solid fa-list-ul"></i>
                            Danh mục
                        </div>
                        <div className="col-10">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted align-middle">Sắp xếp theo</span>
                                    <span className={curState == 1 ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleChangeState(1)}>Phổ biến nhất</span>
                                    <span className={curState == 2 ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleChangeState(2)}>Mới nhất</span>
                                    <span className={curState == 3 ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleChangeState(3)}>Bán chạy</span>
                                    {/* <select className="form-select" style={{ maxWidth: "25%" }} value={curPriceState} onChange={handleChangePriceState}>
                                        <option value="0">Giá</option>
                                        <option value="1">Thấp đến cao</option>
                                        <option value="2">Cao đến thấp</option>
                                    </select> */}
                                </div>
                                <div>
                                    <span className="text-primary">1</span>/<span>2</span>
                                    <span className="ms-4 border border-2 py-1 px-2"><i className="fa-solid fa-less-than fa-xs text-muted"></i></span>
                                    <span className="border border-2 py-1 px-2"><i className="fa-solid fa-greater-than fa-xs"></i></span>
                                </div>
                            </div>
                            <div className="row mt-4 g-4">
                                {productList.map((product) => (
                                    <div className="col-6 col-md-3" key={product.id}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shop;