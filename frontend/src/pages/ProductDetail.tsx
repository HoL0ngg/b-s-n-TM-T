import { useParams } from "react-router-dom";
import { images } from "../data/products";
import ImageSlider from "../components/ImageSlider";
import { useState } from "react";


const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    if (!id) return <div><p>Thông tin sản phẩm không tồn tại</p></div>
    // const images = products.filter((p) => p.id == Number(id)).map((p) => p.image)
    const [selectedImageId, setSelectedImageId] = useState<number | null>(images.length > 0 ? images[0].image_id : null);
    const selectedImage = images.find(img => img.image_id === selectedImageId);
    return (
        <div className="container mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-1 border-red">
                        <ImageSlider images={images} onSelect={setSelectedImageId} selectedImageId={selectedImageId} />
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
                    <div className="col-6 border">Column 3</div>
                </div>
            </div>
        </div>

    );
};
export default ProductDetail;
