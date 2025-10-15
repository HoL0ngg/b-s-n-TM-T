import { useEffect } from "react";
import { useParams } from "react-router-dom";
// import { images } from "../data/products";
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
    // const images = products.filter((p) => p.id == Number(id)).map((p) => p.image)
    return (
        <div className="container mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-1 border-red">
                        <ImageSlider images={images} onSelect={setSelectedImage} selectedImageId={selectedImage} />
                    </div>
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
                    <div className="col-6 border">
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
            </div>
            <div className="container">
                <span className="fs-4 ms-4">Chi tiết sản phẩm</span>
            </div>
        </div>

    );
};
export default ProductDetail;
