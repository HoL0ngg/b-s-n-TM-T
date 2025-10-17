import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchShop } from "../api/shop";
import { fetch5ProductByShopId, fetchProductsByShopId } from "../api/products";
import type { ShopType } from "../types/ShopType";
import type { ProductType } from "../types/ProductType";
import ProductCard from "../components/ProductCard";

const Shop = () => {

    const { id } = useParams<{ id: string | undefined }>();
    const [shop, setShop] = useState<ShopType>();
    const [suggestedProducts, setSuggestedProducts] = useState<ProductType[]>([]);
    // const [currentCate, setCurrentCate] = useState<number>(1);
    const [productList, setProductList] = useState<ProductType[]>([]);
    const [curState, setCurState] = useState<number>(1);
    // const [curPriceState, setCurPriceState] = useState<string>("0");
    useEffect(() => {
        const loadShopAndProduct = async () => {
            if (!id) return;
            try {
                const data = await fetchShop(Number(id));

                setShop(data);
                try {
                    const hihi = await fetch5ProductByShopId(data.id);
                    const hehe = await fetchProductsByShopId(data.id, curState);
                    console.log(hehe);

                    setSuggestedProducts(hihi);
                    setProductList(hehe);
                } catch (err) {
                    console.log(err);
                }
            } catch (err) {
                console.log(err);
            }
        }
        loadShopAndProduct();
    }, [id, curState]);

    const handleChangeState = (id: number) => {
        if (id === curState) return;
        setCurState(id);
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
                                <div className="text-info">Online 1 phút trc</div>
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
                        <div className="p-3 border-bottom border-2 border-primary text-primary category-component" style={{ minWidth: '15%' }}>Dạo</div>
                        <div className="p-3 category-component" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component active" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component" style={{ minWidth: '15%' }}>Sản phẩm</div>
                        <div className="p-3 category-component" style={{ minWidth: '10%' }}>Thêm</div>

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