import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageSlider from "../components/ImageSlider";
import { useState } from "react";
import type { ProductType, ProductImageType } from "../types/ProductType";
import { fecthProductsByID, fecthProductImg } from "../api/products";
import ProductInfo from "../components/ProductInfo";


const ProductDetail = () => {
    const [product, setProduct] = useState<ProductType>();
    const { id } = useParams<{ id: string | undefined }>();
    const [images, setImages] = useState<ProductImageType[]>([]);
    const [selectedImage, setSelectedImage] = useState<ProductImageType>();
    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            try {
                const data = await fecthProductsByID(id);
                // console.log(data);
                setProduct(data);
            } catch (err) {
                console.log(err);
            }
        };
        const loadProductImg = async () => {
            if (!id) return;
            const data = await fecthProductImg(id);
            console.log(data);

            setImages(data);
            if (data.length > 0) {
                setSelectedImage(data[0]);
            }
        }
        loadProduct();
        loadProductImg();
    }, [id]);
    if (!id) return <div><p>Thông tin sản phẩm không tồn tại</p></div>
    return (
        <div className="container mt-5">
            <div className="container">
                <div className="row">

                    <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center">
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
                    </div>

                    <div className="col-12 col-md-6 border">
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
                </div>
            </div >
            <div className="row mt-4 p-3 rounded shadow-sm">
                <span className="fw-bold fs-4">Chi tiết sản phẩm</span>
            </div>
        </div >
    );
};

export default ProductDetail;
