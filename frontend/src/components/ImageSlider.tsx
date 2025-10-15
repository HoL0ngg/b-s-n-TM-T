import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper.css";

type Image = {
    image_id: number;
    image_url: string;
    product_id: number;
};

type ImageSliderProps = {
    images: Image[];
    onSelect: (id: number) => void;
    selectedImageId: number | null;
};

const ImageSlider: React.FC<ImageSliderProps> = ({
    images,
    onSelect,
    selectedImageId,
}) => {
    return (
        <div className="image-slider-container position-relative">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={4}
                navigation={{
                    prevEl: ".custom-button-prev",
                    nextEl: ".custom-button-next",
                }}
                breakpoints={{
                    320: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                }}
                className="mySwiper"
                style={{
                    height: "100%",
                    maxHeight: "500px",
                    width: "100%",
                }}
            >
                {images.map((img) => {
                    const isActive = img.image_id === selectedImageId;
                    return (
                        <SwiperSlide
                            key={img.image_id}
                            style={{ display: "flex", justifyContent: "center" }}
                            onClick={() => onSelect(img.image_id)}
                        >
                            <img
                                src={img.image_url}
                                alt=""
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    border: isActive ? "3px solid red" : "1px solid #ccc",
                                    objectFit: "cover",
                                }}
                            />
                        </SwiperSlide>
                    );
                })}
                <div className="custom-button-prev shadow-sm p-1 btn-hover-scale">
                    <i className="fa-solid fa-less-than"></i>
                </div>
                <div className="custom-button-next shadow-sm p-1 btn-hover-scale">
                    <i className="fa-solid fa-greater-than"></i>
                </div>
            </Swiper>
        </div>
    );
};

export default ImageSlider;
