import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { ProductImageType } from "../types/ProductType";

type ImageSliderProps = {
    images: ProductImageType[];
    onSelect: (img: string) => void;
    selectedImageUrl: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect, selectedImageUrl }) => {

    const getImageUrl = (url: string | undefined) => {
        if (!url) return 'https://via.placeholder.com/150?text=No+Image';

        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }

        if (url.startsWith('/uploads')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            return `${baseUrl}${url}`;
        }

        return url;
    };
    // ==========================================================

    return (
        <div className="custom-slider-wrapper">

            {/* 2. TẠO NÚT BẤM PREV (Nằm ngoài Swiper) */}
            <button id="my-custom-prev-button" className="custom-swiper-nav">
                <FaChevronUp className="icon-vertical" />
                <FaChevronLeft className="icon-horizontal" />
            </button>

            <Swiper
                modules={[Navigation]}
                direction={'horizontal'}
                spaceBetween={1}
                slidesPerView={2}
                className="myVerticalSwiper"
                // 3. BẢO SWIPER DÙNG CÁC NÚT TÙY CHỈNH
                navigation={{
                    prevEl: '#my-custom-prev-button',
                    nextEl: '#my-custom-next-button',
                }}

                breakpoints={{
                    768: {
                        direction: 'vertical',
                        slidesPerView: 4,
                        spaceBetween: 10,
                    },
                }}
            >
                {images.map((img) => {
                    // Lưu ý: Khi so sánh để highlight viền đỏ, cũng cần so sánh URL đã xử lý
                    // Tuy nhiên, logic cũ của bạn đang so sánh raw string, cứ giữ nguyên logic so sánh
                    // Chỉ sửa phần hiển thị src bên dưới thôi.
                    const isActive = img.image_url === selectedImageUrl;
                    
                    return (
                        <SwiperSlide key={img.image_id} className="text-center">
                            <div
                                className="col p-2 img-hover-zoom"
                                onClick={() => onSelect(img.image_url)}
                            >
                                <img
                                    // SỬA 1: Dùng hàm getImageUrl bọc lấy url
                                    src={getImageUrl(img.image_url)}
                                    alt=""
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        objectFit: "cover", // Thêm cái này cho ảnh đẹp
                                        border: isActive ? "3px solid red" : "1px solid #ccc"
                                    }}
                                    // SỬA 2: Thêm chống lỗi ảnh (onError) để không bị treo máy
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' dominant-baseline='middle' text-anchor='middle'%3EError%3C/text%3E%3C/svg%3E";
                                        target.onerror = null;
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* 4. TẠO NÚT BẤM NEXT (Nằm ngoài Swiper) */}
            <button id="my-custom-next-button" className="custom-swiper-nav">
                <FaChevronDown className="icon-vertical" />
                <FaChevronRight className="icon-horizontal" />
            </button>
        </div >
    );
}

export default ImageSlider;