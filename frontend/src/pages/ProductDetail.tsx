import { useParams } from "react-router-dom";
import { images, products } from "../data/products";
import ImageSlider from "../components/ImageSlider";
import ProductInfo from "../components/ProductInfo";
import { useState } from "react";

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    if (!id) return <div className="text-center mt-5"><p>Thông tin sản phẩm không tồn tại</p></div>;

    const [selectedImageId, setSelectedImageId] = useState<number | null>(
        images.length > 0 ? images[0].image_id : null
    );
    const selectedImage = images.find((img) => img.image_id === selectedImageId);
    const product = products.find((p) => p.id === Number(id));

    return (
        <div className="container my-5">
            <div className="row g-4 rounded shadow-sm py-3">

                <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center">
                    <div className="col-12">
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
                    <div className="col-12 mt-3" style={{ width: "100%" }}>
                        <ImageSlider
                            images={images}
                            onSelect={setSelectedImageId}
                            selectedImageId={selectedImageId}
                        />
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <ProductInfo product={product} />

                    <div className="mt-4">
                        <button className="custom-button-addtocart">
                            <i className="fa-solid fa-cart-plus me-2"></i>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mt-4 p-3 rounded shadow-sm">
                <span className="fw-bold fs-4">Chi tiết sản phẩm</span>
            </div>
        </div>
    );
};

export default ProductDetail;
