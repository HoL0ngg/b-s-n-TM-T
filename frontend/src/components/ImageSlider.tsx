
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import type { ProductImageType } from "../types/ProductType";

type ImageSliderProps = {
    images: ProductImageType[];
    onSelect: (img: ProductImageType) => void;
    selectedImageId?: ProductImageType;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect, selectedImageId }) => {
    return (
        <div className="custom-slider-wrapper">

            {/* 2. TẠO NÚT BẤM PREV (Nằm ngoài Swiper) */}
            <button id="my-custom-prev-button" className="custom-swiper-nav">
                <FaChevronUp /> {/* 👈 Chèn icon của bạn ở đây */}
            </button>

            <Swiper
                modules={[Navigation]}
                direction={'vertical'}
                spaceBetween={10}
                slidesPerView={4}
                className="myVerticalSwiper"
                // 3. BẢO SWIPER DÙNG CÁC NÚT TÙY CHỈNH
                navigation={{
                    prevEl: '#my-custom-prev-button', // 👈 Selector của nút prev
                    nextEl: '#my-custom-next-button', // 👈 Selector của nút next
                }}
            >
                {images.map((img) => {
                    const isActive = img.image_id === selectedImageId?.image_id;
                    return (
                        <SwiperSlide key={img.image_id} className="text-center">
                            <div
                                className="col p-2 img-hover-zoom"
                                onClick={() => onSelect(img)}
                            >
                                <img
                                    src={img.image_url}
                                    alt=""
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        border: isActive ? "3px solid red" : "1px solid #ccc"
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* 4. TẠO NÚT BẤM NEXT (Nằm ngoài Swiper) */}
            <button id="my-custom-next-button" className="custom-swiper-nav">
                <FaChevronDown /> {/* 👈 Chèn icon của bạn ở đây */}
            </button>
        </div >
    );
}

export default ImageSlider;