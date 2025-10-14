import React, { useState } from "react";

// type Image = {
//     url: string;
// };
type Image = {
    image_id: number;
    image_url: string;
    product_id: number;
}
type ImageSliderProps = {
    images: Image[];
    onSelect: (id: number) => void;
    selectedImageId: number | null;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onSelect, selectedImageId }) => {
    return (
        <div className="container text-center">
            {images.length > 0 ? (
                images.map((img) => {
                    const isActive = img.image_id === selectedImageId;
                    return (
                        <div
                            className="col p-2 img-hover-zoom"
                            onClick={() => onSelect(img.image_id)}
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