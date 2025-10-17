import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageSlider from "../components/ImageSlider";
import { useState } from "react";
import type { ProductType, ProductImageType } from "../types/ProductType";
import type { ShopType } from "../types/ShopType";
import { fecthProductsByID, fecthProductImg } from "../api/products";
import { fetchShop } from "../api/shop";
import ProductInfo from "../components/ProductInfo";
import { StarRating } from "../components/StarRating";


const ProductDetail = () => {
    const [product, setProduct] = useState<ProductType>();
    const { id } = useParams<{ id: string | undefined }>();
    const [images, setImages] = useState<ProductImageType[]>([]);
    const [selectedImage, setSelectedImage] = useState<ProductImageType>();
    const [shop, setShop] = useState<ShopType>()
    useEffect(() => {
        const loadProductAndShop = async () => {
            if (!id) return;
            try {
                const data = await fecthProductsByID(id);
                setProduct(data);
                // Fetch shop using the shop_id from the fetched product immediately
                try {
                    const shopData = await fetchShop(data.shop_id);
                    setShop(shopData);
                } catch (shopErr) {
                    console.error("Failed to fetch shop:", shopErr);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const loadProductImg = async () => {
            if (!id) return;
            try {
                const data = await fecthProductImg(id);
                setImages(data);
                if (data.length > 0) {
                    setSelectedImage(data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch product images:", err);
            }
        };

        loadProductAndShop();
        loadProductImg();
    }, [id]);
    if (!id) return <div><p>Thông tin sản phẩm không tồn tại</p></div>
    return (
        <div className="container mt-5">
            <div className="container">
                <div className="row">
                    {/* <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center">
                        <div>
                            {selectedImage ? (
                                <img
                                    src={selectedImage.image_url}
                                    alt="Selected"
                                    className="rounded"
                                    style={{
                                        width: "100%",
                                        maxHeight: "500px",
                                        objectFit: "contain",
                                        borderRadius: "10px",
                                    }}
                                />
                            ) : (
                                <p>Không có ảnh</p>
                            )}
                        </div>
                        <div className="col-12 border-red position-relative mt-3" style={{ width: "100%" }}>
                            <ImageSlider
                                images={images}
                                onSelect={(id: number) => {
                                    const img = images.find(img => img.image_id === id);
                                    if (img) setSelectedImage(img);
                                }}

                                selectedImageId={selectedImage ? selectedImage.image_id : null} />
                        </div>
                    </div> */}
                    <div className="col-12 col-md-1 border-red">
                        <ImageSlider images={images} onSelect={setSelectedImage} selectedImageId={selectedImage} />
                    </div>
                    {/* <div className="col-12 col-md-6 border">
                        <div className="col-5 d-flex align-items-center justify-content-center">
                            {selectedImage ? (
                                <img
                                    src={selectedImage.image_url}
                                    alt="Selected"
                                    // className="rounded"
                                    style={{ width: "450px", height: "450px", objectFit: "cover", borderRadius: "10px" }}
                                />
                            ) : (
                                <p>Không có ảnh</p>
                            )}
                        </div>
                        <div className="col-6 border rounded border-2">
                            {!product ? (
                                <p>Đang tải sản phẩm...</p>
                            ) : (
                                <>
                                    <ProductInfo product={product} />
                                    <div>
                                        <button className="custom-button-addtocart">
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div> */}
                    <div className="col-12 col-md-5 d-flex align-items-center justify-content-center">
                        {selectedImage ? (
                            <img
                                src={selectedImage.image_url}
                                alt="Selected"
                                // className="rounded"
                                style={{ width: "450px", height: "450px", objectFit: "cover", borderRadius: "10px" }}
                            />
                        ) : (
                            <p>Không có ảnh</p>
                        )}
                    </div>
                    <div className="col-12 col-md-6 border rounded border-2 pb-4">
                        {!product ? (
                            <p>Đang tải sản phẩm...</p>
                        ) : (
                            <>
                                <ProductInfo product={product} />
                                <div className="d-flex gap-4 align-items-center">
                                    <button className="custom-button-addtocart">
                                        Thêm vào giỏ hàng
                                    </button>
                                    <button className="custom-button-buynow">
                                        Mua ngay
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div >

            </div>
            <div className="container border mt-4 d-flex p-4 rounded shadow gap-4">
                <div className="">
                    <img src={shop?.logo_url ? shop.logo_url.toString() : undefined} alt="" className="rounded-circle" style={{ height: "100px", width: "100px" }} />
                </div>
                <div className="">
                    <div className="fs-4">{shop?.name}</div>
                    <div className="text-muted">online 10 phút trc</div>
                    <div className="d-flex gap-2">
                        <div className="btn btn-primary"><i className="fa-solid fa-plus"></i> Theo dõi</div>
                        <div className="btn btn-secondary">Xem shop</div>
                    </div>
                </div>
                <div className="border-start d-flex gap-4 justify-content-between flex-fill p-3">
                    <div>
                        <div className="text-muted">Đánh giá </div>
                        <div className="text-muted mt-2">Sản phẩm</div>
                    </div>
                    <div>
                        <div className="text-muted">Tỉ lệ phản hồi</div>
                        <div className="text-muted mt-2">Thời gian phản hồi</div>
                    </div>
                    <div>
                        <div className="text-muted">Tham gia: <span className="text-primary">{shop?.created_at
                            ? new Date(shop.created_at.toString()).toLocaleDateString("vi-VN")
                            : "Đang tải ..."}</span></div>
                        <div className="text-muted mt-2">Người theo dõi</div>
                    </div>
                </div>
            </div>
            <div className="row mt-4 p-3 rounded shadow-sm">
                <span className="fw-bold fs-4">Chi tiết sản phẩm</span>
            </div>

            <div className="container mt-4 bg-light p-4">
                <div className="fs-4">Đánh giá sản phẩm</div>
                <div className="p-4 mt-2 d-flex align-items-center justify-content-center" style={{ background: "#fff5edff", border: "1px solid #ffb98aff" }}>
                    <div className="col-3">
                        <div className="text-center text-primary"><span className="fs-3">4.7</span> trên 5</div>
                        <div className="text-center text-primary"><StarRating rating={4.7} /></div>
                    </div>
                    <div className="col-9 d-flex flex-wrap gap-4">
                        <div className="border border-primary px-4 py-1 text-primary">Tất cả</div>
                        <div className="border border-primary px-4 py-1 bg-light">5 sao (10k)</div>
                        <div className="border border-primary px-4 py-1 bg-light">4 sao (20k)</div>
                        <div className="border border-primary px-4 py-1 bg-light">3 sao (100)</div>
                        <div className="border border-primary px-4 py-1 bg-light">2 sao</div>
                        <div className="border border-primary px-4 py-1 bg-light">1 sao</div>
                        <div className="border border-primary px-4 py-1 bg-light">Có bình luận</div>
                        <div className="border border-primary px-4 py-1 bg-light">Có hình ảnh/video</div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProductDetail;
