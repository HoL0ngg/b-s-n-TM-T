import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchShop } from "../api/shop";
import { fetch5ProductByShopId } from "../api/products";
import type { ShopType } from "../types/ShopType";
import type { ProductType } from "../types/ProductType";
import ProductCard from "../components/ProductCard";

const Shop = () => {

    const { id } = useParams<{ id: string | undefined }>();
    const [shop, setShop] = useState<ShopType>();
    const [suggestedProducts, setSuggestedProducts] = useState<ProductType[]>([]);
    useEffect(() => {
        const loadShopAndProduct = async () => {
            if (!id) return;
            try {
                const data = await fetchShop(Number(id));

                setShop(data);
                try {
                    const hihi = await fetch5ProductByShopId(data.id);
                    console.log(hihi);

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
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(2px)",
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
                                <div className="text-muted">Online 1 phút trc</div>
                            </div>
                        </div>
                        <div>
                            <div className="btn btn-primary w-100 mt-2">+ Theo dõi</div>
                        </div>
                    </div>
                    <div className="col-4 d-flex justify-content-around flex-column px-4">
                        <div>Sản phẩm</div>
                        <div>Đang theo dõi</div>
                        <div>Tỉ lệ phản hồi</div>
                    </div>
                    <div className="col-4 d-flex justify-content-around flex-column px-4">
                        <div>Người theo dõi</div>
                        <div>Đánh giá</div>
                        <div>Tham gia</div>
                    </div>
                </div>
                <div className="row">
                    <div className="d-flex p-0 flex-nowrap text-center">
                        <div className="p-3 border-bottom border-2 border-primary text-primary" style={{ minWidth: '15%' }}>Dạo</div>
                        <div className="p-3" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3" style={{ minWidth: '10%' }}>Thêm</div>

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
                    <div className="row align-items-center mt-4">
                        <div className="col-2">
                            <i className="me-2 fa-solid fa-list-ul"></i>
                            Danh mục
                        </div>
                        <div className="col-10">
                            <div className="d-flex align-items-center gap-2 justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted align-middle">Sắp xếp theo</span>
                                    <span className="btn btn-primary">Phổ biến nhất</span>
                                    <span className="btn btn-secondary">Mới nhất</span>
                                    <span className="btn btn-secondary">Bán chạy</span>
                                    <select className="form-select" style={{ maxWidth: "20%" }}>
                                        <option value="0" selected>Giá</option>
                                        <option value="1">Thấp đến cao</option>
                                        <option value="2">Cao đến thấp</option>
                                    </select>
                                </div>
                                <div>
                                    <span className="text-primary">1</span>/<span>2</span>
                                    <span className="ms-4 border border-2 py-1 px-2"><i className="fa-solid fa-less-than fa-xs text-muted"></i></span>
                                    <span className="border border-2 py-1 px-2"><i className="fa-solid fa-greater-than fa-xs"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shop;