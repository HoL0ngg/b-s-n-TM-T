// Đường dẫn: frontend/src/pages/ProductDetail.tsx
// (PHIÊN BẢN SỬA LỖI MÀN HÌNH TRẮNG HOÀN CHỈNH)

import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ImageSlider from "../components/ImageSlider";
import { useState } from "react";
import type { ProductType, ProductImageType, ProductReviewType, ProductReviewSummaryType, ProductDetailsType, AttributeOfProductVariantsType } from "../types/ProductType";
import type { ShopType } from "../types/ShopType";
// Sửa lỗi gõ chữ và import (đã làm ở bước trước)
import { fetchProductsByID, fetchProductImg, fetchReviewByProductId, fetchReviewSummaryByProductId, fetchProductDetails, fetchAttributeOfProductVariants } from "../api/products";
import { fetchShop } from "../api/shop";
import ProductInfo from "../components/ProductInfo";
import { StarRating } from "../components/StarRating";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../utils/helper";
import { IoChevronBackCircleOutline } from "react-icons/io5";


const ProductDetail = () => {
    const [images, setImages] = useState<ProductImageType[]>([]);
    const [product, setProduct] = useState<ProductType>();
    const { id } = useParams<{ id: string | undefined }>();
    const [productReviews, setProductReviews] = useState<ProductReviewType[]>([]);

    // ===== BẮT ĐẦU SỬA LỖI 1 =====
    // Sửa state để chấp nhận `null`
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // ===== KẾT THÚC SỬA LỖI 1 =====

    const [shop, setShop] = useState<ShopType>();
    const [rating, setRating] = useState<number>(0);
    const [ratingSummary, setRatingSummary] = useState<ProductReviewSummaryType>({
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0, avg: 0.0
    });
    const [productDetails, setProductDetails] = useState<ProductDetailsType[]>([]);
    const [attributeOfProductVariants, setAttributeOfProductVariants] = useState<AttributeOfProductVariantsType[]>([]);
    const navigator = useNavigate();

    // (Các hàm loadProductDetails và loadAttributeOfProduct giữ nguyên)
    const loadProductDetails = async () => {
        if (!id) return;
        try {
            const data = await fetchProductDetails(Number(id));
            setProductDetails(data);
        } catch (error) {
            console.error(error);
        }
    }
    const loadAttributeOfProduct = async () => {
        if (!id) return;
        try {
            const data = await fetchAttributeOfProductVariants(Number(id));
            setAttributeOfProductVariants(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const loadProductAndShop = async () => {
            if (!id) return;
            try {
                const data = await fetchProductsByID(id); // (Đã sửa lỗi gõ chữ)
                console.log(data);

                setProduct(data);
                try {
                    const shopData = await fetchShop(data.shop_id);
                    const reviewData = await fetchReviewByProductId(data.id);
                    const hihi = await fetchReviewSummaryByProductId(data.id);
                    setRatingSummary(hihi);
                    setProductReviews(reviewData);
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
                const data = await fetchProductImg(id); // (Đã sửa lỗi gõ chữ)
                setImages(data);
                // Tự động set ảnh đầu tiên (hoặc ảnh main) làm ảnh được chọn
                if (data.length > 0) {
                    const mainImg = data.find(img => img.is_main === 1);
                    setSelectedImage(mainImg ? mainImg.image_url : data[0].image_url);
                }
            } catch (err) {
                console.error("Failed to fetch product images:", err);
            }
        };

        // Chạy các hàm load
        loadAttributeOfProduct();
        loadProductDetails();
        loadProductAndShop();
        loadProductImg();

        // ===== BẮT ĐẦU SỬA LỖI 3 =====
        // Xóa dòng code gây lỗi. Logic đã được chuyển vào `loadProductImg`.
        // setSelectedImage(mainProductImage); // <--- XÓA DÒNG NÀY
        // ===== KẾT THÚC SỬA LỖI 3 =====

    }, [id]); // Bỏ `mainProductImage` ra khỏi dependency array

    // ===== BẮT ĐẦU SỬA LỖI 2 =====
    // Sửa `useMemo` để nó phụ thuộc vào state `images` (đúng)
    // thay vì `product.images` (sai, vì `product` không chứa ảnh)
    const mainProductImage = useMemo(() => {
        if (!images || images.length === 0) { // Phụ thuộc vào state `images`
            return null;
        }
        const mainImg = images.find(img => img.is_main === 1); // Tìm trong state `images`
        if (mainImg) {
            return mainImg.image_url;
        }
        // Nếu không có ảnh main, lấy ảnh đầu tiên
        return images[0].image_url;
    }, [images]); // Dependency array là `images`
    // ===== KẾT THÚC SỬA LỖI 2 =====

    console.log(product);

    const reloadReview = async (hihi: number) => {
        if (!product?.id) return;
        try {
            const data = await fetchReviewByProductId(product.id, hihi);
            setProductReviews(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClick = () => {
        navigator(`/shop/${product?.shop_id}`)
    }

    const handleBack = () => {
        navigator(-1);
    }

    const formatPhone = (phone: string): string => {
        if (!phone) return "";
        const lastThreeDigits = phone.slice(-3);
        return "*******" + lastThreeDigits;
    }

    function formatCount(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'tr';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    }

    const handleChange = (id: number) => {
        if (id == rating) return;
        setRating(id);
        reloadReview(id);
    }

    const handleVariantImageChange = useCallback((newImageUrl: string) => {
        if (newImageUrl) {
            setSelectedImage(newImageUrl);
        }
    }, []);

    const handleThumbnailSelect = useCallback((image: string) => {
        setSelectedImage(image);
    }, []);


    if (!id) return <div><p>Thông tin sản phẩm không tồn tại</p></div>
    return (
        <div className="container mt-5 position-relative">
            <div className="position-absolute pointer top-0 start-0 translate-middle fs-2 text-muted" onClick={handleBack}><IoChevronBackCircleOutline /></div>
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-1">
                        <ImageSlider images={images} onSelect={handleThumbnailSelect} selectedImageUrl={selectedImage ? selectedImage : ""} />
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt="Selected"
                                style={{ width: "550px", height: "550px", objectFit: "cover", borderRadius: "10px" }}
                            />
                        ) : (
                            <p>Không có ảnh</p>
                        )}
                    </div>
                    <div className="col-12 col-md-5 border rounded border-2 pb-4">
                        {!product ? (
                            <p>Đang tải sản phẩm...</p>
                        ) : (
                            <ProductInfo product={product} attributes={attributeOfProductVariants} onVariantImageChange={handleVariantImageChange} />
                        )}
                    </div>
                </div >

            </div>

            {/* (Phần code hiển thị shop, chi tiết, mô tả... giữ nguyên) */}

            <div className="row mt-4 p-3">
                <div className="col-7">
                    <div className="fw-bold fs-4">Chi tiết sản phẩm</div>
                    {productDetails.length > 0 ? (
                        productDetails.map((productDetail) => (
                            <div className="border-bottom py-2" key={productDetail.id}>
                                <div className="row">
                                    <div className="col-3 fw-bold">{productDetail.attribute}</div>
                                    <div className="col-9 text-muted">{productDetail.value}</div>
                                </div>
                            </div>
                        ))
                    )
                        :
                        (
                            <div>
                                <p>Khong co chi tiet sp</p>
                            </div>
                        )}
                    <div className="fw-bold fs-4">Mô tả sản phẩm</div>
                    <div className="product-description"> {/* <-- 1. Đặt một class cha ở đây */}
                        <div dangerouslySetInnerHTML={{ __html: product?.description || '' }} />
                    </div>
                </div>
                <div className="col-5">
                    <div className="p-4 border rounded">
                        <div className="d-flex align-items-center">
                            <div className="">
                                <img src={shop?.logo_url ? shop.logo_url.toString() : undefined} alt="" className="rounded-circle" style={{ height: "70px", width: "70px" }} />
                            </div>
                            <div className="ms-3">
                                <div className="fs-4 fw-bolder text-primary">{shop?.name}</div>
                                <div className="btn custom-btn w-100 mt-1" onClick={handleClick}>Xem shop</div>
                            </div>
                        </div>
                        <div className="row p-3 text-center">
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
            </div>
            <div className="row mt-4 p-3 rounded shadow-sm">
                <div className="fw-bold fs-4">Mô tả sản phẩm</div>
                <div>{product?.description}</div>
            </div>

            <div className="container mt-4 bg-light p-4">
                <div className="fs-4">Đánh giá sản phẩm</div>
                <div className="p-4 mt-2 d-flex align-items-center justify-content-center" style={{ background: "#fff5edff", border: "1px solid #ffb98aff" }}>
                    <div className="col-3">
                        <div className="text-center text-primary"><span className="fs-3">{ratingSummary.avg}</span> trên 5</div>
                        <div className="text-center text-primary"><StarRating rating={ratingSummary.avg} size="32px" /></div>
                    </div>
                    <div className="col-9 d-flex flex-wrap gap-4">
                        <div className={rating == 0 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(0)}>Tất cả ({ratingSummary.total})</div>
                        <div className={rating == 5 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(5)}>5 sao ({formatCount(ratingSummary[5])})</div>
                        <div className={rating == 4 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(4)}>4 sao ({formatCount(ratingSummary[4])})</div>
                        <div className={rating == 3 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(3)}>3 sao ({formatCount(ratingSummary[3])})</div>
                        <div className={rating == 2 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(2)}>2 sao ({formatCount(ratingSummary[2])})</div>
                        <div className={rating == 1 ? "border border-primary px-4 py-1 text-primary" : "border border-primary px-4 py-1 bg-light"} style={{ cursor: 'pointer' }} onClick={() => handleChange(1)}>1 sao ({formatCount(ratingSummary[1])})</div>
                    </div>
                </div>
                {productReviews.length > 0 ? productReviews.map((review) => (
                    <div className="d-flex p-4" key={review.id}>
                        <div><img src={review?.avatar_url ? review.avatar_url.toString() : undefined} alt="" className="rounded-circle" style={{ height: "50px", width: "50px" }} /></div>
                        <div className="ms-4" >
                            <div className="fw-bolder">{formatPhone(review.phone_number)}</div>
                            <StarRating rating={review.rating} size="22px" />
                            <div className="text-muted fs-6">{review?.created_at
                                ? new Date(review.created_at.toString()).toLocaleDateString("vi-VN")
                                : "Đang tải ..."}</div>
                            <div>{review.comment}</div>
                        </div>
                    </div>
                )) : (
                    <div className="fs-4 text-center mt-4">Chưa có đánh giá b ei</div>
                )}
            </div>
        </div >

    );
};

export default ProductDetail;