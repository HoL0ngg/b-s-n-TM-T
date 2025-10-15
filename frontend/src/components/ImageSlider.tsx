import React, { useState } from "react";
import type { ProductImageType } from "../types/ProductType";

type ImageSliderProps = {
    images: ProductImageType[];
    onSelect: (img: ProductImageType) => void;
    selectedImageId?: ProductImageType;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect, selectedImageId }) => {
    return (
        <div className="container text-center">
            {images.length > 0 ? (
                images.map((img) => {
                    const isActive = img.image_id === selectedImageId?.image_id;
                    return (
                        <div
                            className="col p-2 img-hover-zoom"
                            onClick={() => onSelect(img)}
                            key={img.image_id}
                        >
                            <img
                                // className="custom-Image"
                                src={img.image_url}
                                alt=""
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    border: isActive ? "3px solid red" : "1px solid #ccc" // ✅ highlight ảnh đang chọn
                                }}
                            />
                        </div>
                    );
                })
            ) : (
                <></>
            )}
        </div >
    );
}

export default ImageSlider;