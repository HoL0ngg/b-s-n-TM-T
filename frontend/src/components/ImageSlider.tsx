
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import { FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
                    // 1024: {
                    //     direction: 'vertical',
                    //     slidesPerView: 4,
                    //     spaceBetween: 10
                    // }
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
                <FaChevronDown className="icon-vertical" />
                <FaChevronRight className="icon-horizontal" />
            </button>
        </div >
    );
}

export default ImageSlider;