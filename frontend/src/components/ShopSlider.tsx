import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react'; // Import Swiper
import { Autoplay, Navigation, Pagination } from 'swiper/modules'; // Import các module
import type { ShopType } from '../types/ShopType';
import { apiGetFeaturedShops } from '../api/shop';

export default function ShopSlider() {
    const [shops, setShops] = useState<ShopType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tải danh sách shop nổi bật
        const fetchShops = async () => {
            try {
                const data = await apiGetFeaturedShops();
                setShops(data);
            } catch (error) {
                console.error("Lỗi tải shop nổi bật:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    if (loading || shops.length === 0) {
        // (Có thể return một spinner/skeleton ở đây)
        return null;
    }

    return (
        <div className="container my-5">
            <Swiper
                // Thêm các module
                modules={[Autoplay]}
                // Khoảng cách giữa các slide
                spaceBetween={20}
                // Số slide mặc định (cho mobile)
                slidesPerView={3}
                // Tự chạy
                autoplay={{
                    delay: 1000,
                    disableOnInteraction: false,
                }}
                loop={true}
                // Responsive (Quan trọng)
                breakpoints={{
                    // Khi màn hình >= 576px (SM)
                    576: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                    },
                    // Khi màn hình >= 768px (MD)
                    768: {
                        slidesPerView: 5,
                        spaceBetween: 30,
                    },
                    // Khi màn hình >= 992px (LG)
                    992: {
                        slidesPerView: 5,
                        spaceBetween: 30,
                    },
                }}
                className="featured-shops-swiper"
            >
                {/* 3. Lặp qua danh sách shop */}
                {shops.map(shop => (
                    <SwiperSlide key={shop.id}>
                        <Link to={`/shop/${shop.id}`} className="shop-card-link">
                            <div className="featured-shop-card user-select-none">
                                <img
                                    src={shop.logo_url}
                                    alt={shop.name}
                                    className="shop-logo"
                                />
                                <div className="shop-name mt-2">{shop.name}</div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}